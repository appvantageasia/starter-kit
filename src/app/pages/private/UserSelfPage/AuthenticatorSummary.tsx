import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useApolloClient } from '@apollo/client';
import { Space, Typography, Button, notification, Modal, message } from 'antd';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import getApolloErrors from '../../../../server/utils/getApolloErrors';
import * as api from '../../../api';

const AuthenticatorSummary = () => {
    const { t } = useTranslation('userSelf');
    const apolloClient = useApolloClient();

    const onClick = useCallback(() => {
        Modal.confirm({
            title: t('userSelf:authenticatorSettings.setup.disableConfirm.title'),
            icon: <ExclamationCircleOutlined />,
            content: t('userSelf:authenticatorSettings.setup.disableConfirm.description'),
            onOk: async () => {
                try {
                    await apolloClient.mutate<
                        api.DisableAuthenticatorMutation,
                        api.DisableAuthenticatorMutationVariables
                    >({
                        mutation: api.DisableAuthenticatorDocument,
                    });

                    notification.warning({
                        message: t('userSelf:authenticatorSettings.setup.disabledSuccessMessage.title'),
                        description: t('userSelf:authenticatorSettings.setup.disabledSuccessMessage.description'),
                    });
                } catch (error) {
                    const apolloErrors = getApolloErrors(error);

                    if (apolloErrors?.$root) {
                        message.error(apolloErrors?.$root);
                    }
                }
            },
        });
    }, [t, apolloClient]);

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
