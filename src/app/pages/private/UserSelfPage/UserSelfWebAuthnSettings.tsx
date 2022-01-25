import { CheckCircleFilled, ExclamationCircleOutlined } from '@ant-design/icons';
import { ApolloError, useApolloClient } from '@apollo/client';
import { Card, Button, Typography, Table, notification, message, Modal, Space, Tooltip } from 'antd';
import { flow, set, get } from 'lodash/fp';
import { useCallback, useMemo } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import * as api from '../../../api';
import { useAccount } from '../../../components/contexts/AccountContextManager';
import { base64ToArrayBuffer, arrayBufferToBase64 } from '../../../utilities/buffer';

const convertResponse = (credential: Credential) => {
    const convertBufferPathToString = (path: string) => set(path, arrayBufferToBase64(get(path, credential)));

    return flow([
        convertBufferPathToString('rawId'),
        convertBufferPathToString('response.attestationObject'),
        convertBufferPathToString('response.clientDataJSON'),
    ])(credential);
};

const UserSelfWebAuthnSettings = () => {
    const { t } = useTranslation(['userSelf', 'common']);
    const apolloClient = useApolloClient();
    const account = useAccount();

    const userInfo = useMemo(
        () => ({
            id: base64ToArrayBuffer(btoa(account.id)),
            name: account.username,
            displayName: account.displayName,
        }),
        [account]
    );

    const { data, refetch, loading } = api.useGetAuthenticatedUserWebAuthnKeysQuery({
        fetchPolicy: 'cache-and-network',
    });

    const revokeKey = useCallback(
        (keyId: string) => {
            Modal.confirm({
                title: t('userSelf:webAuthnSettings.revokeModal.title'),
                icon: <ExclamationCircleOutlined />,
                content: t('userSelf:webAuthnSettings.revokeModal.content'),
                okText: t('userSelf:webAuthnSettings.revokeModal.okText'),
                okType: 'danger',
                cancelText: t('userSelf:webAuthnSettings.revokeModal.cancelText'),
                onOk: async () => {
                    try {
                        const results = await apolloClient.mutate<
                            api.RevokeWebPublicKeyCredentialMutation,
                            api.RevokeWebPublicKeyCredentialMutationVariables
                        >({
                            mutation: api.RevokeWebPublicKeyCredentialDocument,
                            variables: { keyId },
                        });

                        const rawKeyId = results.data?.revokeWebPublicKeyCredential;

                        if (rawKeyId) {
                            // check the persisted key ID on local
                            const persistedKeyId = localStorage.getItem('app:webauthnKeyId');

                            if (persistedKeyId === rawKeyId) {
                                // unset it
                                localStorage.removeItem('app:webauthnKeyId');
                            }

                            // also refetch keys
                            refetch();

                            // notify the user
                            // display a notification
                            notification.success({
                                message: t('userSelf:webAuthnSettings.deleteMessage.title'),
                                description: t('userSelf:webAuthnSettings.deleteMessage.description'),
                                duration: 10,
                            });
                        }
                    } catch (error) {
                        if (error instanceof ApolloError) {
                            message.error(error.graphQLErrors[0].message);
                        }
                    }
                },
            });
        },
        [apolloClient, refetch, t]
    );

    const setupNewKey = useCallback(async () => {
        const { data: request } = await apolloClient.mutate<
            api.RequestWebPublicKeyCredentialRegistrationMutation,
            api.RequestWebPublicKeyCredentialRegistrationMutationVariables
        >({ mutation: api.RequestWebPublicKeyCredentialRegistrationDocument });

        const { options, token } = request.requestWebPublicKeyCredentialRegistration;
        const attestation = {
            ...options,
            user: userInfo,
            challenge: base64ToArrayBuffer(options.challenge),
        };

        const credential = await navigator.credentials.create({ publicKey: attestation });
        const response = convertResponse(credential);

        const { data } = await apolloClient.mutate<
            api.CompleteWebPublicKeyCredentialRegistrationMutation,
            api.CompleteWebPublicKeyCredentialRegistrationMutationVariables
        >({
            mutation: api.CompleteWebPublicKeyCredentialRegistrationDocument,
            variables: { token, response },
        });

        if (data?.completeWebPublicKeyCredentialRegistration) {
            // set the key as active in local storage
            localStorage.setItem('app:webauthnKeyId', response.rawId);

            // refetch keys
            refetch();

            // display a notification
            notification.success({
                message: t('userSelf:webAuthnSettings.successMessage.title'),
                description: t('userSelf:webAuthnSettings.successMessage.description'),
                duration: 10,
            });
        }
    }, [apolloClient, userInfo, refetch, t]);

    const keys = useMemo(
        () =>
            (data?.currentUser?.webAuthnKeys || [])
                .map(key => ({
                    ...key,
                    expiresAt: new Date(key.expiresAt),
                    lastUsed: key.lastUsed ? new Date(key.lastUsed) : null,
                }))
                .sort((a, b) => {
                    const diffOnLastUsed = (b.lastUsed?.getTime() || Infinity) - (a.lastUsed?.getTime() || Infinity);

                    if (diffOnLastUsed === 0 || Number.isNaN(diffOnLastUsed)) {
                        return b.expiresAt.getTime() - a.expiresAt.getTime();
                    }

                    return diffOnLastUsed;
                }),
        [data]
    );

    const currentKeyId = localStorage.getItem('app:webauthnKeyId');

    return (
        <Card size="small" title={t('userSelf:webAuthnSettings.title')}>
            <Typography.Paragraph>
                <Trans
                    components={{
                        // eslint-disable-next-line jsx-a11y/anchor-has-content, jsx-a11y/control-has-associated-label
                        webauthn: <a href="https://webauthn.guide/" title="WebAuthn Guide" />,
                    }}
                    i18nKey="userSelf:webAuthnSettings.introductionText"
                />
            </Typography.Paragraph>
            <Table
                dataSource={keys}
                loading={keys.length === 0 && loading}
                pagination={false}
                rowKey="id"
                size="middle"
            >
                <Table.Column<typeof keys[number]>
                    key="userAgent"
                    dataIndex="userAgent"
                    render={(value, record) => {
                        if (record.rawKeyId === currentKeyId) {
                            return (
                                <Space>
                                    <Typography.Text>{value}</Typography.Text>
                                    <Tooltip title={t('userSelf:webAuthnSettings.table.activeTooltip')}>
                                        <Typography.Text type="success">
                                            <CheckCircleFilled />
                                        </Typography.Text>
                                    </Tooltip>
                                </Space>
                            );
                        }

                        return value;
                    }}
                    title={t('userSelf:webAuthnSettings.table.titles.userAgent')}
                />
                <Table.Column
                    key="expiresAt"
                    align="right"
                    dataIndex="expiresAt"
                    render={value => (
                        <Typography.Text style={{ whiteSpace: 'nowrap' }}>
                            {t('common:formats.dateTime', { date: value })}
                        </Typography.Text>
                    )}
                    title={t('userSelf:webAuthnSettings.table.titles.expiresAt')}
                />
                <Table.Column
                    key="lastUsed"
                    align="right"
                    dataIndex="lastUsed"
                    render={value => (
                        <Typography.Text style={{ whiteSpace: 'nowrap' }}>
                            {value ? t('common:formats.dateTime', { date: value }) : '-'}
                        </Typography.Text>
                    )}
                    title={t('userSelf:webAuthnSettings.table.titles.lastUsed')}
                />
                <Table.Column<typeof keys[number]>
                    key="actions"
                    align="right"
                    render={(value, record) => (
                        <Button onClick={() => revokeKey(record.id)} size="small" type="dashed" danger>
                            {t('userSelf:webAuthnSettings.revokeButton')}
                        </Button>
                    )}
                    title={t('userSelf:webAuthnSettings.table.titles.actions')}
                />
            </Table>
            <br />
            <div style={{ textAlign: 'right' }}>
                <Button onClick={setupNewKey} type="primary">
                    {t('userSelf:webAuthnSettings.createButton')}
                </Button>
            </div>
        </Card>
    );
};

export default UserSelfWebAuthnSettings;
