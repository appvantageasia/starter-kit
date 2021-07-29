import mjml2html from 'mjml';
import { Mjml2HtmlOptions } from 'mjml-react';
import { Transporter, SendMailOptions } from 'nodemailer';
import { ComponentType, createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import config from '../core/config';
import { defaultTransporter } from './transporters';

export type SenderOptions<Props> = Omit<SendMailOptions, 'text' | 'html'> & {
    data: Props;
    mjmlOptions?: Mjml2HtmlOptions;
};

export const defaultMjmlOptions: Mjml2HtmlOptions = {};

const createSender =
    <Props = any>(rootComponent: ComponentType<Props>) =>
    (
        { data, mjmlOptions = null, ...options }: SenderOptions<Props>,
        transporter: Transporter = defaultTransporter
    ): Promise<any> => {
        const input = renderToStaticMarkup(createElement(rootComponent, data));

        const { html, errors } = mjml2html(input, {
            keepComments: false,
            validationLevel: 'strict',
            ...mjmlOptions,
        });

        if (errors?.length) {
            throw errors[0];
        }

        return transporter.sendMail({
            sender: config.smtp.sender,
            ...options,
            html,
        });
    };

export default createSender;
