import { ReactElement } from 'react';
import { HelmetData } from 'react-helmet';
import { RuntimeConfig } from '../app/runtimeConfig';
import config from './config';
import { attachPublicPath } from './utils';

type DocumentProps = {
    htmlAttrs?: { [prop: string]: any };
    bodyAttrs?: { [prop: string]: any };
    body: string;
    helmet: HelmetData;
    styleTags?: ReactElement[];
    jsScripts?: string[];
    cssScripts?: string[];
    runtime: RuntimeConfig;
};

const Document = ({ htmlAttrs, bodyAttrs, helmet, body, styleTags, cssScripts, jsScripts, runtime }: DocumentProps) => (
    <html lang={config.i18n.defaultLocale} {...htmlAttrs}>
        <head>
            {helmet.title.toComponent()}
            {helmet.meta.toComponent()}
            {helmet.link.toComponent()}
            {cssScripts?.map((url, index) => (
                <link key={index.toString()} href={attachPublicPath(url)} rel="stylesheet" type="text/css" />
            ))}
            {styleTags}
            <script
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: JSON.stringify(runtime) }}
                data-role="runtime-config"
                type="application/json"
            />
        </head>
        <body {...bodyAttrs}>
            {/* eslint-disable-next-line react/no-danger */}
            <div dangerouslySetInnerHTML={{ __html: body }} id="root" />
            {jsScripts?.map((url, index) => (
                <script key={index.toString()} src={attachPublicPath(url)} type="application/javascript" />
            ))}
        </body>
    </html>
);

export default Document;
