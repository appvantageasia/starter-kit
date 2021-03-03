import { RateLimiterRedis } from 'rate-limiter-flexible';
import getRedisInstance from './redis';

// rate limiter for any web request for other than assets
export const expressRateLimiter = new RateLimiterRedis({
    storeClient: getRedisInstance(),
    points: 10, // 10 requests per second max
    duration: 1, // reset every seconds
    keyPrefix: 'expressRlfx',
});

// rate limiter for authentication try outs
// over 5 tries per minute for a username or ip
export const authenticationRateLimiter = new RateLimiterRedis({
    storeClient: getRedisInstance(),
    points: 10, // 5 tries per minute max, tries on username consume 2 points
    duration: 60, // reset every minutes
    keyPrefix: 'authRlfx',
    blockDuration: 3 * 60, // block for 3 minutes
});
