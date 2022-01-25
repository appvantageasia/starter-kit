import UAParser from 'ua-parser-js';

// eslint-disable-next-line import/prefer-default-export
export const getFriendlyUserAgent = (userAgent: string) => {
    const parser = new UAParser(userAgent);

    return `${parser.getOS().name}, ${parser.getBrowser().name}`;
};
