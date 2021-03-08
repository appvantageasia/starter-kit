import { Result } from 'antd';
import { useTranslation } from 'react-i18next';
import { withErrorBoundary } from '../layouts/RoutedErrorBoundary';

const NotFoundPage = () => {
    const { t } = useTranslation(['common']);

    return <Result status="404" subTitle={t('common:errors:404:description')} title={t('common:errors:404:title')} />;
};

export default withErrorBoundary(NotFoundPage);
