import jwt from 'jsonwebtoken';
import config from './config';

type TokenPayload<Data extends {}> = Data & { __type: string };

export const generateToken = <Data extends {}>(type: string, data: Data, expiresIn: number | string) => {
    const payload: TokenPayload<Data> = { ...data, __type: type };

    return jwt.sign(payload, config.session.secret, { expiresIn });
};

export const consumeToken = async <Data extends {}>(type: string, token: string) => {
    const tokenPayload = (await jwt.verify(token, config.session.secret)) as TokenPayload<Data>;

    if (tokenPayload.__type !== type) {
        throw new Error('Invalid token payload');
    }

    return tokenPayload;
};
