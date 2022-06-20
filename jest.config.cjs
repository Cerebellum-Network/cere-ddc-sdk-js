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
        "/dist/"
    ],
    testPathIgnorePatterns: [
        "/node_modules/",
        "/build/",
        "/dist/"
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
