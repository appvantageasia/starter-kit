import { IncomingMessage, OutgoingMessage } from 'http';
import cookie from 'cookie';
import { GraphQLFieldResolver } from 'graphql';
import { FileUpload } from 'graphql-upload';
import config from '../core/config';
import { getLanguage, getLazyTranslations, GetTranslations } from '../core/translations';
import createLoaders, { Loaders } from '../loaders';
import getIp from '../utils/getIp';
import { getCSRFFromHeaders, getSessionDataFromRequest, SessionData } from './session';
import { getLazyLoggedUser, GetLoggedUser } from './user';

export type Context = {
    ip?: string;
    language: string;
    getTranslations: GetTranslations;
    session: SessionData | null;
    getUser: GetLoggedUser;
    loaders: Loaders;
    setCSRF: (value: string) => void;
    csrf: string;
    userAgent?: string;
    origin: string;
};

export type FileUploadPromise = Promise<FileUpload>;

export type RootDocument = null;

export type RootResolver<TArgs = { [argName: string]: any }> = GraphQLFieldResolver<RootDocument, Context, TArgs>;

const createContext = async (req: IncomingMessage, res?: OutgoingMessage, authorization?: string): Promise<Context> => {
    const session = await getSessionDataFromRequest(req, authorization);
    const language = await getLanguage(req);

    return {
        ip: getIp(req),
        origin: req.headers.origin,
        language,
        session,
        getTranslations: getLazyTranslations(language),
        getUser: getLazyLoggedUser(session?.userId),
        loaders: createLoaders(),
        userAgent: req.headers['user-agent'],
        setCSRF: value => {
            if (!res) {
                throw new Error('Cannot set cookies in a call without HTTP response available');
            }

            res.setHeader(
                'Set-Cookie',
                cookie.serialize('CSRF', value, {
                    sameSite: config.cookiePolicy,
                    httpOnly: true,
                    secure: config.secureCookie,
                })
            );
        },
        csrf: getCSRFFromHeaders(req),
    };
};

export default createContext;
