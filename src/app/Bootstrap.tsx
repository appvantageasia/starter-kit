import { ApolloClient, ApolloProvider, NormalizedCacheObject } from '@apollo/client';
import { i18n as I18n } from 'i18next';
import { Component, ReactElement } from 'react';
import { I18nContext } from 'react-i18next';

export type ContextGetter = () => { i18n: I18n; token: string | undefined };

export type BootstrapProps = {
    createApolloClient: (getContext: ContextGetter) => ApolloClient<NormalizedCacheObject>;
    children: ReactElement;
};

class Bootstrap extends Component<BootstrapProps> {
    constructor(props: BootstrapProps) {
        super(props);

        const getContext = () => {
            const { i18n } = this.context;
            const token = typeof window !== 'undefined' ? localStorage.getItem('jwt') : undefined;

            return { i18n, token };
        };

        this.apolloClient = props.createApolloClient(getContext);
    }

    private apolloClient: ApolloClient<NormalizedCacheObject>;

    // eslint-disable-next-line react/static-property-placement
    public context: { i18n: I18n };

    render() {
        const { apolloClient } = this;
        const { children } = this.props;

        return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
    }
}

Bootstrap.contextType = I18nContext;

export default Bootstrap;
