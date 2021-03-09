import { i18n as I18n } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { ThemeProvider } from 'styled-components';
import Bootstrap, { BootstrapProps } from './Bootstrap';
import MainRouter from './MainRouter';
import { RuntimeProvider, RuntimeConfig } from './runtimeConfig';
import theme from './theme';

export type AppProps = {
    i18n: I18n;
    runtime: RuntimeConfig;
    createApolloClient: BootstrapProps['createApolloClient'];
};

const App = ({ i18n, runtime, createApolloClient }: AppProps) => (
    <RuntimeProvider runtime={runtime}>
        <I18nextProvider i18n={i18n}>
            <ThemeProvider theme={theme}>
                <Bootstrap createApolloClient={createApolloClient}>
                    <MainRouter />
                </Bootstrap>
            </ThemeProvider>
        </I18nextProvider>
    </RuntimeProvider>
);

export default App;
