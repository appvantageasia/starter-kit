import { i18n as I18n } from 'i18next';
import mjml2html from 'mjml';
import { Mjml2HtmlOptions } from 'mjml-react';
import { Transporter, SendMailOptions } from 'nodemailer';
import { ComponentType, createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import config from '../core/config';
import { defaultTransporter } from './transporters';

export type SenderOptions<Props> = Omit<SendMailOptions, 'text' | 'html'> & {
    data: Props;
    i18n: I18n;
    mjmlOptions?: Mjml2HtmlOptions;
};

export const defaultMjmlOptions: Mjml2HtmlOptions = {};

const createSender =
    <Props = any>(rootComponent: ComponentType<Props>) =>
    (
        { data, mjmlOptions = null, i18n, ...options }: SenderOptions<Props>,
        transporter: Transporter = defaultTransporter
    ): Promise<any> => {
        const mailElement = createElement(rootComponent, data);
        const rootElement = createElement(
            I18nextProvider,
            {
                // we forcefully disable Suspense on React as we are truly looking for markup here
                i18n: i18n.cloneInstance({ react: { useSuspense: false } }),
            },
            mailElement
        );
        const input = renderToStaticMarkup(rootElement);

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
