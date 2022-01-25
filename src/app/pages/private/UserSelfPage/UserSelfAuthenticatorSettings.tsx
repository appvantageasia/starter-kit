import { CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { Badge, Card, Space } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from '../../../components/contexts/AccountContextManager';
import AuthenticatorIntroduction from './AuthenticatorIntroduction';
import AuthenticatorSetup from './AuthenticatorSetup';
import AuthenticatorSummary from './AuthenticatorSummary';

const UserSelfAuthenticatorSettings = () => {
    const { t } = useTranslation('userSelf');
    const { isAuthenticatorEnabled } = useAccount();

    const [step, setStep] = useState(isAuthenticatorEnabled ? 'summary' : 'introduction');

    const content = (() => {
        switch (step) {
            case 'introduction':
                return <AuthenticatorIntroduction next={() => setStep('setup')} />;

            case 'setup':
                return <AuthenticatorSetup next={() => setStep('summary')} previous={() => setStep('introduction')} />;

            case 'summary':
                return <AuthenticatorSummary />;

            default:
                return null;
        }
    })();

    return (
        <Badge.Ribbon
            color={isAuthenticatorEnabled ? 'green' : 'red'}
            text={
                isAuthenticatorEnabled ? (
                    <Space>
                        <CheckCircleOutlined />
                        {t('userSelf:authenticatorSettings.badge.enabled')}
                    </Space>
                ) : (
                    <Space>
                        <WarningOutlined />
                        {t('userSelf:authenticatorSettings.badge.disabled')}
                    </Space>
                )
            }
        >
            <Card size="small" title={t('userSelf:authenticatorSettings.title')}>
                {content}
            </Card>
        </Badge.Ribbon>
    );
};

export default UserSelfAuthenticatorSettings;
