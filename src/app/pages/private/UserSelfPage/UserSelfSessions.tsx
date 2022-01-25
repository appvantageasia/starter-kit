import { ExclamationCircleOutlined } from '@ant-design/icons';
import { ApolloError, useApolloClient } from '@apollo/client';
import { Card, Button, Typography, Table, notification, message, Modal } from 'antd';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as api from '../../../api';
import { useSessionID } from '../../../components/contexts/AccountContextManager';

const UserSelfSessions = () => {
    const { t } = useTranslation(['userSelf', 'common']);
    const apolloClient = useApolloClient();

    const currentSessionId = useSessionID();

    const { data, refetch, loading } = api.useGetAuthenticatedUserSessionsQuery({
        fetchPolicy: 'cache-and-network',
    });

    const revokeSession = useCallback(
        (sessionId: string) => {
            Modal.confirm({
                title: t('userSelf:sessions.revokeModal.title'),
                icon: <ExclamationCircleOutlined />,
                content: t('userSelf:sessions.revokeModal.content'),
                okText: t('userSelf:sessions.revokeModal.okText'),
                okType: 'danger',
                cancelText: t('userSelf:sessions.revokeModal.cancelText'),
                onOk: async () => {
                    try {
                        await apolloClient.mutate<api.RevokeSessionMutation, api.RevokeSessionMutationVariables>({
                            mutation: api.RevokeSessionDocument,
                            variables: { sessionId, displayNotice: true },
                        });

                        // also refetch keys
                        refetch();

                        // notify the user
                        // display a notification
                        notification.success({
                            message: t('userSelf:sessions.deleteMessage.title'),
                            description: t('userSelf:sessions.deleteMessage.description'),
                            duration: 10,
                        });
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

    const sessions = useMemo(
        () =>
            (data?.currentUser?.sessions || [])
                .map(key => ({
                    ...key,
                    lastActivityAt: key.lastActivityAt ? new Date(key.lastActivityAt) : null,
                }))
                .sort((a, b) => b.lastActivityAt.getTime() - a.lastActivityAt.getTime()),
        [data]
    );

    return (
        <Card size="small" title={t('userSelf:sessions.title')}>
            <Typography.Paragraph>{t('userSelf:sessions.introductionText')}</Typography.Paragraph>
            <Table
                dataSource={sessions}
                loading={sessions.length === 0 && loading}
                pagination={false}
                rowKey="id"
                size="middle"
            >
                <Table.Column
                    key="userAgent"
                    dataIndex="userAgent"
                    title={t('userSelf:sessions.table.titles.userAgent')}
                />
                <Table.Column key="ip" dataIndex="ip" title={t('userSelf:sessions.table.titles.ip')} />
                <Table.Column
                    key="lastActivityAt"
                    align="right"
                    dataIndex="lastActivityAt"
                    render={value => (
                        <Typography.Text style={{ whiteSpace: 'nowrap' }}>
                            {t('common:formats.dateTime', { date: value })}
                        </Typography.Text>
                    )}
                    title={t('userSelf:sessions.table.titles.lastActivityAt')}
                />
                <Table.Column<typeof sessions[number]>
                    key="actions"
                    align="right"
                    render={(value, record) =>
                        currentSessionId !== record.id ? (
                            <Button onClick={() => revokeSession(record.id)} size="small" type="dashed" danger>
                                {t('userSelf:sessions.revokeButton')}
                            </Button>
                        ) : null
                    }
                    title={t('userSelf:sessions.table.titles.actions')}
                />
            </Table>
        </Card>
    );
};

export default UserSelfSessions;
