import { Layout as AntLayout, Typography, Menu as AntMenu } from 'antd';
import styled from 'styled-components';

export const Content = styled(AntLayout.Content)`
    margin-top: ${props => `${parseInt(props.theme.antd['layout-header-height'], 10) + 10}px`};
    padding: ${props => props.theme.antd['layout-body-padding']};
`;

export const FooterText = styled(Typography.Paragraph)`
    text-align: center;
`;

export const Header = styled(AntLayout.Header)`
    position: fixed;
    width: 100%;
    top: 0;
    right: 0;
    padding: 0;
`;

export const HeaderContainer = styled.div`
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    padding: ${props => props.theme.antd['layout-header-padding']};
`;

export const Layout = styled(AntLayout)`
    max-width: ${props => props.theme.antd['layout-max-width']};
    margin: 0 auto;
`;

export const LogoContainer = styled.div`
    a,
    a:hover,
    a:focus {
        color: ${props => props.theme.antd['heading-color']};
        font-size: 1.25em;
        text-decoration: none;
        line-height: inherit;
    }

    img {
        height: 32px;
        margin-right: 16px;
        top: -1.5px;
    }
`;

const EnhancedMenu = props => <AntMenu {...props} theme="light" />;

export const Menu = styled(EnhancedMenu)`
    margin-left: 16px;
    line-height: 60px !important;
    height: 62px;
    border-bottom: none;
    flex: auto;
`;
