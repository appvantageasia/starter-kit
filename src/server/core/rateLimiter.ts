import { RateLimiterRedis } from 'rate-limiter-flexible';
import config from './config';
import getRedisInstance from './redis';

// rate limiter for any web request for other than assets
export const expressRateLimiter = new RateLimiterRedis({
    storeClient: getRedisInstance(),
    points: config.limiter.api, // n requests per second max
    duration: 1, // reset every seconds
    keyPrefix: 'expressRlfx',
});

// rate limiter for authentication try outs
// over 5 tries per minute for a username or ip
export const authenticationRateLimiter = new RateLimiterRedis({
    storeClient: getRedisInstance(),
    points: 10, // 5 tries per minute max, tries on username consume 2 points
    duration: 60, // reset every minutes
    keyPrefix: 'rflx:auth',
    blockDuration: 3 * 60, // block for 3 minutes
});

// rate limiter for link
export const linkRetrievalRateLimiter = new RateLimiterRedis({
    storeClient: getRedisInstance(),
    points: 1, // only 1 try per second
    duration: 1,
    keyPrefix: 'rflx:linkRetrieval',
});

// rate limiter on reset password
export const resetPasswordRateLimiter = new RateLimiterRedis({
    storeClient: getRedisInstance(),
    points: 1, // only 1 try per second
    duration: 1,
    keyPrefix: 'rflx:resetPassword',
});

// rate limiter for TOTP
export const totpRateLimiter = new RateLimiterRedis({
    storeClient: getRedisInstance(),
    points: 1, // only 1 try per second
    duration: 1,
    keyPrefix: 'totpRflex',
});

// rate limiter to publically fetch webauthn keys
export const webAuthnKeyFetchRateLimiter = new RateLimiterRedis({
    storeClient: getRedisInstance(),
    points: 1, // only 1 try per second
    duration: 1,
    keyPrefix: 'rflx:webAuthnKeyFetch',
});
