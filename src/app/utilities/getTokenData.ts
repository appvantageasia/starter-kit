const getTokenData = <T = any>(token: string): T => {
    const parts = token.split('.');

    if (parts.length !== 3) {
        // invalid token
        return null;
    }

    const rawData = atob(parts[1]);

    return JSON.parse(rawData) as T;
};

export default getTokenData;
