import fetch from 'node-fetch';
import { ComponentType, createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import config from '../core/config';

const createRender =
    <Props = any>(rootComponent: ComponentType<Props>) =>
    async (data: Props): Promise<Buffer> => {
        const html = renderToStaticMarkup(createElement(rootComponent, data));

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
