import {
  UnifiedSDKConfig,
  TelegramEventData,
  TelegramMessageData,
  BullishCampaignEvent,
  ProcessingMetadata,
  UnifiedMetadata,
} from '../../types';

/**
 * Common test configurations
 */
export const createMockConfig = (overrides: Partial<UnifiedSDKConfig> = {}): UnifiedSDKConfig => ({
  ddcConfig: {
    signer: '//Alice',
    bucketId: BigInt(12345),
    network: 'testnet',
    ...overrides.ddcConfig,
  },
  activityConfig: {
    keyringUri: '//Alice',
    appId: 'test-app',
    endpoint: 'https://api.stats.cere.network',
    appPubKey: 'test-key',
    dataServicePubKey: 'test-service-key',
    ...overrides.activityConfig,
  },
  processing: {
    enableBatching: true,
    defaultBatchSize: 100,
    defaultBatchTimeout: 5000,
    maxRetries: 3,
    retryDelay: 1000,
    ...overrides.processing,
  },
  logging: {
    level: 'info',
    enableMetrics: true,
    ...overrides.logging,
  },
});

/**
 * Test data fixtures
 */
export const mockTelegramEvent = (): TelegramEventData => ({
  eventType: 'quest_completed',
  userId: 'user123',
  chatId: 'chat456',
  eventData: { questId: 'daily', points: 100 },
  timestamp: new Date('2024-01-01T12:00:00Z'),
});

export const mockTelegramMessage = (): TelegramMessageData => ({
  messageId: 'msg_123',
  userId: 'user123',
  chatId: 'chat456',
  messageText: 'Test message',
  messageType: 'text',
  timestamp: new Date('2024-01-01T12:00:00Z'),
  metadata: {
    isForwarded: false,
    replyToMessageId: null,
  },
});

export const mockBullishEvent = (): BullishCampaignEvent => ({
  eventType: 'SEGMENT_WATCHED',
  accountId: 'user123',
  campaignId: 'campaign_456',
  payload: {
    symbol: 'BTC',
    prediction: 'bullish',
    confidence: 0.85,
  },
  timestamp: new Date('2024-01-01T12:00:00Z'),
});

/**
 * Processing metadata fixtures
 */
export const createMockProcessingMetadata = (overrides: Partial<ProcessingMetadata> = {}): ProcessingMetadata => ({
  dataCloudWriteMode: 'direct',
  indexWriteMode: 'realtime',
  priority: 'normal',
  encryption: false,
  ...overrides,
});

export const createMockMetadata = (overrides: Partial<UnifiedMetadata> = {}): UnifiedMetadata => ({
  processing: createMockProcessingMetadata(overrides.processing),
  userContext: {
    source: 'telegram',
    userId: 'user123',
    ...overrides.userContext,
  },
  traceId: 'trace_abc123',
  ...overrides,
});

/**
 * Common test scenarios
 */
export const testScenarios = {
  directWrite: {
    metadata: createMockMetadata({
      processing: { dataCloudWriteMode: 'direct', indexWriteMode: 'realtime' },
    }),
    expectedActions: ['ddc-client', 'activity-sdk'],
  },
  batchWrite: {
    metadata: createMockMetadata({
      processing: {
        dataCloudWriteMode: 'batch',
        indexWriteMode: 'realtime',
        batchOptions: { maxSize: 100, maxWaitTime: 5000 },
      },
    }),
    expectedActions: ['ddc-client', 'activity-sdk'],
  },
  viaIndexWrite: {
    metadata: createMockMetadata({
      processing: { dataCloudWriteMode: 'viaIndex', indexWriteMode: 'realtime' },
    }),
    expectedActions: ['activity-sdk'],
  },
  skipIndex: {
    metadata: createMockMetadata({
      processing: { dataCloudWriteMode: 'direct', indexWriteMode: 'skip' },
    }),
    expectedActions: ['ddc-client'],
  },
};

/**
 * Mock response generators
 */
export const mockResponses = {
  ddcSuccess: {
    cid: '0xabc123',
    status: 'stored',
    size: 1024,
  },
  ddcError: new Error('DDC storage failed'),
  activitySuccess: {
    eventId: 'evt_123',
    status: 'indexed',
    timestamp: new Date(),
  },
  activityError: new Error('Activity indexing failed'),
};

/**
 * Performance test helpers
 */
export const createLargePayload = (sizeInKB: number): Record<string, any> => {
  const data = 'x'.repeat(sizeInKB * 1024);
  return {
    type: 'large_payload',
    data,
    metadata: {
      size: sizeInKB,
      timestamp: new Date(),
    },
  };
};

export const createBatchPayload = (count: number): Array<Record<string, any>> => {
  return Array.from({ length: count }, (_, i) => ({
    id: `item_${i}`,
    data: `test_data_${i}`,
    timestamp: new Date(),
  }));
};
