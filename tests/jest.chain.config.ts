import 'ts-jest';
import * as path from 'path';
import type { Config } from 'jest';

// Live-chain compat suite: same transform as jest.config.ts, but NO globalSetup/
// globalTeardown/setupFilesAfterEnv — those spin up docker and call pre-migration
// pallet signatures (broken repo-wide). These tests talk to live chains directly.
const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testTimeout: 120_000,
  // Specs that either talk to live chains or are pure unit tests — neither needs the
  // docker-based globalSetup (broken repo-wide against the pre-migration harness).
  testMatch: ['<rootDir>/specs/ChainCompat.spec.ts', '<rootDir>/specs/metadata-audit.spec.ts'],
  transform: {
    '\\.(js|ts)$': ['ts-jest', { tsconfig: path.resolve(__dirname, '../tsconfig.build.json') }],
  },
};

export default config;
