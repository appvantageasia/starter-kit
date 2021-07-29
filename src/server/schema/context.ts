import { IncomingMessage } from 'http';
import { GraphQLFieldResolver } from 'graphql';
import { FileUpload } from 'graphql-upload';
import { getLanguage, getLazyTranslations, GetTranslations } from '../core/translations';
import createLoaders, { Loaders } from '../loaders';
import { getSessionDataFromRequest, SessionData } from './session';
import { getLazyLoggedUser, GetLoggedUser } from './user';

export type Context = {
    ip?: string;
    language: string;
    getTranslations: GetTranslations;
    session: SessionData | null;
    getUser: GetLoggedUser;
    loaders: Loaders;
};

export type FileUploadPromise = Promise<FileUpload>;

export type RootDocument = null;

export type RootResolver<TArgs = { [argName: string]: any }> = GraphQLFieldResolver<RootDocument, Context, TArgs>;

const getIp = (req: IncomingMessage): string | undefined =>
    (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;

const createContext = async (req: IncomingMessage): Promise<Context> => {
    const session = await getSessionDataFromRequest(req);
    const language = getLanguage(req);

    return {
        ip: getIp(req),
        language,
        session,
        getTranslations: getLazyTranslations(language),
        getUser: getLazyLoggedUser(session?.userId),
        loaders: createLoaders(),
    };
};

export default createContext;
