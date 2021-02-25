import { Menu as AntMenu } from 'antd';
import { useCallback, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { Menu } from './styled';

const { SubMenu, ItemGroup, Item } = AntMenu;

type ItemMeta = { key: string; label: string; type: 'item'; href: string };

type GroupMeta = { key: string; label: string; items: ItemMeta[]; type: 'group' };

type SubMenuMeta = { key: string; label: string; items: (ItemMeta | GroupMeta)[]; type: 'subMenu' };

const staticMenu: (ItemMeta | SubMenuMeta)[] = [
    { key: '1', label: 'nav 1', type: 'item', href: '/' },
    { key: '2', label: 'nav 2', type: 'item', href: '/test' },
    {
        type: 'subMenu',
        key: 'subMenu',
        label: 'Navigation Three - Submenu',
        items: [
            {
                key: 'group:1',
                type: 'group',
                label: 'Item 1',
                items: [
                    { key: 'settings:1', label: 'Option 1', type: 'item', href: '/b' },
                    { key: 'settings:2', label: 'Option 2', type: 'item', href: '/c' },
                ],
            },
            {
                key: 'group:2',
                type: 'group',
                label: 'Item 2',
                items: [
                    { key: 'settings:3', label: 'Option 3', type: 'item', href: '/d' },
                    { key: 'settings:4', label: 'Option 4', type: 'item', href: '/e' },
                ],
            },
        ],
    },
];

type MenuMap = { [key: string]: string };

const computeMenuMap = (items: (ItemMeta | GroupMeta | SubMenuMeta)[]): MenuMap =>
    items.reduce((acc, item) => {
        switch (item.type) {
            case 'item':
                return { ...acc, [item.key]: item.href };

            case 'subMenu':
            case 'group':
                return { ...acc, ...computeMenuMap(item.items) };

            default:
                return acc;
        }
    }, {});

const renderMenuLevel = (level: ItemMeta | GroupMeta | SubMenuMeta) => {
    switch (level.type) {
        case 'item':
            return <Item key={level.key}>{level.label}</Item>;

        case 'group':
            return (
                <ItemGroup key={level.key} title={level.label}>
                    {level.items.map(renderMenuLevel)}
                </ItemGroup>
            );

        case 'subMenu':
            return (
                <SubMenu key={level.key} title={level.label}>
                    {level.items.map(renderMenuLevel)}
                </SubMenu>
            );

        default:
            return null;
    }
};

const getSelectedKeys = (menuMap: MenuMap, pathname: string): string[] | undefined => {
    for (const [key, value] of Object.entries(menuMap)) {
        if (value === pathname) {
            return [key];
        }
    }

    return undefined;
};

const HeaderMenu = () => {
    const history = useHistory();
    const { location } = history;

    const menu = useMemo(() => staticMenu, []);
    const menuMap = useMemo(() => computeMenuMap(menu), [menu]);
    const selectedKeys = useMemo(() => getSelectedKeys(menuMap, location.pathname), [menuMap, location.pathname]);

    const onSelect = useCallback(
        ({ key }) => {
            const pathname = menuMap[key];

            if (pathname) {
                history.push(pathname);
            }
        },
        [menuMap, history]
    );

    return (
        <Menu mode="horizontal" onSelect={onSelect} selectedKeys={selectedKeys}>
            {menu.map(renderMenuLevel)}
        </Menu>
    );
};

export default HeaderMenu;
