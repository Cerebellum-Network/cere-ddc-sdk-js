import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  verbose: true,
  testTimeout: 30_000,

  testMatch: ['<rootDir>/src/**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],

  transform: {
    '\\.(js|ts)$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.json',
      },
    ],
  },

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '@cere-ddc-sdk/ddc-client': '<rootDir>/src/__tests__/__mocks__/ddc-client.ts',
    '@cere-activity-sdk/events': '<rootDir>/src/__tests__/__mocks__/activity-events.ts',
    '@cere-activity-sdk/signers': '<rootDir>/src/__tests__/__mocks__/activity-signers.ts',
    '@cere-activity-sdk/ciphers': '<rootDir>/src/__tests__/__mocks__/activity-ciphers.ts',
  },

  collectCoverage: false,
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.test.ts', '!src/**/*.d.ts'],

  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};

export default config;
