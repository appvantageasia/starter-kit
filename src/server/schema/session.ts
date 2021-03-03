import { AuthenticationError } from 'apollo-server';
import { EJSON, Document } from 'bson';
import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { omit } from 'lodash/fp';
import { ObjectId } from 'mongodb';
import config from '../config';

export type SessionData = {
    userId: ObjectId;
};

export const getSessionToken = async (data: SessionData) => {
    const rawData = EJSON.serialize(data);

    return jwt.sign(rawData, config.session.secret, { expiresIn: config.session.lifetime });
};

export const readSessionToken = async (token: string): Promise<SessionData> => {
    const rawData = (await jwt.verify(token, config.session.secret)) as Document;
    const data = EJSON.deserialize(rawData) as SessionData & { iat: number; exp: number };

    return omit(['iat', 'exp'], data);
};

export const getSessionDataFromRequest = async (req: Request): Promise<SessionData | null> => {
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
        return await readSessionToken(token);
    } catch (error) {
        // print the error
        console.error(error);

        throw new AuthenticationError('Invalid authentication token');
    }
};
