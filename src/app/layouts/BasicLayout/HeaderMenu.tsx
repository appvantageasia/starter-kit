import { TFunction } from 'i18next';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu } from './styled';

type ItemMeta = { key: string; label: string; href?: string; children?: ItemMeta[] };

const generateMenu = (t: TFunction): ItemMeta[] => [
    { key: '1', label: t('common:mainMenu.home'), href: '/' },
    {
        key: 'subMenu',
        label: '404/500 pages',
        children: [
            {
                key: 'group:1',
                label: 'Item 1',
                children: [
                    { key: 'settings:1', label: 'Error page', href: '/dummyError' },
                    { key: 'settings:2', label: 'Option 2', href: '/c' },
                ],
            },
            {
                key: 'group:2',
                label: 'Item 2',
                children: [
                    { key: 'settings:3', label: 'Option 3', href: '/d' },
                    { key: 'settings:4', label: 'Option 4', href: '/e' },
                ],
            },
        ],
    },
];

type MenuMap = { [key: string]: string };

const computeMenuMap = (items: ItemMeta[]): MenuMap =>
    items.reduce((acc, item) => {
        if (item.children) {
            return { ...acc, ...computeMenuMap(item.children) };
        }

        if (item.href) {
            return { ...acc, [item.key]: item.href };
        }

        return acc;
    }, {});

const getSelectedKeys = (menuMap: MenuMap, pathname: string): string[] | undefined => {
    for (const [key, value] of Object.entries(menuMap)) {
        if (value === pathname) {
            return [key];
        }
    }

    return undefined;
};

const HeaderMenu = () => {
    const { t } = useTranslation(['common']);
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const menu = useMemo(() => generateMenu(t), [t]);
    const menuMap = useMemo(() => computeMenuMap(menu), [menu]);
    const selectedKeys = useMemo(() => getSelectedKeys(menuMap, pathname), [menuMap, pathname]);

    const onSelect = useCallback(
        ({ key }) => {
            const pathname = menuMap[key];

            if (pathname) {
                navigate(pathname);
            }
        },
        [menuMap, navigate]
    );

    return <Menu items={menu} mode="horizontal" onSelect={onSelect} selectedKeys={selectedKeys} />;
};

export default HeaderMenu;
