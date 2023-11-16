import type {Config} from 'jest';

const config: Config = {
    verbose: true,
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'node',
    testTimeout: 100000,
    testMatch: ['<rootDir>/tests/specs/**/*.spec.ts'],
    moduleNameMapper: {
        '^@cere-ddc-sdk/(.*)/types$': '<rootDir>/packages/$1/src/types',
        '^@cere-ddc-sdk/(.*)$': '<rootDir>/packages/$1/src',
    },
    transform: {
        '\\.(js|ts)$': ['ts-jest', {useESM: true}],
    },
    globalTeardown: './tests/setup/globalTeardown.ts',
    globalSetup: './tests/setup/globalSetup.ts',
    setupFilesAfterEnv: ['./tests/setup/setup.ts'],
};

export default config;
