import { LockOutlined } from '@ant-design/icons';
import { Space, Typography, Steps, Button, notification } from 'antd';
import { Form, Formik } from 'formik';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGenerateAuthenticatorSetupQuery, useEnableAuthenticatorMutation } from '../../../api';
import LoadingElement from '../../../components/LoadingElement';
import InputField from '../../../components/fields/InputField';
import useHandleError from '../../../utilities/useHandleError';

export type AuthenticatorSetupProps = {
    previous: () => void;
    next: () => void;
};

const AuthenticatorSetup = ({ previous, next }: AuthenticatorSetupProps) => {
    const { t } = useTranslation('userSelf');

    const { data, loading } = useGenerateAuthenticatorSetupQuery({ fetchPolicy: 'no-cache' });
    const [step, useStep] = useState(0);

    if (loading) {
        return <LoadingElement />;
    }

    if (!data) {
        return null;
    }

    const content = (() => {
        switch (step) {
            case 0:
                return <QRCodeStep next={() => useStep(1)} previous={previous} qrcodeUri={data.response.qrcodeUri} />;

            case 1:
                return <CodeStep next={next} previous={() => useStep(0)} secret={data.response.secret} />;

            default:
                return null;
        }
    })();

    return (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Steps current={step} size="small" type="navigation">
                <Steps.Step title={t('userSelf:authenticatorSettings.setup.qrcodeStep.title')} />
                <Steps.Step title={t('userSelf:authenticatorSettings.setup.codeStep.title')} />
            </Steps>
            {content}
        </Space>
    );
};

export default AuthenticatorSetup;

type QRCodeStepProps = {
    qrcodeUri: string;
    previous: () => void;
    next: () => void;
};

const QRCodeStep = ({ qrcodeUri, previous, next }: QRCodeStepProps) => {
    const { t } = useTranslation('userSelf');

    return (
        <Space direction="vertical" style={{ width: '100%' }}>
            <Typography.Text>{t('userSelf:authenticatorSettings.setup.qrcodeStep.introduction')}</Typography.Text>
            <img alt="qrcode" src={qrcodeUri} style={{ margin: 'auto', display: 'block' }} />
            <div style={{ textAlign: 'right' }}>
                <Space>
                    <Button onClick={previous} type="dashed">
                        {t('userSelf:authenticatorSettings.setup.qrcodeStep.cancelButton')}
                    </Button>
                    <Button onClick={next} type="primary">
                        {t('userSelf:authenticatorSettings.setup.qrcodeStep.submitButton')}
                    </Button>
                </Space>
            </div>
        </Space>
    );
};

export type CodeStepProps = {
    secret: string;
    previous: () => void;
    next: () => void;
};

type CodeStepValues = { token: string };

const CodeStep = ({ previous, next, secret }: CodeStepProps) => {
    const { t } = useTranslation('userSelf');

    const [mutation] = useEnableAuthenticatorMutation();

    const onSubmit = useHandleError(
        async ({ token }: CodeStepValues) => {
            // run on the backend
            await mutation({ variables: { token, secret } });

            // success message
            notification.success({
                message: t('userSelf:authenticatorSettings.setup.enabledSuccessMessage.title'),
                description: t('userSelf:authenticatorSettings.setup.enabledSuccessMessage.description'),
                duration: 10,
            });

            // then move on
            next();
        },
        [secret, mutation, next, t]
    );

    return (
        <Formik<CodeStepValues> initialValues={{ token: '' }} onSubmit={onSubmit}>
            {({ isSubmitting }) => (
                <Form>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <div style={{ maxWidth: 200, margin: 'auto' }}>
                            <InputField
                                itemProps={{ help: t('userSelf:authenticatorSettings.setup.codeStep.introduction') }}
                                label={t('userSelf:authenticatorSettings.setup.codeStep.label')}
                                name="token"
                                prefix={<LockOutlined />}
                            />
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <Space>
                                <Button onClick={previous} type="dashed">
                                    {t('userSelf:authenticatorSettings.setup.codeStep.cancelButton')}
                                </Button>
                                <Button disabled={isSubmitting} htmlType="submit" type="primary">
                                    {t('userSelf:authenticatorSettings.setup.codeStep.submitButton')}
                                </Button>
                            </Space>
                        </div>
                    </Space>
                </Form>
            )}
        </Formik>
    );
};
