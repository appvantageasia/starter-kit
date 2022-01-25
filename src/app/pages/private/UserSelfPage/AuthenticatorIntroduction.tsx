import { Typography, Button } from 'antd';
import { useTranslation } from 'react-i18next';

export type AuthenticatorIntroductionProps = {
    next: () => void;
};

const AuthenticatorIntroduction = ({ next }: AuthenticatorIntroductionProps) => {
    const { t } = useTranslation('userSelf');

    return (
        <>
            <Typography.Paragraph>{t('userSelf:authenticatorSettings.introduction.text')}</Typography.Paragraph>
            <div style={{ textAlign: 'right' }}>
                <Button onClick={next} type="primary">
                    {t('userSelf:authenticatorSettings.introduction.submitButton')}
                </Button>
            </div>
        </>
    );
};

export default AuthenticatorIntroduction;
