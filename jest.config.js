module.exports = {
    roots: ['<rootDir>/src'],

    coverageDirectory: '<rootDir>/coverage',
    collectCoverageFrom: ['src/**/*.{js,ts,tsx}', '!src/**/__tests__/**/*.test.{js,ts,sx}', '!src/**/*.d.ts'],

    testMatch: ['<rootDir>/src/**/__tests__/**/*.{js,ts,tsx}'],
    testEnvironment: 'node',
    testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/src/__tests__/helpers/'],

    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

    transformIgnorePatterns: ['<rootDir>/node_modules/'],
    transform: {
        '\\.graphql$': 'jest-transform-graphql',
        '^.+\\.(js|jsx|ts|tsx)$': '<rootDir>/node_modules/babel-jest',
    },

    moduleNameMapper: {
        '\\.(css|less)$': 'identity-obj-proxy',
    },
};
