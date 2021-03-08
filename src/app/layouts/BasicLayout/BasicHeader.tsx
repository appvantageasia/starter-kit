import { LoginOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useTranslation } from 'react-i18next';
import HeaderLogo from './HeaderLogo';
import HeaderMenu from './HeaderMenu';
import { Header, HeaderContainer, MenuFiller } from './styled';

const BasicHeader = () => {
    const { t } = useTranslation();

    return (
        <Header>
            <HeaderContainer>
                <HeaderLogo />
                <HeaderMenu />
                <MenuFiller />
                <Button icon={<LoginOutlined />} type="dashed">
                    {t('common:signIn')}
                </Button>
                <Button type="primary">{t('common:signUp')}</Button>
            </HeaderContainer>
        </Header>
    );
};

export default BasicHeader;
