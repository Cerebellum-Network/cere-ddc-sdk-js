import 'ts-jest';
import * as path from 'path';
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  verbose: true,
  testTimeout: 2 * 60_000, // 2 mins (for tests with large file uploads and downloads)
  slowTestThreshold: 1 * 60_000,

  testMatch: ['<rootDir>/specs/**/*.spec.ts'],
  globalTeardown: './setup/globalTeardown.ts',
  globalSetup: './setup/globalSetup.ts',
  setupFilesAfterEnv: ['./setup/setup.ts'],

  transform: {
    '\\.(js|ts)$': [
      'ts-jest',
      {
        tsconfig: path.resolve(__dirname, '../tsconfig.build.json'),
      },
    ],
  },
};

export default config;
