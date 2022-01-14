import AWS from '@aws-sdk/client-ses';
import { createTransport, Transporter } from 'nodemailer';
import config, { AWSSESSettings, MailerSettings, SMTPSettings } from '../core/config';

export const createSMTPTransports = (transporterSettings: MailerSettings): Transporter => {
    const { provider, ...settings } = transporterSettings;

    switch (provider) {
        case 'smtp':
            return createTransport(settings as SMTPSettings);

        case 'aws': {
            const ses = new AWS.SES(settings as AWSSESSettings);

            return createTransport({ SES: { ses, aws: AWS } });
        }

        default:
            throw new Error('Unsupported provider');
    }
};

export const defaultTransporter = createSMTPTransports(config.smtp.transporter);
