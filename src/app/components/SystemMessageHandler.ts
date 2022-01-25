import { useApolloClient } from '@apollo/client';
import { Modal } from 'antd';
import { useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ListenOnSystemDocument, ListenOnSystemSubscription, ListenOnSystemSubscriptionVariables } from '../api';
import { useAccountContext } from './contexts/AccountContextManager';

const SystemMessageHandler = () => {
    const { logout } = useAccountContext();
    const apolloClient = useApolloClient();

    const { t } = useTranslation(['common']);

    const messageHandler = useCallback(
        (message: ListenOnSystemSubscription['message']) => {
            switch (message.__typename) {
                // sign out if the session is revoked
                case 'UserSessionRevoked':
                    // logout
                    logout();

                    if (message.displayNotice) {
                        // and inform the user as requested
                        // we may skip the notice if the user logged out itself for example
                        Modal.warning({
                            title: t('common:sessionRevokeNotice.title'),
                            content: t('common:sessionRevokeNotice.content'),
                            okText: t('common:sessionRevokeNotice.okText'),
                        });
                    }
                    break;

                default:
                    break;
            }
        },
        [logout, t]
    );

    const messageHandlerRef = useRef(messageHandler);

    // update the reference
    // we use a reference so we don't trigger updates on the next useEffect
    // otherwise it would keep subscribing/unsubscribing for changes not related
    messageHandlerRef.current = messageHandler;

    useEffect(() => {
        const observer = apolloClient.subscribe<ListenOnSystemSubscription, ListenOnSystemSubscriptionVariables>({
            query: ListenOnSystemDocument,
        });

        const subscription = observer.subscribe(({ data }) => {
            if (messageHandlerRef.current) {
                messageHandlerRef.current(data.message);
            }
        });

        return () => subscription.unsubscribe();
    }, [apolloClient, messageHandlerRef]);

    return null;
};

export default SystemMessageHandler;
