import { IncomingMessage } from 'http';
import { IResolverObject } from 'apollo-server';
import { GraphQLFieldResolver } from 'graphql';
import { getSessionDataFromRequest, SessionData } from './session';
import { getLanguage, getLazyTranslations, GetTranslations } from './translations';
import { getLazyLoggedUser, GetLoggedUser } from './user';

export type Context = {
    language: string;
    getTranslations: GetTranslations;
    session: SessionData | null;
    getUser: GetLoggedUser;
};

export type RootDocument = null;

export type RootResolver<TArgs = { [argName: string]: any }> = GraphQLFieldResolver<RootDocument, Context, TArgs>;

export type TypeResolver<TSource = any> = IResolverObject<TSource, Context>;

const createContext = async (req: IncomingMessage): Promise<Context> => {
    const session = await getSessionDataFromRequest(req);
    const language = getLanguage(req);

    return {
        language,
        session,
        getTranslations: getLazyTranslations(language),
        getUser: getLazyLoggedUser(session?.userId),
    };
};

export default createContext;
