//ToDo fix tests for running from IDE (throws exception for "*.js" import) for example add plugin

module.exports = {
    verbose: true,
    preset: 'ts-jest',
    testEnvironment: 'node',
    collectCoverage: true,
    coverageDirectory: "coverage",
    collectCoverageFrom: [
        "packages/**/*.{ts,js,jsx}"
    ],
    coveragePathIgnorePatterns: [
        "jest.config.cjs",
        "/node_modules/",
        "/build/",
        "/src/"
    ],
    testPathIgnorePatterns: [
        "/node_modules/",
        "/build/",
        "/src/"
    ],
    moduleNameMapper: {
        '^@cere-ddc-sdk/(.*)$': '<rootDir>/packages/$1/'
    },
    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': require.resolve('babel-jest')
    },
    globalTeardown: "./jest.teardown.cjs",
    globalSetup: "./jest.setup.cjs",
    testTimeout: 10000
};
