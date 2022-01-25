import { useApolloClient } from '@apollo/client';
import { message } from 'antd';
import PubSub from 'pubsub-js';
import { createContext, useContext, useEffect, useMemo, useRef, useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import * as api from '../../api';
import getTokenData from '../../utilities/getTokenData';
import { sessionJWTStorage } from '../../utilities/jwtStorage';
import LoadingElement from '../LoadingElement';

export const AccountContext = createContext<{
    token?: string;
    data: api.Maybe<api.CurrentUserDataFragment>;
    refetch: ReturnType<typeof api.useGetAuthenticatedUserQuery>['refetch'];
    login: (token: string, userData: api.CurrentUserDataFragment) => void;
    logout: () => void;
} | null>(null);

export type AccountContextManagerProps = { children: JSX.Element | React.ReactNode };

export const useAccountContext = () => {
    const context = useContext(AccountContext);

    if (!context) {
        throw new Error('Account context missing');
    }

    return context;
};

export const useSessionID = () => {
    const { token } = useAccountContext();

    return useMemo(() => {
        if (!token) {
            return null;
        }

        // get the session ID from the token
        // as it's EJSON we can find the stringify OID in $oid
        return getTokenData(token).sessionId?.$oid;
    }, [token]);
};

/* eslint-disable no-redeclare */
export function useAccount(required: true): api.CurrentUserDataFragment;
export function useAccount(required?: false): api.Maybe<api.CurrentUserDataFragment>;
export function useAccount(required?: boolean): api.CurrentUserDataFragment | api.Maybe<api.CurrentUserDataFragment> {
    const { data } = useAccountContext();

    if (required && !data) {
        throw new Error('User data is missing');
    }

    return data;
}

/* eslint-enable no-redeclare */

type State = {
    token: string | null;
    data: api.Maybe<api.CurrentUserDataFragment>;
};

type SetTokenAction = { type: 'setToken'; token: string | null };
type SetDataAction = { type: 'setData'; data: api.Maybe<api.CurrentUserDataFragment> };
type SetSessionAction = { type: 'setSession'; token: string; data: api.CurrentUserDataFragment };
type Action = SetTokenAction | SetDataAction | SetSessionAction;

const updateJWT = (token: string | null, rootMode: boolean) => {
    if (token) {
        // push the new token
        sessionJWTStorage.set(token, rootMode);
    } else {
        // remove the entry
        sessionJWTStorage.unset();
    }
};

const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'setToken':
            // update the local storage
            // todo later use super user state to define either to use the root mode or not
            updateJWT(action.token, false);

            if (!action.token) {
                // reset
                return { token: null, data: null };
            }

            // simply replace the token
            return { ...state, token: action.token };

        case 'setData':
            return { ...state, data: action.data };

        case 'setSession':
            // update the local storage
            // todo later use super user state to define either to use the root mode or not
            updateJWT(action.token, false);

            // update the state
            return { token: action.token, data: action.data };

        default:
            return state;
    }
};

type TokenData = { iat: number; exp: number };

const validateTokenData = (token: string | null): TokenData | null => {
    if (!token) {
        return null;
    }

    try {
        const data = getTokenData(token);

        if (data.exp * 1000 > new Date().getTime()) {
            return data;
        }
    } catch (error) {
        // invalid data
        console.warn(error);
    }

    return null;
};

const AccountContextManager = ({ children }: AccountContextManagerProps) => {
    const { t } = useTranslation(['common']);
    const [state, dispatch] = useReducer(reducer, { token: sessionJWTStorage.get(), data: null });
    const { token, data } = state;

    const actions = useMemo(
        () => ({
            setToken: (token: string) => dispatch({ type: 'setToken', token }),
            setData: (data: api.Maybe<api.CurrentUserDataFragment>) => dispatch({ type: 'setData', data }),
            setSession: (token: string, data: api.CurrentUserDataFragment) =>
                dispatch({ type: 'setSession', token, data }),
        }),
        [dispatch]
    );

    // user data fetch with the API
    const { data: apiData, refetch, loading } = api.useGetAuthenticatedUserQuery({ fetchPolicy: 'cache-and-network' });

    useEffect(() => {
        // simply update our state to keep track of the data
        actions.setData(apiData?.currentUser || null);
    }, [apiData, actions]);

    useEffect(() => {
        // listen for any broadcast for invalid JWT
        const subscribeToken = PubSub.subscribe('core.unauthenticated', () => {
            // reset token
            actions.setToken(null);
            // display message
            message.info(t('common:messages.sessionTimeout'));
        });

        return () => {
            // unsubscribe cleanly
            PubSub.unsubscribe(subscribeToken);
        };
    }, [actions, t]);

    // keep the session alive
    const client = useApolloClient();
    useEffect(() => {
        const tokenData = validateTokenData(token);

        if (!tokenData) {
            return () => undefined;
        }

        let mounted = true;

        const fn = async () => {
            if (!mounted) {
                // do nothing
                return;
            }

            const left = tokenData.exp - Date.now() / 1000;

            // renew 2mn ahead maximum
            if (left > 120) {
                // do nothing
                setTimeout(fn, 1000);

                // stop here
                return;
            }

            try {
                const response = await client.mutate<
                    api.RefreshCredentialsMutation,
                    api.RefreshCredentialsMutationVariables
                >({
                    mutation: api.RefreshCredentialsDocument,
                });

                if (mounted) {
                    actions.setToken(response?.data?.refreshCredentials);
                }
            } catch (error) {
                // print it out
                console.info('Failed to renew the session');
                console.error(error);
            }
        };

        setTimeout(fn, 200);

        return () => {
            mounted = false;
        };
    }, [token, actions, client]);

    // computed the contexts
    const context = useMemo(
        () => ({
            token,
            data,
            refetch,
            login: actions.setSession,
            logout: () => actions.setToken(null),
        }),
        [data, refetch, actions, token]
    );

    // refetch data whenever the token changed
    const tokenRef = useRef(token);
    useEffect(() => {
        if (tokenRef.current !== token) {
            // first update the local storage
            actions.setToken(token);

            // then update reference
            tokenRef.current = token;

            // refetch data
            refetch();

            // inform about it
            PubSub.publish('core.tokenUpdate', { token });
        }
    }, [refetch, token, tokenRef, actions]);

    const isLoading = (loading && token && !data) || (!loading && apiData?.currentUser && !data);

    if (isLoading) {
        return <LoadingElement />;
    }

    return <AccountContext.Provider value={context}>{children}</AccountContext.Provider>;
};

export default AccountContextManager;
