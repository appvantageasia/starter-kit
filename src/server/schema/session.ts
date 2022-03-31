import { IncomingMessage } from 'http';
import { AuthenticationError } from 'apollo-server';
import { EJSON, Document } from 'bson';
import cookie from 'cookie';
import { omit, getOr } from 'lodash/fp';
import { ObjectId } from 'mongodb';
import config from '../core/config';
import { generateToken, consumeToken, csrfGenerator } from '../core/tokens';

export type SessionData = {
    userId: ObjectId;
};

export const getSessionToken = async (data: SessionData) => {
    const csrf = csrfGenerator();
    const rawData = EJSON.serialize(data);

    return {
        token: generateToken('session', rawData, config.session.lifetime, csrf),
        csrf,
    };
};

export const readSessionToken = async (token: string, csrf: string): Promise<SessionData> => {
    const rawData = await consumeToken<Document>('session', token, csrf);
    const data = EJSON.deserialize(rawData) as SessionData & { iat: number; exp: number };

    return omit(['iat', 'exp'], data);
};

export const getSessionDataFromRequest = async (req: IncomingMessage): Promise<SessionData | null> => {
    const header = req.headers?.authorization as string;

    if (!header) {
        return null;
    }

    const [type, token] = header.split(' ');

    if (type !== 'Bearer') {
        throw new AuthenticationError('Unsupported authentication method');
    }

    if (!token) {
        throw new AuthenticationError('Missing token');
    }

    try {
        const requestCookie = req.headers?.cookie;
        const csrf: string = requestCookie ? getOr('', 'CSRF', cookie.parse(requestCookie)) : '';

        return await readSessionToken(token, csrf);
    } catch (error) {
        throw new AuthenticationError('Invalid authentication token');
    }
};
