import { i18n as I18n } from 'i18next';
import fetch from 'node-fetch';
import { ComponentType, createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import config from '../core/config';

const createRender =
    <Props = any>(rootComponent: ComponentType<Props>) =>
    async (data: Props, i18n: I18n): Promise<Buffer> => {
        const mailElement = createElement(rootComponent, data);
        const rootElement = createElement(
            I18nextProvider,
            {
                // we forcefully disable Suspense on React as we are truly looking for markup here
                i18n: i18n.cloneInstance({ react: { useSuspense: false } }),
            },
            mailElement
        );
        const html = renderToStaticMarkup(rootElement);

        const response = await fetch(config.html2pdf.endpoint, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({ html }),
        });

        if (!response.ok) {
            throw new Error('Failed to render PDF');
        }

        return response.buffer();
    };

export default createRender;
