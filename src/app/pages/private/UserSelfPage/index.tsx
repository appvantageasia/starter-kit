import { Space } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ConsolePageWithHeader from '../../../layouts/ConsoleLayout/ConsolePageWithHeader';
import UserSelfAuthenticatorSettings from './UserSelfAuthenticatorSettings';
import UserSelfGeneralSettings from './UserSelfGeneralSettings';
import UserSelfPasswordSettings from './UserSelfPasswordSettings';
import UserSelfSessions from './UserSelfSessions';
import UserSelfWebAuthnSettings from './UserSelfWebAuthnSettings';

let isUserVerifyingPlatformAuthenticatorAvailable = false;

const UserSelfPage = () => {
    const { t } = useTranslation('userSelf');
    const [mayWebAuthn, setMayWebAuthn] = useState(isUserVerifyingPlatformAuthenticatorAvailable);

    useEffect(() => {
        if (PublicKeyCredential) {
            PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable().then(result => {
                isUserVerifyingPlatformAuthenticatorAvailable = result;
                setMayWebAuthn(result);
            });
        }
    }, [setMayWebAuthn]);

    return (
        <ConsolePageWithHeader subTitle={t('userSelf:subTitle')} title={t('userSelf:title')}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <UserSelfGeneralSettings />
                <UserSelfAuthenticatorSettings />
                <UserSelfPasswordSettings />
                {mayWebAuthn && <UserSelfWebAuthnSettings />}
                <UserSelfSessions />
            </Space>
        </ConsolePageWithHeader>
    );
};

export default UserSelfPage;
