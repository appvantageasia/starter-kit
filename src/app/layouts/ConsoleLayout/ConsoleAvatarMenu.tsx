import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { useApolloClient } from '@apollo/client';
import { Menu, MenuProps, message } from 'antd';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import * as api from '../../api';
import { useAccountContext, useSessionID } from '../../components/contexts/AccountContextManager';

const ConsoleAvatarMenu = () => {
    const { t } = useTranslation('consoleLayout');
    const { logout } = useAccountContext();
    const navigate = useNavigate();

    const sessionId = useSessionID();
    const apolloClient = useApolloClient();

    const onClick = useCallback<MenuProps['onClick']>(
        event => {
            switch (event.key) {
                case 'self':
                    navigate('/private/self', { replace: true });
                    break;

                case 'logout':
                    apolloClient
                        .mutate<api.RevokeSessionMutation, api.RevokeSessionMutationVariables>({
                            mutation: api.RevokeSessionDocument,
                            variables: { sessionId, displayNotice: false },
                        })
                        .then(() => {
                            // first unset the session
                            logout();

                            // then go to sign in page
                            navigate('/private/signIn', { replace: true, state: { noWebAuthn: true } });

                            // and finally display a message
                            message.success(t('consoleLayout:messages.successLogout'));
                        });
                    break;

                default:
                    break;
            }
        },
        [navigate, logout, t, apolloClient, sessionId]
    );

    const items = useMemo(
        () => [
            { label: t('consoleLayout:avatarMenuItems.self'), key: 'self', icon: <UserOutlined /> },
            { label: t('consoleLayout:avatarMenuItems.logout'), key: 'logout', icon: <LogoutOutlined /> },
        ],
        [t]
    );

    return <Menu items={items} onClick={onClick} selectedKeys={[]} />;
};

export default ConsoleAvatarMenu;
