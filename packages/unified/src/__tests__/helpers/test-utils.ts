// Import jest from global scope (available in test environment)
import { UnifiedSDK } from '../../UnifiedSDK';
import { UnifiedSDKConfig } from '../../types';
import { createMockConfig } from './test-fixtures';

/**
 * Mock setup utilities
 */
export const setupMockDDCClient = () => {
  const mockDdcClient = {
    store: jest.fn().mockResolvedValue({
      toString: () => '0xabc123',
      size: 1024,
      status: 'stored',
    }),
    storeBatch: jest.fn().mockResolvedValue([
      {
        toString: () => '0xabc123',
        size: 1024,
        status: 'stored',
      },
    ]),
    disconnect: jest.fn().mockResolvedValue(undefined),
  };

  // Mock the module differently for better compatibility
  jest.mock('@cere-ddc-sdk/ddc-client', () => ({
    DdcClient: {
      create: jest.fn().mockResolvedValue(mockDdcClient),
    },
  }));

  // Also set up the mock for immediate use
  const ddcModule = require('@cere-ddc-sdk/ddc-client');
  ddcModule.DdcClient.create = jest.fn().mockResolvedValue(mockDdcClient);

  return mockDdcClient;
};

export const setupMockActivitySDK = () => {
  const mockEventDispatcher = {
    dispatchEvent: jest.fn().mockResolvedValue(true),
  };
  const mockSigner = {
    sign: jest.fn().mockResolvedValue('mock-signature'),
    verify: jest.fn().mockResolvedValue(true),
    address: '0xtest123',
  };
  const mockCipher = {
    encrypt: jest.fn().mockImplementation((data) => Promise.resolve(data)),
    decrypt: jest.fn().mockImplementation((data) => Promise.resolve(data)),
  };

  // Mock the modules properly
  jest.mock('@cere-activity-sdk/events', () => ({
    EventDispatcher: jest.fn().mockImplementation(() => mockEventDispatcher),
  }));

  jest.mock('@cere-activity-sdk/signers', () => ({
    UriSigner: jest.fn().mockImplementation(() => mockSigner),
  }));

  jest.mock('@cere-activity-sdk/ciphers', () => ({
    NoOpCipher: jest.fn().mockImplementation(() => mockCipher),
  }));

  // Also set up for immediate use
  try {
    const eventsModule = require('@cere-activity-sdk/events');
    const signersModule = require('@cere-activity-sdk/signers');
    const ciphersModule = require('@cere-activity-sdk/ciphers');

    eventsModule.EventDispatcher = jest.fn().mockImplementation(() => mockEventDispatcher);
    signersModule.UriSigner = jest.fn().mockImplementation(() => mockSigner);
    ciphersModule.NoOpCipher = jest.fn().mockImplementation(() => mockCipher);
  } catch (error) {
    // Modules might not be available in test environment
  }

  return { mockEventDispatcher, mockSigner, mockCipher };
};

/**
 * SDK initialization helper
 */
export const createInitializedSDK = async (configOverrides: Partial<UnifiedSDKConfig> = {}) => {
  const config = createMockConfig(configOverrides);
  const sdk = new UnifiedSDK(config);

  // Setup mocks
  setupMockDDCClient();
  setupMockActivitySDK();

  await sdk.initialize();
  return sdk;
};

/**
 * Mock component helpers
 */
export const setupMockComponents = (sdk: UnifiedSDK) => {
  const mockRulesInterpreter = (sdk as any).rulesInterpreter;
  const mockDispatcher = (sdk as any).dispatcher;
  const mockOrchestrator = (sdk as any).orchestrator;

  return {
    mockRulesInterpreter,
    mockDispatcher,
    mockOrchestrator,
  };
};

/**
 * Common test expectations
 */
export const expectSuccessfulWrite = (result: any) => {
  expect(result.status).toBe('success');
  expect(result.transactionId).toMatch(/^txn_/);
  expect(result.dataCloudHash).toBeDefined();
};

export const expectPartialWrite = (result: any) => {
  expect(result.status).toBe('partial');
  expect(result.errors).toBeDefined();
  expect(result.errors.length).toBeGreaterThan(0);
};

export const expectFailedWrite = (result: any) => {
  expect(result.status).toBe('failed');
  expect(result.errors).toBeDefined();
  expect(result.errors.length).toBeGreaterThan(0);
};

/**
 * Performance test helpers
 */
export const measureExecutionTime = async (fn: () => Promise<any>) => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  return {
    result,
    executionTime: end - start,
  };
};

/**
 * Mock logger utility
 */
export const createMockLogger = () => {
  return jest.fn((level: string, message: string, ...args: any[]) => {
    // Optional: log to console during development
    // console.log(`[${level.toUpperCase()}] ${message}`, ...args);
  });
};

/**
 * Test data generators
 */
export const generateTestData = {
  randomString: (length: number = 10) =>
    Math.random()
      .toString(36)
      .substring(2, length + 2),
  randomUserId: () => `user_${Math.random().toString(36).substring(2, 9)}`,
  randomChatId: () => `chat_${Math.random().toString(36).substring(2, 9)}`,
  randomCampaignId: () => `campaign_${Math.random().toString(36).substring(2, 9)}`,
  randomTransactionId: () => `txn_${Math.random().toString(36).substring(2, 12)}`,
};

/**
 * Async test helpers
 */
export const waitFor = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const retryUntil = async (
  condition: () => boolean | Promise<boolean>,
  maxAttempts: number = 10,
  delay: number = 100,
) => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = await condition();
    if (result) return true;
    await waitFor(delay);
  }
  return false;
};
