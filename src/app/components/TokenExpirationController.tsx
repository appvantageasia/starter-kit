import { ReactElement, useCallback, useState } from 'react';
import useTokenExpiration from '../utilities/useTokenExpiration';

export type TokenExpirationControllerProps = {
    token: string;
    fallback: JSX.Element | ReactElement;
    children: JSX.Element | ReactElement;
};

const TokenExpirationController = ({ token, fallback, children }: TokenExpirationControllerProps) => {
    const [isExpired, setIsExpired] = useState(false);

    const callback = useCallback(() => setIsExpired(true), [setIsExpired]);

    useTokenExpiration(token, callback);

    if (isExpired) {
        return fallback;
    }

    return children;
};

export default TokenExpirationController;
