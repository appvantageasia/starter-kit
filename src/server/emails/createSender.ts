import { render, Mjml2HtmlOptions } from 'mjml-react';
import { Transporter, SendMailOptions } from 'nodemailer';
import { ComponentType, createElement } from 'react';
import config from '../config';
import { defaultTransporter } from './transporters';

export type SenderOptions<Props> = Omit<SendMailOptions, 'text' | 'html'> & {
    data: Props;
    mjmlOptions?: Mjml2HtmlOptions;
};

export const defaultMjmlOptions: Mjml2HtmlOptions = {};

const createSender = <Props = any>(rootComponent: ComponentType<Props>) => (
    { data, mjmlOptions = defaultMjmlOptions, ...options }: SenderOptions<Props>,
    transporter: Transporter = defaultTransporter
): Promise<any> => {
    const { html, errors } = render(createElement(rootComponent, data), mjmlOptions);

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
