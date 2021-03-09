import * as Sentry from '@sentry/node';
import { Request, Response, Handler } from 'express';
import { renderToString, renderToStaticMarkup } from 'react-dom/server';
import Helmet from 'react-helmet';
import { StaticRouterContext } from 'react-router';
import { StaticRouter } from 'react-router-dom';
import { ServerStyleSheet } from 'styled-components';
import App from '../app/App';
import { RuntimeConfig } from '../app/runtimeConfig';
import createI18Instance from '../shared/createI18nInstance/node';
import Document from './Document';
import config from './config';
import createApolloClient from './createApolloClient';
import getManifest from './getManifest';
import createContext from './schema/context';

const execute = async (req: Request, res: Response): Promise<void> => {
    const sheet = new ServerStyleSheet();

    try {
        // todo find  way to detect this information
        const currentLocale = 'en';

        const runtime: RuntimeConfig = {
            version: config.version,
            defaultLocale: currentLocale,
            locales: config.i18n.locales,
            sentry: config.sentry,
        };

        // create graphql context
        const graphqlContext = await createContext(req);

        const { i18n } = createI18Instance({
            currentLocale,
            i18n: config.i18n,
        });

        // get the element
        const routerContext: StaticRouterContext = {};
        const appElement = sheet.collectStyles(
            <StaticRouter context={routerContext} location={req.url}>
                <App createApolloClient={createApolloClient(graphqlContext)} i18n={i18n} runtime={runtime} />
            </StaticRouter>
        );

        let body: string;

        try {
            // generate the body
            body = renderToString(appElement);
        } catch (renderingError) {
            // capture it
            console.error(renderingError);
            Sentry.captureException(renderingError);

            // redirect to internal error page
            res.redirect('/500');

            // stop here
            return;
        }

        if (routerContext.url) {
            // redirect as expected
            res.redirect(routerContext.url);

            // stop here
            return;
        }

        const helmet = Helmet.renderStatic();
        const styleTags = sheet.getStyleElement();
        const { css, js } = getManifest();

        const document = (
            <Document
                body={body}
                cssScripts={css}
                helmet={helmet}
                jsScripts={js}
                runtime={runtime}
                styleTags={styleTags}
            />
        );

        const html = `<!doctype html>${renderToStaticMarkup(document)}`;

        res.send(html);
    } finally {
        sheet.seal();
    }
};

const handler: Handler = async (req, res, next) => {
    try {
        await execute(req, res);
    } catch (error) {
        next(error);
    }
};

export default handler;
