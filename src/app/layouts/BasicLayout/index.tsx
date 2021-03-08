import { ReactElement, ReactNode } from 'react';
import { useRuntimeConfig } from '../../runtimeConfig';
import BasicHeader from './BasicHeader';
import { Layout, Content, FooterText } from './styled';

const { Footer } = Layout;

export type DefaultLayoutProps = {
    children: ReactElement | ReactNode | null;
};

const BasicLayout = ({ children }: DefaultLayoutProps): ReactElement => {
    const { version } = useRuntimeConfig();

    return (
        <Layout>
            <BasicHeader />
            <Content>{children}</Content>
            <Footer>
                <FooterText type="secondary">here is the footer - version {version}</FooterText>
            </Footer>
        </Layout>
    );
};

export default BasicLayout;
