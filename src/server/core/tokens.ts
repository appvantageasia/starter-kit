import jwt from 'jsonwebtoken';
import { customAlphabet } from 'nanoid';
import config from './config';

type TokenPayload<Data extends {}> = Data & { __type: string };

const csrfAlphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
export const csrfGenerator = customAlphabet(csrfAlphabet, 24);

export const generateToken = <Data extends {}>(type: string, data: Data, expiresIn: number | string, csrf = '') => {
    const payload: TokenPayload<Data> = { ...data, __type: type };

    return jwt.sign(payload, config.session.secret + csrf, { expiresIn });
};

export const consumeToken = async <Data extends {}>(type: string, token: string, csrf = '') => {
    const tokenPayload = (await jwt.verify(token, config.session.secret + csrf)) as TokenPayload<Data>;

    if (tokenPayload.__type !== type) {
        throw new Error('Invalid token payload');
    }

    return tokenPayload;
};
