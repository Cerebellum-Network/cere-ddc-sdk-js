module.exports = {
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "packages/**/*.{ts,js,jsx}"
  ],
  coveragePathIgnorePatterns: [
    "jest.config.js",
    "/node_modules/",
    "/build/",
    "/dist/"
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/build/",
    "/dist/"
  ],
  moduleNameMapper: {
    '^@cere-ddc-sdk/(.*)$': '<rootDir>/packages/$1/'
  },
  globalTeardown: "./jest.teardown.js",
  globalSetup: "./jest.setup.js",
  testTimeout: 10000
};
