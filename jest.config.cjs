module.exports = {
    verbose: true,
    preset: 'ts-jest',
    testEnvironment: 'node',
    collectCoverage: true,
    coverageDirectory: 'coverage',
    collectCoverageFrom: ['packages/**/*.{ts}'],
    coveragePathIgnorePatterns: ['jest.config.cjs', 'test.ts', '/node_modules/', '/package/', '/dist/', '/src/'],
    roots: ['<rootDir>'],
    testPathIgnorePatterns: ['/node_modules/', '/package/', '/dist/', 'test.ts', '/src/'],
    moduleNameMapper: {
        '^@cere-ddc-sdk/(.*)/types$': '<rootDir>/packages/$1/src/types',
        '^@cere-ddc-sdk/(.*)$': '<rootDir>/packages/$1/src',
    },
    testMatch: ['<rootDir>/tests/specs/**/*.spec.ts'],
    transform: {
        '\\.(js|ts)$': require.resolve('babel-jest'),
    },
    globalTeardown: './tests/setup/globalTeardown.cjs',
    globalSetup: './tests/setup/globalSetup.cjs',
    setupFilesAfterEnv: ['./tests/setup/setup.ts'],
    testTimeout: 100000,
};
