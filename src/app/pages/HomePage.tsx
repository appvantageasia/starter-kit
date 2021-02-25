import { Card, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

const HomePage = () => {
    const { t } = useTranslation(['common']);

    return (
        <Card>
            <Typography.Paragraph>{t('common:welcome')}</Typography.Paragraph>
        </Card>
    );
};

export default HomePage;
