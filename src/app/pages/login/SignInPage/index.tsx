import { useMemo, useReducer } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CurrentUserDataFragment } from '../../../api';
import TokenExpirationController from '../../../components/TokenExpirationController';
import { useAccountContext } from '../../../components/contexts/AccountContextManager';
import LoginLayout from '../../../layouts/LoginLayout';
import LoginContent from '../../../layouts/LoginLayout/LoginContent';
import AuthenticateStep from './AuthenticateStep';
import PasswordExpiredStep from './PasswordExpiredStep';
import TOTPStep from './TOTPStep';
import TokenExpired from './TokenExpired';

type State = { step: 'authenticate' } | { step: 'totp'; token: string } | { step: 'passwordExpired'; token: string };

type Action =
    | { type: 'moveToTOTP'; token: string }
    | { type: 'moveToPasswordExpired'; token: string }
    | { type: 'reset' };

const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'moveToPasswordExpired':
            return { step: 'passwordExpired', token: action.token };

        case 'moveToTOTP':
            return { step: 'totp', token: action.token };

        case 'reset':
            return { step: 'authenticate' };

        default:
            return state;
    }
};

export type ActionHandlers = {
    completeAuthentication: (token: string, user: CurrentUserDataFragment) => void;
    moveToTOTP: (token: string) => void;
    moveToPasswordExpired: (token: string) => void;
    goBackToAuthenticate: () => void;
};

const SignInPage = () => {
    const locationState = useLocation().state as { nextPage?: string };
    const nextPage = locationState?.nextPage || '/private';
    const { login } = useAccountContext();
    const navigate = useNavigate();

    const [state, dispatch] = useReducer(reducer, { step: 'authenticate' });

    const actions = useMemo(
        (): ActionHandlers => ({
            completeAuthentication: (token: string, user: CurrentUserDataFragment) => {
                // update session
                login(token, user);
                // then redirect to the page the user wanted to see
                navigate(nextPage, { replace: true });
            },
            moveToTOTP: (token: string) => dispatch({ type: 'moveToTOTP', token }),
            moveToPasswordExpired: (token: string) => dispatch({ type: 'moveToPasswordExpired', token }),
            goBackToAuthenticate: () => dispatch({ type: 'reset' }),
        }),
        [dispatch, nextPage, login, navigate]
    );

    const stepElement = (() => {
        const tokenExpiredFallback = (
            <LoginContent>
                <TokenExpired onLinkClick={actions.goBackToAuthenticate} />
            </LoginContent>
        );

        switch (state.step) {
            case 'authenticate':
                return <AuthenticateStep actions={actions} />;

            case 'totp':
                return (
                    <TokenExpirationController fallback={tokenExpiredFallback} token={state.token}>
                        <TOTPStep actions={actions} token={state.token} />
                    </TokenExpirationController>
                );

            case 'passwordExpired':
                return (
                    <TokenExpirationController fallback={tokenExpiredFallback} token={state.token}>
                        <PasswordExpiredStep actions={actions} token={state.token} />
                    </TokenExpirationController>
                );

            default:
                return null;
        }
    })();

    return <LoginLayout>{stepElement}</LoginLayout>;
};

export default SignInPage;
