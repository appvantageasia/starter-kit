import { IResolverObject } from 'apollo-server';
import { Request } from 'express';
import { GraphQLFieldResolver } from 'graphql';
import createLoaders, { Loaders } from '../loaders';
import { getLanguage, getLazyTranslations, GetTranslations } from '../translations';
import { getSessionDataFromRequest, SessionData } from './session';
import { getLazyLoggedUser, GetLoggedUser } from './user';

export type Context = {
    ip: string;
    language: string;
    getTranslations: GetTranslations;
    session: SessionData | null;
    getUser: GetLoggedUser;
    loaders: Loaders;
};

export type RootDocument = null;

export type RootResolver<TArgs = { [argName: string]: any }> = GraphQLFieldResolver<RootDocument, Context, TArgs>;

export type TypeResolver<TSource = any> = IResolverObject<TSource, Context>;

const createContext = async (req: Request): Promise<Context> => {
    const session = await getSessionDataFromRequest(req);
    const language = getLanguage(req);

    return {
        ip: req.ip,
        language,
        session,
        getTranslations: getLazyTranslations(language),
        getUser: getLazyLoggedUser(session?.userId),
        loaders: createLoaders(),
    };
};

export default createContext;
