import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Space, message } from 'antd';
import { Formik, Form } from 'formik';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthenticateMutation } from '../../../api';
import CheckboxField from '../../../components/fields/CheckboxField';
import InputField from '../../../components/fields/InputField';
import PasswordField from '../../../components/fields/PasswordField';
import LoginContent from '../../../layouts/LoginLayout/LoginContent';
import useHandleError from '../../../utilities/useHandleError';
import AuthenticateWebAuthn from './AuthenticateWebAuthn';
import { ActionHandlers } from './index';

type FormValues = { username: string; password: string; remember?: boolean };

export type AuthenticateStepProps = { actions: ActionHandlers };

const AuthenticateStep = ({ actions }: AuthenticateStepProps) => {
    const { t } = useTranslation(['signInPage']);
    const navigate = useNavigate();

    const [authenticate] = useAuthenticateMutation();
    const state = useLocation().state as { username?: string };
    const rememberedUsername = localStorage.getItem('app:signInFor');

    const onSubmit = useHandleError(
        async ({ remember, ...values }: FormValues) => {
            message.loading({
                type: 'loading',
                content: t('signInPage:authenticateStep.submittingMessage'),
                key: 'signIn',
                duration: 0,
            });

            const { data } = await authenticate({ variables: values }).finally(() => {
                message.destroy('signIn');
            });

            if (remember) {
                localStorage.setItem('app:signInFor', values.username);
            }

            switch (data.authenticate.__typename) {
                case 'AuthenticationRequiresNewPassword':
                    return actions.moveToPasswordExpired(data.authenticate.token);

                case 'AuthenticationRequiresTOTP':
                    return actions.moveToTOTP(data.authenticate.token);

                case 'AuthenticationSuccessful':
                    return actions.completeAuthentication(data.authenticate.token, data.authenticate.user);

                default:
                    // not supported
                    return undefined;
            }
        },
        [authenticate, actions, t]
    );

    return (
        <LoginContent title={t('signInPage:authenticateStep.title')}>
            <Formik
                initialValues={{
                    username: state?.username || rememberedUsername || '',
                    password: '',
                    remember: !!rememberedUsername,
                }}
                onSubmit={onSubmit}
            >
                {({ isSubmitting, values }) => (
                    <Form>
                        <InputField
                            name="username"
                            prefix={<UserOutlined />}
                            required
                            {...t('signInPage:authenticateStep.fields.username', { returnObjects: true })}
                        />
                        <PasswordField
                            name="password"
                            prefix={<LockOutlined />}
                            required
                            {...t('signInPage:authenticateStep.fields.password', { returnObjects: true })}
                        />
                        <CheckboxField name="remember">{t('signInPage:authenticateStep.rememberMe')}</CheckboxField>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Button htmlType="submit" loading={isSubmitting} type="primary" block>
                                {t('signInPage:authenticateStep.submitBtn')}
                            </Button>
                            <AuthenticateWebAuthn actions={actions} />
                            <Button
                                disabled={isSubmitting}
                                htmlType="button"
                                onClick={() => {
                                    navigate('/private/resetPassword', {
                                        state: { username: values.username },
                                    });
                                }}
                                type="dashed"
                                block
                            >
                                {t('signInPage:authenticateStep.forgotPasswordLink')}
                            </Button>
                        </Space>
                    </Form>
                )}
            </Formik>
        </LoginContent>
    );
};

export default AuthenticateStep;
