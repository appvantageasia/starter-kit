import { i18n as I18n } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { ThemeProvider } from 'styled-components';
import Bootstrap from './Bootstrap';
import HomeRoute from './routes/HomeRoute';
import { RuntimeProvider, RuntimeConfig } from './runtimeConfig';
import theme from './theme';

export type AppProps = {
    i18n: I18n;
    runtime: RuntimeConfig;
};

const App = ({ i18n, runtime }: AppProps) => (
    <RuntimeProvider runtime={runtime}>
        <I18nextProvider i18n={i18n}>
            <ThemeProvider theme={theme}>
                <Bootstrap>
                    <HomeRoute />
                </Bootstrap>
            </ThemeProvider>
        </I18nextProvider>
    </RuntimeProvider>
);

export default App;
