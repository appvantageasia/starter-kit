import { useEffect } from 'react';

const useTokenExpiration = (token: string, callback: () => void) => {
    useEffect(() => {
        const parts = token.split('.');

        if (parts.length !== 3) {
            // token should be "header.payload.signature"
            throw new Error('invalid token');
        }

        // get time now
        const now = new Date().getTime();

        // get expiration for the given token
        const payload = JSON.parse(atob(parts[1])) as { iat: number; exp: number };
        const expiration = payload.exp * 1000;

        if (now >= expiration) {
            // token already call the callback as the token is expired
            callback();

            // no need for cleanup
            return () => undefined;
        }

        // create a timeout
        const timeoutId = setTimeout(callback, expiration - now);

        // proeprly cleanup the timeout
        return () => clearTimeout(timeoutId);
    }, [token, callback]);
};

export default useTokenExpiration;
