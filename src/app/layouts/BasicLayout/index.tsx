import { ReactElement, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useRuntimeConfig } from '../../runtimeConfig';
import ErrorBoundary from '../ErrorBoundary';
import BasicHeader from './BasicHeader';
import { Layout, Content, FooterText } from './styled';

const { Footer } = Layout;

export type DefaultLayoutProps = {
    children: ReactElement | ReactNode | null;
};

const BasicLayout = ({ children }: DefaultLayoutProps): ReactElement => {
    const { version } = useRuntimeConfig();
    const location = useLocation();

    return (
        <Layout>
            <BasicHeader />
            <Content>
                <ErrorBoundary cacheKey={location.pathname}>{children}</ErrorBoundary>
            </Content>
            <Footer>
                <FooterText type="secondary">here is the footer - version {version}</FooterText>
            </Footer>
        </Layout>
    );
};

export default BasicLayout;
