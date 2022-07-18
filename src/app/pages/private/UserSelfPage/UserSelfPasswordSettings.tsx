import { WarningOutlined, CheckCircleOutlined, LockOutlined } from '@ant-design/icons';
import { Badge, Card, Space, Typography, Button, notification } from 'antd';
import Dayjs from 'dayjs';
import { Formik, Form } from 'formik';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from '../../../components/contexts/AccountContextManager';
import PasswordField from '../../../components/fields/PasswordField';
import useHandleError from '../../../utilities/useHandleError';

const UserSelfPasswordSettings = () => {
    const { t } = useTranslation('userSelf');
    const user = useAccount();

    const [showForm, setShowForm] = useState(false);

    const isNearExpiration = Dayjs(user.passwordExpiresAt).subtract(10, 'day').isBefore(new Date());

    const card = (
        <Card size="small" title={t('userSelf:passwordSettings.title')}>
            {showForm ? (
                <PasswordForm goToIntroduction={() => setShowForm(false)} />
            ) : (
                <Introduction goToForm={() => setShowForm(true)} isNearExpiration={isNearExpiration} />
            )}
        </Card>
    );

    if (user.isPasswordExpired) {
        return (
            <Badge.Ribbon
                color="red"
                text={
                    <Space>
                        <WarningOutlined />
                        {t('userSelf:passwordSettings.badge.expired')}
                    </Space>
                }
            >
                {card}
            </Badge.Ribbon>
        );
    }

    if (isNearExpiration) {
        return (
            <Badge.Ribbon
                color="orange"
                text={
                    <Space>
                        <WarningOutlined />
                        {t('userSelf:passwordSettings.badge.nearExpiration')}
                    </Space>
                }
            >
                {card}
            </Badge.Ribbon>
        );
    }

    const remainingValidity = Dayjs.duration(Dayjs(user.passwordExpiresAt).diff(new Date())).days();

    return (
        <Badge.Ribbon
            color="green"
            text={
                <Space>
                    <CheckCircleOutlined />
                    {t('userSelf:passwordSettings.badge.valid', { days: remainingValidity })}
                </Space>
            }
        >
            {card}
        </Badge.Ribbon>
    );
};

export default UserSelfPasswordSettings;

type PasswordFormProps = {
    goToIntroduction: () => void;
};

type FormValues = {
    previousPassword: string;
    newPassword: string;
    newPasswordRepeat: string;
};

const PasswordForm = ({ goToIntroduction }: PasswordFormProps) => {
    const { t } = useTranslation('userSelf');

    const onSubmit = useHandleError(
        async (values: FormValues) => {
            // display a notification
            notification.success({
                message: t('userSelf:passwordSettings.successMessage.title'),
                description: t('userSelf:passwordSettings.successMessage.description'),
                duration: 10,
            });

            // go back to the introduction
            goToIntroduction();
        },
        [goToIntroduction, t]
    );

    return (
        <Formik<FormValues>
            initialValues={{ previousPassword: '', newPassword: '', newPasswordRepeat: '' }}
            onSubmit={onSubmit}
        >
            {({ isSubmitting }) => (
                <Form>
                    <PasswordField
                        name="previousPassword"
                        prefix={<LockOutlined />}
                        {...t('userSelf:passwordSettings.fields.previousPassword', { returnObjects: true })}
                    />
                    <PasswordField
                        name="newPassword"
                        prefix={<LockOutlined />}
                        {...t('userSelf:passwordSettings.fields.newPassword', { returnObjects: true })}
                    />
                    <PasswordField
                        name="newPasswordRepeat"
                        prefix={<LockOutlined />}
                        {...t('userSelf:passwordSettings.fields.newPasswordRepeat', { returnObjects: true })}
                    />
                    <div style={{ textAlign: 'right' }}>
                        <Space>
                            <Button onClick={goToIntroduction} type="dashed">
                                {t('userSelf:passwordSettings.cancelButton')}
                            </Button>
                            <Button htmlType="submit" loading={isSubmitting} type="primary">
                                {t('userSelf:passwordSettings.submitButton')}
                            </Button>
                        </Space>
                    </div>
                </Form>
            )}
        </Formik>
    );
};

type IntroductionProps = {
    goToForm: () => void;
    isNearExpiration: boolean;
};

const Introduction = ({ goToForm, isNearExpiration }: IntroductionProps) => {
    const { t } = useTranslation(['userSelf', 'common']);
    const user = useAccount();

    return (
        <Space direction="vertical" style={{ width: '100%' }}>
            <Typography.Paragraph>
                {t('userSelf:passwordSettings.introductionText', {
                    date: t('common:formats.date', { date: new Date(user.passwordExpiresAt) }),
                })}
            </Typography.Paragraph>
            <div style={{ textAlign: 'right' }}>
                <Button ghost={!isNearExpiration} onClick={goToForm} type="primary">
                    {t('userSelf:passwordSettings.changeButton')}
                </Button>
            </div>
        </Space>
    );
};
