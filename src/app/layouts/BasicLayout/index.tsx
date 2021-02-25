import { ReactElement, ReactNode } from 'react';
import { useRuntimeConfig } from '../../runtimeConfig';
import HeaderLogo from './HeaderLogo';
import HeaderMenu from './HeaderMenu';
import { Layout, Header, Content, HeaderContainer, FooterText } from './styled';

const { Footer } = Layout;

export type DefaultLayoutProps = {
    children: ReactElement | ReactNode | null;
};

const BasicLayout = ({ children }: DefaultLayoutProps): ReactElement => {
    const { version } = useRuntimeConfig();

    return (
        <Layout>
            <Header>
                <HeaderContainer>
                    <HeaderLogo />
                    <HeaderMenu />
                </HeaderContainer>
            </Header>
            <Content>{children}</Content>
            <Footer>
                <FooterText type="secondary">here is the footer - version {version}</FooterText>
            </Footer>
        </Layout>
    );
};

export default BasicLayout;
