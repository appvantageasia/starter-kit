import { Alert } from 'antd';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const StyledAlert = styled(Alert)`
    margin-bottom: ${props => props.theme.verticalSpacing};
`;

const WelcomeAlert = () => {
    const { t } = useTranslation(['common']);

    return <StyledAlert description={t('common:welcome')} message={t('common:welcomeTitle')} type="info" showIcon />;
};

export default WelcomeAlert;
