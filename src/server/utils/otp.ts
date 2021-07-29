import { EJSON } from 'bson';
import dayjs from 'dayjs';
import { customAlphabet } from 'nanoid';
import getRedisInstance from '../core/redis';
import { consumeToken, generateToken } from '../core/tokens';

const tokenAlphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const tokenGenerator = customAlphabet(tokenAlphabet, 21);

const codeAlphabet = '0123456789';
const codeGenerate = customAlphabet(codeAlphabet, 4);

type OTP<Payload> = {
    code: string;
    expiresAt: Date;
    payload: Payload;
};

type TokenPayload = { reference: string };

export const createOTP = async <Payload extends object>(
    payload: Payload,
    channel = 'unknown',
    lifeTime = 10 // lifetime in minutes
): Promise<{ code: string; token: string; lifeTime: number; date: Date }> => {
    // generate a token for this OTP
    const reference = tokenGenerator();
    const code = codeGenerate();

    // generate the message
    const message: OTP<Payload> = {
        code,
        expiresAt: dayjs().add(lifeTime, 'minute').toDate(),
        payload,
    };

    // serialize the message
    const serializedMessage = JSON.stringify(EJSON.serialize(message));

    // persist in redis
    const redis = getRedisInstance();
    await redis.set(`otp:${reference}:${channel}`, serializedMessage, 'EX', lifeTime * 60);

    // sign the token
    const tokenPayload: TokenPayload = { reference };
    const token = generateToken('otp', tokenPayload, lifeTime * 60);

    // and finally return the token
    return { token, code, lifeTime, date: new Date() };
};

export const consumeOTP = async <Payload extends object>(
    token: string,
    code: string,
    channel = 'unknown'
): Promise<null | Payload> => {
    let tokenPayload: TokenPayload;

    try {
        tokenPayload = await consumeToken<TokenPayload>('otp', token);
    } catch (error) {
        // token is invalid
        return null;
    }

    const reference = tokenPayload?.reference;

    if (!reference) {
        // something is not right
        return null;
    }

    // get the message from redis
    const redis = getRedisInstance();
    const redisKey = `otp:${reference}:${channel}`;
    const serializedMessage = await redis.get(redisKey);

    if (!serializedMessage) {
        // the OTP session does not exist
        return null;
    }

    // parse the message
    const message = EJSON.deserialize(JSON.parse(serializedMessage)) as OTP<Payload>;

    if (message.code !== code) {
        // ignore it, something is invalid
        return null;
    }

    // remove the OTP session as it's now consumed
    await redis.del(redisKey);

    // then return the payload
    return message.payload;
};
