import { Link } from 'react-router-dom';
import { LogoContainer } from './styled';

const HeaderLogo = () => (
    <LogoContainer>
        <Link to="/">
            <img alt="logo" src="/public/logo.svg" />
            Next Starter
        </Link>
    </LogoContainer>
);

export default HeaderLogo;
