import { from, ApolloClient, ApolloProvider, InMemoryCache, ApolloLink, NormalizedCacheObject } from '@apollo/client';
import { BatchHttpLink } from 'apollo-link-batch-http';
import { createUploadLink } from 'apollo-upload-client';
import { extractFiles } from 'extract-files';
import { i18n } from 'i18next';
import { Component, ReactElement } from 'react';
import { I18nContext } from 'react-i18next';

export type BootstrapProps = {
    children: ReactElement;
};

class Bootstrap extends Component<BootstrapProps> {
    private apolloClient: ApolloClient<NormalizedCacheObject>;

    // eslint-disable-next-line react/static-property-placement
    public context: { i18n: i18n };

    constructor(props) {
        super(props);

        // push the JWT token in headers
        const authLink = new ApolloLink((operation, forward) => {
            operation.setContext(({ headers }) => {
                const { i18n } = this.context;
                const customHeaders = { ...headers, 'Accept-Language': i18n.language };
                const token = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;

                if (token) {
                    customHeaders.Authorization = `Bearer ${token}`;
                }

                return {
                    headers: customHeaders,
                };
            });

            return forward(operation);
        });

        // if there's file we are going to use the upload link
        // otherwise use the batch http link
        const httpLink = ApolloLink.split(
            operation => extractFiles(operation).files.size > 0,
            createUploadLink({ uri: '/api' }),
            // @ts-ignore
            new BatchHttpLink({ uri: '/api' })
        );

        this.apolloClient = new ApolloClient({
            ssrMode: !process.browser,
            link: from([authLink, httpLink]),
            cache: new InMemoryCache(),
        });
    }

    render() {
        const { apolloClient } = this;
        const { children } = this.props;

        return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
    }
}

Bootstrap.contextType = I18nContext;

export default Bootstrap;
