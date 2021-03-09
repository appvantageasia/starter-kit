import { InitOptions } from 'i18next';

const defaultConfig: InitOptions = {
    defaultNS: 'common',
    ns: [],

    interpolation: {
        escapeValue: false,
        format: (value: string, format: string): string => (format === 'uppercase' ? value.toUpperCase() : value),
        formatSeparator: ',',
    },

    react: {
        useSuspense: false,
    },

    load: 'currentOnly',
};

export default defaultConfig;
