import { Result } from 'antd';
import { useTranslation } from 'react-i18next';

const ErrorPage = () => {
    const { t } = useTranslation(['common']);

    return <Result status="500" subTitle={t('common:errors:500:description')} title={t('common:errors:500:title')} />;
};

export default ErrorPage;
