import { IncomingMessage } from 'http';

const getIp = (req: IncomingMessage): string | undefined =>
    (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;

export default getIp;
