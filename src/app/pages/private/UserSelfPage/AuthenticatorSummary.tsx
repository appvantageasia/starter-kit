import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Space, Typography, Button, notification, Modal } from 'antd';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

const AuthenticatorSummary = () => {
    const { t } = useTranslation('userSelf');

    const onClick = useCallback(() => {
        Modal.confirm({
            title: t('userSelf:authenticatorSettings.setup.disableConfirm.title'),
            icon: <ExclamationCircleOutlined />,
            content: t('userSelf:authenticatorSettings.setup.disableConfirm.description'),
            onOk() {
                notification.warning({
                    message: t('userSelf:authenticatorSettings.setup.disabledSuccessMessage.title'),
                    description: t('userSelf:authenticatorSettings.setup.disabledSuccessMessage.description'),
                });
            },
        });
    }, [t]);

    return (
        <Space direction="vertical" style={{ width: '100%' }}>
            <Typography.Paragraph>{t('userSelf:authenticatorSettings.summary.introduction')}</Typography.Paragraph>
            <div style={{ textAlign: 'right' }}>
                <Button onClick={onClick} danger>
                    {t('userSelf:authenticatorSettings.summary.disableButton')}
                </Button>
            </div>
        </Space>
    );
};

export default AuthenticatorSummary;
