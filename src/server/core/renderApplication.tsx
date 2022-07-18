import { ApolloClient, InMemoryCache } from '@apollo/client';
import { SchemaLink } from '@apollo/client/link/schema';
import { getDataFromTree } from '@apollo/client/react/ssr';
import chalk from 'chalk';
import { Request, Response, Handler } from 'express';
import { renderToStaticMarkup } from 'react-dom/server';
import Helmet from 'react-helmet';
import { StaticRouter } from 'react-router-dom/server';
import { ServerStyleSheet } from 'styled-components';
import App from '../../app/App';
import introspection from '../../app/api/introspection';
import { RuntimeConfig } from '../../app/runtimeConfig';
import { getDefaultLocale } from '../database';
import schema from '../schema';
import createContext from '../schema/context';
import createI18Instance from '../utils/createI18nInstance';
import Document from './Document';
import config from './config';
import getManifest from './getManifest';

const getRuntime = async (withSSR = false): Promise<RuntimeConfig> => {
    // todo detect the local from the browser at first
    const currentLocale = await getDefaultLocale();

    return {
        version: config.version,
        publicPath: config.publicPath,
        defaultLocale: currentLocale,
        locales: config.i18n.locales,
        sentry: config.sentry,
        withSSR,
    };
};

const renderWithoutSSR = async () => {
    const runtime = await getRuntime();
    const { css, js } = getManifest();

    return <Document cssScripts={css} jsScripts={js} locale={runtime.defaultLocale} runtime={runtime} />;
};

const renderWithSSR = async (req: Request, res: Response) => {
    const sheet = new ServerStyleSheet();

    try {
        const runtime = await getRuntime(true);

        // create graphql context
        const graphqlContext = await createContext(req, res);

        const { i18n } = await createI18Instance(runtime.defaultLocale);

        // create a schema link then apollo client
        const schemaLink = new SchemaLink({ schema, rootValue: null, context: graphqlContext });
        const apolloClient = new ApolloClient({
            ssrMode: true,
            link: schemaLink,
            cache: new InMemoryCache({ possibleTypes: introspection.possibleTypes }),
        });

        // get the element
        const appElement = sheet.collectStyles(
            <StaticRouter location={req.url}>
                <App createApolloClient={() => apolloClient} i18n={i18n} runtime={runtime} />
            </StaticRouter>
        );

        // generate the body
        const body = await getDataFromTree(appElement);

        // Extract the entirety of the Apollo Client cache's current state
        const apolloState = apolloClient.extract();

        const helmet = Helmet.renderStatic();
        const styleTags = sheet.getStyleElement();
        const { css, js } = getManifest();

        return (
            <Document
                apolloState={apolloState}
                body={body}
                cssScripts={css}
                helmet={helmet}
                jsScripts={js}
                locale={runtime.defaultLocale}
                runtime={runtime}
                styleTags={styleTags}
            />
        );
    } finally {
        sheet.seal();
    }
};

const externalCdn = config.publicPath.startsWith('http')
    ? // we are using a CDN for serving the assets
      new URL(config.publicPath).hostname
    : null;

const useIstanbul = !!global.__coverage__;

// generate CSP rule
const cspRule = `${[
    'script-src',
    "'self'",
    externalCdn,
    useIstanbul && "'unsafe-eval'",
    ';',
    'worker-src',
    "'self' blob: ",
]
    .filter(Boolean)
    .join(' ')};`;

if (useIstanbul) {
    console.info(chalk.redBright('Unsafe-Eval is granted in the Content-Security-Policy rule (Istanbul support)'));
}

const execute = async (req: Request, res: Response): Promise<void> => {
    /*
     * todo SSR is forcefully disabled for now
     * There's much instability between Helmet, Apollo, Styled while using React 18
     */
    const withSSR = false;
    const document = await (withSSR ? renderWithSSR(req, res) : renderWithoutSSR());

    const html = `<!doctype html>${renderToStaticMarkup(document)}`;

    res.set({
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'X-Xss-Protection': '"1; mode=block"',
        'Content-Security-Policy': cspRule,
    });

    res.send(html);
};

const handler: Handler = async (req, res, next) => {
    try {
        await execute(req, res);
    } catch (error) {
        next(error);
    }
};

export default handler;
