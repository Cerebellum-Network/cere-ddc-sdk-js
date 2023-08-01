//ToDo fix tests for running from IDE (throws exception for "*.js" import) for example add plugin

module.exports = {
    verbose: true,
    preset: 'ts-jest',
    testEnvironment: 'node',
    collectCoverage: true,
    coverageDirectory: 'coverage',
    collectCoverageFrom: ['packages/**/*.{ts}'],
    coveragePathIgnorePatterns: [
        'jest.config.cjs',
        'test.ts',
        '/node_modules/',
        '/package/',
        '/dist/',
        '/scripts/',
        '/src/',
    ],
    roots: ['<rootDir>'],
    testPathIgnorePatterns: ['/node_modules/', '/package/', '/dist/', 'test.ts', '/src/'],
    moduleNameMapper: {
        '^@cere-ddc-sdk/(.*)/types$': '<rootDir>/packages/$1/src/types',
        '^@cere-ddc-sdk/(.*)$': '<rootDir>/packages/$1/src',
    },
    testMatch: ['<rootDir>/tests/**/*.spec.ts'],
    transform: {
        '\\.(js|ts)$': require.resolve('babel-jest'),
    },
    globalTeardown: './jest.teardown.cjs',
    globalSetup: './jest.setup.cjs',
    testTimeout: 100000,
};
