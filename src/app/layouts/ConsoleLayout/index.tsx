import ProLayout, { BasicLayoutProps } from '@ant-design/pro-layout';
import React, { useCallback, Suspense } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import LoadingElement from '../../components/LoadingElement';
import ErrorBoundary from '../ErrorBoundary';
import ConsoleRightContent from './ConsoleRightContent';
import useConsoleMenu from './useConsoleMenu';

export type ConsoleLayoutProps = {
    children: JSX.Element;
};

const itemRender = route => <Link to={route.path}>{route.breadcrumbName}</Link>;

const rightContentRender = () => <ConsoleRightContent />;

const ConsoleLayout = ({ children }: ConsoleLayoutProps) => {
    const navigate = useNavigate();
    const location = useLocation();

    const onMenuHeaderClick = useCallback(
        (event: React.MouseEvent<HTMLDivElement>) => {
            event.stopPropagation();
            event.preventDefault();
            navigate('/private');
        },
        [navigate]
    );

    const menuItemRender = useCallback<Exclude<BasicLayoutProps['menuItemRender'], undefined | false>>(
        (menuItemProps, defaultDom) => {
            if (menuItemProps.isUrl || menuItemProps.children) {
                return defaultDom;
            }

            if (menuItemProps.path && location.pathname !== menuItemProps.path) {
                return (
                    <Link target={menuItemProps.target} to={menuItemProps.path}>
                        {defaultDom}
                    </Link>
                );
            }

            return defaultDom;
        },
        [location]
    );

    const rootRoute = useConsoleMenu();

    return (
        <ProLayout
            headerTheme="light"
            itemRender={itemRender}
            layout="mix"
            location={location}
            menuItemRender={menuItemRender}
            navTheme="light"
            onMenuHeaderClick={onMenuHeaderClick}
            primaryColor="#1890ff"
            rightContentRender={rightContentRender}
            route={rootRoute}
            theme="dark"
            title="Autovantage"
            fixSiderbar
            fixedHeader
        >
            <Suspense fallback={<LoadingElement />}>
                <ErrorBoundary>{children}</ErrorBoundary>
            </Suspense>
        </ProLayout>
    );
};

export default ConsoleLayout;
