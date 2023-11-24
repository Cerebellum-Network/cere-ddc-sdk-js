import 'ts-jest';
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  verbose: true,
  testTimeout: 100000,

  testMatch: ['<rootDir>/specs/**/*.spec.ts'],
  globalTeardown: './setup/globalTeardown.ts',
  globalSetup: './setup/globalSetup.ts',
  setupFilesAfterEnv: ['./setup/setup.ts'],

  transform: {
    '\\.(js|ts)$': [
      'ts-jest',
      {
        tsconfig: '../tsconfig.build.json',
      },
    ],
  },
};

export default config;
