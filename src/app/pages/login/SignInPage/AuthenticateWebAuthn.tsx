import { message } from 'antd';
import { useFormikContext } from 'formik';
import { debounce, flow, get, set } from 'lodash/fp';
import { useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import getApolloErrors from '../../../../server/utils/getApolloErrors';
import { useGenerateAuthenticatorChallengeLazyQuery, useAuthenticateWithWebAuthnMutation } from '../../../api';
import { arrayBufferToBase64, base64ToArrayBuffer } from '../../../utilities/buffer';
import { ActionHandlers } from './index';

const convertResponse = (credential: Credential) => {
    const convertBufferPathToString = (path: string) => set(path, arrayBufferToBase64(get(path, credential)));

    return flow([
        convertBufferPathToString('rawId'),
        convertBufferPathToString('response.authenticatorData'),
        convertBufferPathToString('response.clientDataJSON'),
        convertBufferPathToString('response.signature'),
        convertBufferPathToString('response.userHandle'),
    ])(credential);
};

export type AuthenticateWebAuthnProps = { actions: ActionHandlers };

const AuthenticateWebAuthn = ({ actions }: AuthenticateWebAuthnProps) => {
    const { t } = useTranslation(['signInPage']);
    const { values } = useFormikContext<{ username: string }>();
    const { username: currentUsername } = values;
    const state = useLocation().state as { noWebAuthn?: boolean };
    const noWebAuthn = state?.noWebAuthn || false;
    const [authenticate] = useAuthenticateWithWebAuthnMutation();

    const [fetch, { data, variables }] = useGenerateAuthenticatorChallengeLazyQuery();

    const fetchKeys = useMemo(() => debounce(1000, (username: string) => fetch({ variables: { username } })), [fetch]);

    useEffect(() => {
        if (currentUsername) {
            fetchKeys(currentUsername);
        }
    }, [fetchKeys, currentUsername]);

    const submit = useCallback(
        async (credential: Credential, token: string) => {
            try {
                message.loading({
                    type: 'loading',
                    content: t('signInPage:authenticateStep.submittingMessage'),
                    key: 'signIn',
                    duration: 0,
                });

                const response = convertResponse(credential);
                const { data } = await authenticate({ variables: { token, response } }).finally(() => {
                    message.destroy('signIn');
                });

                switch (data.authenticate.__typename) {
                    case 'AuthenticationSuccessful':
                        return actions.completeAuthentication(data.authenticate.token, data.authenticate.user);

                    default:
                        // not supported
                        return undefined;
                }
            } catch (error) {
                const apolloErrors = getApolloErrors(error);

                if (apolloErrors?.$root) {
                    message.error(apolloErrors?.$root);
                }

                return undefined;
            }
        },
        [t, authenticate, actions]
    );

    useEffect(() => {
        const assertion = data?.generateAuthenticatorChallenge;

        if (!assertion || noWebAuthn) {
            return;
        }

        // check if the device is setup on one of those keys
        const deviceKeyId = localStorage.getItem('app:webauthnKeyId');

        // check if there's a matching key
        if (!assertion.allowCredentials.some(key => key.id === deviceKeyId)) {
            return;
        }

        // call credentials API to authenticate
        navigator.credentials
            .get({
                publicKey: {
                    challenge: base64ToArrayBuffer(assertion.challenge),
                    allowCredentials: assertion.allowCredentials.map(key => ({
                        ...key,
                        id: base64ToArrayBuffer(key.id),
                    })),
                    timeout: assertion.timeout,
                    userVerification: 'required',
                },
            })
            .then(credential => submit(credential, assertion.token), console.error);
    }, [data, currentUsername, variables, noWebAuthn, submit]);

    return null;
};

export default AuthenticateWebAuthn;
