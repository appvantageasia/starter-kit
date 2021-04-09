import { Link } from 'react-router-dom';
import usePublic from '../../utilities/usePublic';
import { LogoContainer } from './styled';

const HeaderLogo = () => {
    const logo = usePublic('logo.svg');

    return (
        <LogoContainer>
            <Link to="/">
                <img alt="logo" src={logo} />
                Next Starter
            </Link>
        </LogoContainer>
    );
};

export default HeaderLogo;
