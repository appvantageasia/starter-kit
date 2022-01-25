import { NormalizedCacheObject } from '@apollo/client';
import { ReactElement } from 'react';
import { HelmetData } from 'react-helmet';
import { RuntimeConfig } from '../../app/runtimeConfig';
import { attachPublicPath } from '../utils';

type DocumentProps = {
    htmlAttrs?: { [prop: string]: any };
    bodyAttrs?: { [prop: string]: any };
    body?: string;
    helmet?: HelmetData;
    styleTags?: ReactElement[];
    jsScripts?: string[];
    cssScripts?: string[];
    runtime: RuntimeConfig;
    locale: string;
    apolloState?: NormalizedCacheObject;
};

const Document = ({
    htmlAttrs,
    bodyAttrs,
    helmet,
    body = '',
    styleTags,
    cssScripts,
    jsScripts,
    runtime,
    locale,
    apolloState,
}: DocumentProps) => (
    <html lang={locale} {...htmlAttrs}>
        <head>
            {helmet ? (
                <>
                    {helmet.title.toComponent()}
                    {helmet.meta.toComponent()}
                    {helmet.link.toComponent()}
                </>
            ) : null}
            {cssScripts?.map((url, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <link key={index.toString()} href={attachPublicPath(url)} rel="stylesheet" type="text/css" />
            ))}
            {styleTags}
            <script
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: JSON.stringify(runtime) }}
                data-role="runtime-config"
                type="application/json"
            />
            {apolloState ? (
                <script
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(apolloState).replace(/</g, '\\u003c') }}
                    data-role="initial-apollo-state"
                    type="application/json"
                />
            ) : null}
        </head>
        <body {...bodyAttrs}>
            {/* eslint-disable-next-line react/no-danger */}
            <div dangerouslySetInnerHTML={{ __html: body }} id="root" />
            {jsScripts?.map((url, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <script key={index.toString()} src={attachPublicPath(url)} type="application/javascript" />
            ))}
        </body>
    </html>
);

export default Document;
