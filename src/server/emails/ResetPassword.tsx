import { MjmlText } from 'mjml-react';
import { useTranslation } from 'react-i18next';
import urlJoin from 'url-join';
import config from '../core/config';
import { ResetPasswordLink, User } from '../database';
import EmailLayout from './components/EmailLayout';

export type ResetPasswordEmailProps = {
    user: User;
    link: ResetPasswordLink;
};

const ResetPasswordEmail = ({ user, link }: ResetPasswordEmailProps) => {
    const url = urlJoin(config.applicationEndpoint, `/l/${link.secret}`);
    const { t } = useTranslation();

    return (
        <EmailLayout>
            <MjmlText color="#F45E43" font-family="helvetica">
                {t('emails.resetPassword:greeting', { username: user.username })}
            </MjmlText>
            <MjmlText align="center" color="#0000FF" font-family="helvetica">
                <a href={url}>{url}</a>
            </MjmlText>
        </EmailLayout>
    );
};

export default ResetPasswordEmail;
