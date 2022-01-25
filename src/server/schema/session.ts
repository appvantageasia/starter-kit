import { IncomingMessage } from 'http';
import { AuthenticationError } from 'apollo-server';
import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import { getOr } from 'lodash/fp';
import { ObjectId } from 'mongodb';
import config from '../core/config';
import { generateToken, consumeToken, csrfGenerator } from '../core/tokens';
import { getDatabaseContext } from '../database';
import getIp from '../utils/getIp';

export type SessionData = {
    userId: ObjectId;
    sessionId: ObjectId;
};

export const getSessionToken = async (data: SessionData) => {
    const csrf = csrfGenerator();
    const token = generateToken('session', data, config.session.lifetime, csrf);

    // get iat and exp from token instead
    const { iat, exp } = jwt.decode(token, { json: true });

    return {
        token: generateToken('session', data, config.session.lifetime, csrf),
        csrf,
        exp: new Date(exp * 1000),
        iat: new Date(iat * 1000),
    };
};

export const readSessionToken = (token: string, csrf: string) => consumeToken<SessionData>('session', token, csrf);

export const getCSRFFromHeaders = (req: IncomingMessage): string => {
    const requestCookie = req.headers?.cookie;

    return requestCookie ? getOr('', 'CSRF', cookie.parse(requestCookie)) : '';
};

const getAuthorizationFromHeader = (req: IncomingMessage) => {
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

    return token;
};

export const getSessionDataFromRequest = async (
    req: IncomingMessage,
    authorization?: string
): Promise<SessionData | null> => {
    const token = authorization || getAuthorizationFromHeader(req);

    if (!token) {
        return null;
    }

    const data = await (async () => {
        try {
            const csrf = getCSRFFromHeaders(req);

            return await readSessionToken(token, csrf);
        } catch (error) {
            throw new AuthenticationError('Invalid authentication token');
        }
    })();

    if (!data) {
        return null;
    }

    const { collections } = await getDatabaseContext();
    const result = await collections.userSessions.updateOne(
        { _id: data.sessionId },
        {
            $set: {
                // update user agent to keep the latest
                userAgent: req.headers['user-agent'],
                ip: getIp(req),
                // then update last activity date
                lastActivityAt: new Date(),
            },
        }
    );

    if (!result.matchedCount) {
        // session was invalidated
        throw new AuthenticationError('Session invalidated');
    }

    return data;
};
