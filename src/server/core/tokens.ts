import { EJSON } from 'bson';
import jwt from 'jsonwebtoken';
import { omit } from 'lodash/fp';
import { customAlphabet } from 'nanoid';
import config from './config';

type TokenPayload<Data extends {}> = Data & { __type: string };

const csrfAlphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
export const csrfGenerator = customAlphabet(csrfAlphabet, 24);

export const generateToken = <Data extends {}>(type: string, data: Data, expiresIn: number | string, csrf = '') => {
    const payload: TokenPayload<Data> = { ...data, __type: type };

    return jwt.sign(EJSON.serialize(payload), config.session.secret + csrf, { expiresIn });
};

export const consumeToken = async <Data extends {}>(type: string, token: string, csrf = '') => {
    const tokenPayload: TokenPayload<any> = EJSON.deserialize(
        (await jwt.verify(token, config.session.secret + csrf)) as Document
    );

    if (tokenPayload.__type !== type) {
        throw new Error('Invalid token payload');
    }

    return omit(['iat', 'exp'], tokenPayload) as TokenPayload<Data>;
};
