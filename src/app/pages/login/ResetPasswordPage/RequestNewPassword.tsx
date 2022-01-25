import { UserOutlined } from '@ant-design/icons';
import { Alert, Button, message, Space } from 'antd';
import { Formik, Form } from 'formik';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApplyForPasswordChangeMutation } from '../../../api';
import InputField from '../../../components/fields/InputField';
import LoginContent from '../../../layouts/LoginLayout/LoginContent';
import useHandleError from '../../../utilities/useHandleError';

type FormValues = { username: string };

const RequestNewPassword = () => {
    const { t } = useTranslation(['signInPage']);
    const navigate = useNavigate();
    const state = useLocation().state as { username?: string };
    const [isSubmitted, setIsSubmitted] = useState(false);

    const [mutation] = useApplyForPasswordChangeMutation();

    const onSubmit = useHandleError(
        async ({ username }: FormValues) => {
            message.loading({
                type: 'loading',
                content: t('signInPage:requestNewPassword.submittingMessage'),
                key: 'resetPassword',
                duration: 0,
            });

            const { data } = await mutation({ variables: { username } }).finally(() => {
                message.destroy('resetPassword');
            });

            setIsSubmitted(data?.applyForPasswordChange);
        },
        [mutation, setIsSubmitted, t]
    );

    const element = isSubmitted ? (
        <Alert description={t('signInPage:requestNewPassword.successMessage')} type="success" showIcon />
    ) : (
        <Formik initialValues={{ username: state?.username || '' }} onSubmit={onSubmit}>
            {({ isSubmitting, values }) => (
                <Form>
                    <InputField
                        name="username"
                        prefix={<UserOutlined />}
                        {...t('signInPage:requestNewPassword.fields.username', { returnObjects: true })}
                    />
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Button htmlType="submit" loading={isSubmitting} type="primary" block>
                            {t('signInPage:requestNewPassword.submitBtn')}
                        </Button>
                        <Button
                            disabled={isSubmitting}
                            htmlType="button"
                            onClick={() => {
                                navigate('/private/signIn', {
                                    state: { username: values?.username, noWebAuthn: true },
                                });
                            }}
                            type="dashed"
                            block
                        >
                            {t('signInPage:requestNewPassword.authenticateLink')}
                        </Button>
                    </Space>
                </Form>
            )}
        </Formik>
    );

    return <LoginContent title={t('signInPage:requestNewPassword.title')}>{element}</LoginContent>;
};

export default RequestNewPassword;
