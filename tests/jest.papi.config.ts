import 'ts-jest';
import * as path from 'path';
import type { Config } from 'jest';

// Dedicated ESM config for the papi live suite. `polkadot-api` (and its @polkadot-api/*,
// @scure/@noble tree) is ESM-only, and its chainHead client misbehaves when ts-jest
// down-compiles it to CJS (the client connects but chainHead_follow returns
// "Method not found"). Running under jest's native ESM VM lets papi load as real ESM —
// matching a plain `node` run, where the client works. Invoke with:
//   NODE_OPTIONS=--experimental-vm-modules jest --config jest.papi.config.ts
const config: Config = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testTimeout: 120_000,
  testMatch: ['<rootDir>/specs/papi*.spec.ts'],
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '\\.ts$': ['ts-jest', { useESM: true, tsconfig: path.resolve(__dirname, '../tsconfig.build.json') }],
  },
  // Let ESM-only deps load natively (do NOT transpile node_modules to CJS).
  transformIgnorePatterns: ['/node_modules/'],
  moduleNameMapper: { '^(\\.{1,2}/.*)\\.js$': '$1' },
};

export default config;
