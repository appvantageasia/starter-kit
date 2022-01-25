import { LockOutlined } from '@ant-design/icons';
import { Button, Alert, Form as AntdForm, message } from 'antd';
import { Formik, Form } from 'formik';
import { useTranslation } from 'react-i18next';
import { useChangePasswordFromAuthenticationMutation } from '../../../api';
import PasswordField from '../../../components/fields/PasswordField';
import LoginContent from '../../../layouts/LoginLayout/LoginContent';
import useHandleError from '../../../utilities/useHandleError';
import { ActionHandlers } from './index';

type FormValues = { password: string; passwordRepeat: string };

const initialValues = { password: '', passwordRepeat: '' };

export type PasswordExpiredStepProps = { actions: ActionHandlers; token: string };

const PasswordExpiredStep = ({ actions, token }: PasswordExpiredStepProps) => {
    const { t } = useTranslation(['signInPage']);

    const [mutation] = useChangePasswordFromAuthenticationMutation();

    const onSubmit = useHandleError(
        async ({ password }: FormValues) => {
            message.loading({
                type: 'loading',
                content: t('signInPage:changePasswordStep.submittingMessage'),
                key: 'signIn',
                duration: 0,
            });

            const { data } = await mutation({ variables: { token, password } }).finally(() => {
                message.destroy('signIn');
            });

            switch (data.changePasswordFromAuthentication.__typename) {
                case 'AuthenticationSuccessful':
                    return actions.completeAuthentication(
                        data.changePasswordFromAuthentication.token,
                        data.changePasswordFromAuthentication.user
                    );

                default:
                    // not supported
                    return undefined;
            }
        },
        [mutation, actions, token, t]
    );

    return (
        <LoginContent title={t('signInPage:changePasswordStep.title')}>
            <Formik initialValues={initialValues} onSubmit={onSubmit}>
                {({ isSubmitting }) => (
                    <Form>
                        <AntdForm.Item>
                            <Alert
                                description={t('signInPage:changePasswordStep.description')}
                                type="warning"
                                showIcon
                            />
                        </AntdForm.Item>
                        <PasswordField
                            name="password"
                            prefix={<LockOutlined />}
                            {...t('signInPage:changePasswordStep.fields.password', { returnObjects: true })}
                        />
                        <PasswordField
                            name="passwordRepeat"
                            prefix={<LockOutlined />}
                            {...t('signInPage:changePasswordStep.fields.passwordRepeat', { returnObjects: true })}
                        />
                        <Button htmlType="submit" loading={isSubmitting} type="primary" block>
                            {t('signInPage:changePasswordStep.submitBtn')}
                        </Button>
                    </Form>
                )}
            </Formik>
        </LoginContent>
    );
};

export default PasswordExpiredStep;
