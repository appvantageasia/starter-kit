# Caching

Caching is available in the application by using [Redis][redis] with [ioredis].

You may easily retrieve the client instance with the following

```typescript
import { getRedisInstance } from './redis';

// get the ioredis instance
const redis = getRedisInstance();

// use it for whatever purposes
redis.set('dummy', 42);
```

[ioredis]: https://github.com/luin/ioredis
[redis]: https://redis.io/
