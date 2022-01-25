import { SettingOutlined, DashboardOutlined } from '@ant-design/icons';
import { Route } from '@ant-design/pro-layout/lib/typings';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const useConsoleMenu = () => {
    const { t } = useTranslation('consoleLayout');

    return useMemo(
        (): Route => ({
            routes: [
                {
                    name: t('consoleLayout:menuItems.overview'),
                    path: '/private/overview',
                    key: 'overview',
                    icon: <DashboardOutlined />,
                },
                {
                    name: t('consoleLayout:menuItems.system'),
                    key: 'system',
                    path: '/private/system',
                    icon: <SettingOutlined />,
                    routes: [
                        {
                            name: t('consoleLayout:menuItems.users'),
                            path: '/private/system/users',
                            key: 'users',
                        },
                    ],
                },
            ],
        }),
        [t]
    );
};

export default useConsoleMenu;
