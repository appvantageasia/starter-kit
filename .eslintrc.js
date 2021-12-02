const path = require('path');

module.exports = {
    root: true,

    // parsing
    parser: '@babel/eslint-parser',
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
        },
    },

    env: {
        browser: true,
        node: true,
    },

    plugins: ['prettier', 'react-hooks', 'graphql'],
    extends: ['airbnb', 'prettier'],

    // custom set of rules
    rules: {
        // use literal for graphql
        'graphql/template-strings': [
            'error',
            {
                env: 'literal',
            },
        ],

        // let prettier handle the code style errors
        'prettier/prettier': 'error',

        // no curly
        curly: ['error', 'all'],

        // specify for which imports extensions are required
        'import/extensions': [
            'error',
            {
                js: 'never',
                ts: 'never',
                json: 'always',
                graphql: 'always',
            },
        ],

        // order import statements
        'import/order': [
            'error',
            {
                alphabetize: {
                    order: 'asc',
                },
                pathGroups: [
                    {
                        // Put imported assets last
                        pattern: '*.{css,gif,jpeg,png,scss,svg}',
                        patternOptions: {
                            matchBase: true,
                        },
                        group: 'index',
                        position: 'after',
                    },
                ],
            },
        ],

        // prefer default exports
        'import/prefer-default-export': ['warn'],

        // max length of 120 character
        'max-len': ['warn', 120],

        // deprecate console.log and others
        'no-console': ['error', { allow: ['warn', 'error', 'info'] }],

        // allow to use continue statements and plus-plus as well as curly on new line
        'no-continue': 'off',
        'no-plusplus': 'off',
        'object-curly-newline': 'off',
        'no-underscore-dangle': 'off',
        'class-methods-use-this': 'off',

        // empty lines look bad
        'no-multiple-empty-lines': ['error', { max: 1, maxBOF: 0, maxEOF: 0 }],

        // restrict some syntax
        'no-restricted-syntax': ['error', 'ForInStatement', 'LabeledStatement', 'WithStatement'],

        // fix alignments
        'padding-line-between-statements': ['error', { blankLine: 'always', prev: '*', next: 'return' }],

        // yoda rule sucks
        yoda: ['error', 'never', { onlyEquality: true }],

        // add control on the Link component
        'jsx-a11y/anchor-is-valid': [
            'error',
            {
                components: ['Link'],
                specialLink: ['to'],
                aspects: ['noHref', 'invalidHref', 'preferButton'],
            },
        ],

        // single quotes only
        'jsx-quotes': ['error', 'prefer-double'],

        // help with react
        'react/function-component-definition': [
            'error',
            {
                namedComponents: 'arrow-function',
            },
        ],
        'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
        'react/jsx-indent': ['error', 4],
        'react/jsx-indent-props': ['error', 4],
        'react/jsx-no-useless-fragment': 'error',
        'react/jsx-on-expression-per-line': 'off',
        'react/jsx-props-no-spreading': 'off',
        'react/jsx-sort-default-props': 'error',
        'react/jsx-sort-props': [
            'error',
            {
                reservedFirst: true,
                shorthandLast: true,
            },
        ],
        'react/require-default-props': 'off',
        'react/sort-prop-types': 'error',

        'react-hooks/exhaustive-deps': [
            'warn',
            {
                additionalHooks: 'useHandleError',
            },
        ],

        // no need to import React with nextjs
        'react/react-in-jsx-scope': 'off',

        'import/no-extraneous-dependencies': [
            'error',
            { devDependencies: true, packageDir: path.join(__dirname, './') },
        ],
    },

    // override for typescript
    overrides: [
        {
            // parsing
            parser: '@typescript-eslint/parser',
            parserOptions: {
                ecmaVersion: 2019,
                sourceType: 'module',
                // typescript-eslint specific options
                warnOnUnsupportedTypeScriptVersion: true,
            },

            plugins: ['@typescript-eslint'],

            // only for typescript files
            files: ['**/*.ts', '**/*.tsx'],

            // custom rules
            rules: {
                '@typescript-eslint/no-inferrable-types': 'off',

                // TypeScript's `noFallthroughCasesInSwitch` option is more robust (#6906)
                'default-case': 'off',
                // 'tsc' already handles this (https://github.com/typescript-eslint/typescript-eslint/issues/291)
                'no-dupe-class-members': 'off',
                // 'tsc' already handles this (https://github.com/typescript-eslint/typescript-eslint/issues/477)
                'no-undef': 'off',
                // 'tsc' already handle this
                // (https://github.com/typescript-eslint/typescript-eslint/releases/tag/v4.0.0)
                'no-shadow': 'off',

                // Add TypeScript specific rules (and turn off ESLint equivalents)
                '@typescript-eslint/consistent-type-assertions': 'warn',
                'no-array-constructor': 'off',
                '@typescript-eslint/no-array-constructor': 'warn',
                'no-use-before-define': 'off',
                '@typescript-eslint/no-use-before-define': [
                    'warn',
                    {
                        functions: false,
                        classes: false,
                        variables: false,
                        typedefs: false,
                    },
                ],
                'no-unused-expressions': 'off',
                '@typescript-eslint/no-unused-expressions': [
                    'error',
                    {
                        allowShortCircuit: true,
                        allowTernary: true,
                        allowTaggedTemplates: true,
                    },
                ],
                'no-unused-vars': 'off',
                '@typescript-eslint/no-unused-vars': [
                    'warn',
                    {
                        args: 'none',
                        ignoreRestSiblings: true,
                    },
                ],
                'no-useless-constructor': 'off',
                '@typescript-eslint/no-useless-constructor': 'warn',

                'react/jsx-filename-extension': ['error', { extensions: ['.tsx'] }],
            },
        },
    ],

    globals: {
        React: 'writable',
    },

    settings: {
        'import/resolver': {
            node: {
                extensions: ['.mjs', '.csj', '.js', '.ts', '.tsx', '.json'],
            },
        },
    },
};
