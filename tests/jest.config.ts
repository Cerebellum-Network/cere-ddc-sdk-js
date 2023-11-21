import * as path from 'path';
import type { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';
import * as paths from 'tsconfig-paths';

import { compilerOptions } from '../tsconfig.json';

const projectRoot = path.resolve(__dirname, '..');

paths.register({
  baseUrl: compilerOptions.baseUrl,
  paths: compilerOptions.paths,
});

const common: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],

  testMatch: ['<rootDir>/specs/**/*.spec.ts'],
  globalTeardown: './setup/globalTeardown.ts',
  globalSetup: './setup/globalSetup.ts',
  setupFilesAfterEnv: ['./setup/setup.ts'],

  transform: {
    '\\.(js|ts)$': 'ts-jest',
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
        '\\.(js|ts)$': ['ts-jest', { tsconfig: '../tsconfig.build.json' }],
      },
    },
    {
      ...common,
      displayName: 'Dev',
      modulePaths: [compilerOptions.baseUrl],
      moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
        prefix: projectRoot,
      }),
    },
  ],
};

export default config;
