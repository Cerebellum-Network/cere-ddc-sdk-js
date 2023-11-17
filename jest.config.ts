import type {Config} from 'jest';

const common: Config = {
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'node',

    testMatch: ['<rootDir>/tests/specs/**/*.spec.ts'],
    globalTeardown: './tests/setup/globalTeardown.ts',
    globalSetup: './tests/setup/globalSetup.ts',
    setupFilesAfterEnv: ['./tests/setup/setup.ts'],

    transform: {
        '\\.(js|ts)$': ['ts-jest', {useESM: true}],
    },
};

const config: Config = {
    verbose: true,
    testTimeout: 100000,
    projects: [
        {
            ...common,
            displayName: 'CI',
            transform: {
                '\\.(js|ts)$': ['ts-jest', {useESM: true, tsconfig: './tsconfig.build.json'}],
            },
        },
        {
            ...common,
            displayName: 'Dev',
            moduleNameMapper: {
                '^@cere-ddc-sdk/(.*)/types$': '<rootDir>/packages/$1/src/types',
                '^@cere-ddc-sdk/(.*)$': '<rootDir>/packages/$1/src',
            },
        },
    ],
};

export default config;
