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
  testMatch: [
    '<rootDir>/specs/ChainCompat.spec.ts',
    '<rootDir>/specs/metadata-audit.spec.ts',
    '<rootDir>/specs/papi.spec.ts',
  ],
  transform: {
    '\\.(js|ts)$': ['ts-jest', { tsconfig: path.resolve(__dirname, '../tsconfig.build.json') }],
  },
  // papi.spec.ts pulls in `polkadot-api`, which ships ESM-only dist output (no CJS
  // build) with a deep transitive tree of equally ESM-only packages (`@polkadot-api/*`,
  // `@scure/*`, `@noble/*`, ...). Jest's default `transformIgnorePatterns` skips all of
  // `node_modules`, so Node's CJS `require()` chokes on their bare `export` syntax.
  // Rather than enumerate every transitive package, transform all of `node_modules`
  // here too — this config only runs the small opt-in live-chain suite.
  transformIgnorePatterns: [],
};

export default config;
