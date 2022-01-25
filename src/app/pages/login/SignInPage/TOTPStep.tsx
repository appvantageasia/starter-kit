import { LockOutlined } from '@ant-design/icons';
import { Button, Alert, Form as AntdForm, message } from 'antd';
import { Formik, Form } from 'formik';
import { useTranslation } from 'react-i18next';
import { useAuthenticateWithTotpMutation } from '../../../api';
import InputField from '../../../components/fields/InputField';
import LoginContent from '../../../layouts/LoginLayout/LoginContent';
import useHandleError from '../../../utilities/useHandleError';
import { ActionHandlers } from './index';

type FormValues = { password: string };

const initialValues = { password: '' };

export type TOTPStepProps = { actions: ActionHandlers; token: string };

const TOTPStep = ({ actions, token }: TOTPStepProps) => {
    const { t } = useTranslation(['signInPage']);

    const [mutation] = useAuthenticateWithTotpMutation();

    const onSubmit = useHandleError(
        async ({ password }: FormValues) => {
            message.loading({
                type: 'loading',
                content: t('signInPage:totpStep.submittingMessage'),
                key: 'signIn',
                duration: 0,
            });

            const { data } = await mutation({ variables: { token, password } }).finally(() => {
                message.destroy('signIn');
            });

            switch (data.authenticateWithTOTP.__typename) {
                case 'AuthenticationSuccessful':
                    return actions.completeAuthentication(
                        data.authenticateWithTOTP.token,
                        data.authenticateWithTOTP.user
                    );

                case 'AuthenticationRequiresNewPassword':
                    return actions.moveToPasswordExpired(data.authenticateWithTOTP.token);

                default:
                    // not supported
                    return undefined;
            }
        },
        [mutation, actions, token, t]
    );

    return (
        <LoginContent title={t('signInPage:totpStep.title')}>
            <Formik initialValues={initialValues} onSubmit={onSubmit}>
                {({ isSubmitting }) => (
                    <Form>
                        <AntdForm.Item>
                            <Alert description={t('signInPage:totpStep.description')} type="info" showIcon />
                        </AntdForm.Item>
                        <InputField
                            name="password"
                            prefix={<LockOutlined />}
                            {...t('signInPage:totpStep.fields.code', { returnObjects: true })}
                        />
                        <Button htmlType="submit" loading={isSubmitting} type="primary" block>
                            {t('signInPage:totpStep.submitBtn')}
                        </Button>
                    </Form>
                )}
            </Formik>
        </LoginContent>
    );
};

export default TOTPStep;
