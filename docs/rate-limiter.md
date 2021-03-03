# Rate limiter

To protect the application on software level from DDoS and/or from flood/spamming,
we use a [rate limiter][rlfx] library to protect it.
We use [Redis][redis] with [ioredis] to share the consumptions over multiple instances.

The rate limiter is applied in two ways :

-   Limiting all http request send to the web servers for resources other than assets
    -   the limit is set to a maximum of 10 requests per second by IP
-   Limiting authentication
    -   the limit is set to a maximum of 5 requests per minute by username
    -   or 10 requests per minute by IP
    -   exceeding the limit will block tries for 3 minutes

[rlfx]: https://github.com/animir/node-rate-limiter-flexible#readme
[ioredis]: https://github.com/luin/ioredis
[redis]: https://redis.io/
