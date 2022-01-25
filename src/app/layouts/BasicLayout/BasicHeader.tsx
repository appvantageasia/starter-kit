import { LoginOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAccount } from '../../components/contexts/AccountContextManager';
import HeaderLogo from './HeaderLogo';
import HeaderMenu from './HeaderMenu';
import { Header, HeaderContainer } from './styled';

const BasicHeader = () => {
    const { t } = useTranslation();
    const user = useAccount();
    const navigate = useNavigate();

    return (
        <Header>
            <HeaderContainer>
                <HeaderLogo />
                <HeaderMenu />
                {user ? (
                    <Button icon={<LoginOutlined />} onClick={() => navigate('/private')} type="dashed">
                        {t('common:goToPrivate')}
                    </Button>
                ) : (
                    <Button onClick={() => navigate('/private/signIn')} type="primary">
                        {t('common:signIn')}
                    </Button>
                )}
            </HeaderContainer>
        </Header>
    );
};

export default BasicHeader;
