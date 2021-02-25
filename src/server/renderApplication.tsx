import { Request, Response, Handler } from 'express';
import { renderToString, renderToStaticMarkup } from 'react-dom/server';
import Helmet from 'react-helmet';
import { StaticRouter } from 'react-router-dom';
import { ServerStyleSheet } from 'styled-components';
import App from '../app/App';
import { RuntimeConfig } from '../app/runtimeConfig';
import createI18Instance from '../shared/createI18nInstance/node';
import Document from './Document';
import config from './config';
import getManifest from './getManifest';

const execute = (req: Request, res: Response): void => {
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

        const { i18n } = createI18Instance({
            currentLocale,
            i18n: config.i18n,
        });

        const appElement = sheet.collectStyles(
            <StaticRouter location={req.url}>
                <App i18n={i18n} runtime={runtime} />
            </StaticRouter>
        );

        const body = renderToString(appElement);
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

const handler: Handler = (req, res, next) => {
    try {
        execute(req, res);
    } catch (error) {
        next(error);
    }
};

export default handler;
