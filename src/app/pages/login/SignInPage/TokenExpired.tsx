import { Alert, Button, Space } from 'antd';
import { useTranslation } from 'react-i18next';

export type TokenExpiredProps = { onLinkClick: () => void };

const TokenExpired = ({ onLinkClick }: TokenExpiredProps) => {
    const { t } = useTranslation(['signInPage']);

    return (
        <Space direction="vertical" style={{ width: '100%' }}>
            <Alert description={t('signInPage:expiredToken.description')} type="warning" showIcon />
            <Button htmlType="button" onClick={onLinkClick} type="dashed" block>
                {t('signInPage:expiredToken.authenticateLink')}
            </Button>
        </Space>
    );
};

export default TokenExpired;
