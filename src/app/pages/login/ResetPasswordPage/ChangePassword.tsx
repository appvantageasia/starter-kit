import { LockOutlined } from '@ant-design/icons';
import { Button, Alert, Space, message } from 'antd';
import { Formik, Form } from 'formik';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useChangePasswordFromTokenMutation } from '../../../api';
import PasswordField from '../../../components/fields/PasswordField';
import LoginContent from '../../../layouts/LoginLayout/LoginContent';
import useHandleError from '../../../utilities/useHandleError';
import useTokenExpiration from '../../../utilities/useTokenExpiration';
import TokenExpired from '../SignInPage/TokenExpired';

type FormValues = { password: string; passwordRepeat: string };

const initialValues = { password: '', passwordRepeat: '' };

export type ChangePasswordProps = { token: string };

const ChangePassword = ({ token }: ChangePasswordProps) => {
    const { t } = useTranslation(['signInPage']);
    const navigate = useNavigate();

    const [isSuccessful, setIsSuccessful] = useState(false);
    const [tokenExpired, setTokenExpired] = useState(false);
    const [mutation] = useChangePasswordFromTokenMutation();

    const onSubmit = useHandleError(
        async ({ password }: FormValues) => {
            message.loading({
                type: 'loading',
                content: t('signInPage:requestNewPassword.submittingMessage'),
                key: 'resetPassword',
                duration: 0,
            });

            const { data } = await mutation({ variables: { token, password } }).finally(() => {
                message.destroy('resetPassword');
            });

            setIsSuccessful(data?.changePasswordFromToken);
        },
        [mutation, setIsSuccessful, token, t]
    );

    const onTokenExpired = useCallback(() => setTokenExpired(true), [setTokenExpired]);

    useTokenExpiration(token, onTokenExpired);

    if (!isSuccessful && tokenExpired) {
        return <TokenExpired onLinkClick={() => navigate('/private/signIn', { replace: true })} />;
    }

    const element = isSuccessful ? (
        <Space direction="vertical" style={{ width: '100%' }}>
            <Alert description={t('signInPage:newPassword.successMessage')} type="success" showIcon />
            <Button
                htmlType="button"
                onClick={() => {
                    navigate('/private/signIn', { state: { noWebAuthn: true } });
                }}
                type="dashed"
                block
            >
                {t('signInPage:newPassword.authenticateLink')}
            </Button>
        </Space>
    ) : (
        <Formik initialValues={initialValues} onSubmit={onSubmit}>
            {({ isSubmitting }) => (
                <Form>
                    <PasswordField
                        name="password"
                        prefix={<LockOutlined />}
                        {...t('signInPage:newPassword.fields.password', { returnObjects: true })}
                    />
                    <PasswordField
                        name="passwordRepeat"
                        prefix={<LockOutlined />}
                        {...t('signInPage:newPassword.fields.passwordRepeat', { returnObjects: true })}
                    />
                    <Button htmlType="submit" loading={isSubmitting} type="primary" block>
                        {t('signInPage:newPassword.submitBtn')}
                    </Button>
                </Form>
            )}
        </Formik>
    );

    return <LoginContent title={t('signInPage:newPassword.title')}>{element}</LoginContent>;
};

export default ChangePassword;
