import { createContext, ReactElement, ReactNode, useContext } from 'react';

export type RuntimeConfig = {
    version: string;

    locales: string[];
    defaultLocale: string;

    sentry: {
        dsn?: string;
        release?: string;
        environment?: string;
        tracing: boolean;
        tracesSampleRate: number;
    };
};

export const RuntimeContext = createContext<RuntimeConfig>(null);

export const useRuntimeConfig = () => useContext(RuntimeContext);

export type RuntimeProviderProps = {
    runtime: RuntimeConfig;
    children: ReactElement | ReactNode;
};

export const RuntimeProvider = ({ runtime, children }: RuntimeProviderProps) => (
    <RuntimeContext.Provider value={runtime}>{children}</RuntimeContext.Provider>
);
