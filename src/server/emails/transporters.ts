import { createTransport, Transporter } from 'nodemailer';
import config from '../config';

export type SMTPSettings = {
    host: string;
    port: number;
    secure: boolean;
    auth?: {
        user: string;
        pass: string;
    };
};

export const createSMTPTransports = (settings: SMTPSettings): Transporter => createTransport(settings);

export const defaultTransporter = createSMTPTransports(config.smtp.transporter);
