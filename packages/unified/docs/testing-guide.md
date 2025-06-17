# Unified SDK Testing Guide

## Overview

The Unified SDK includes comprehensive testing infrastructure covering unit tests, integration tests, and end-to-end testing scenarios. This guide covers testing strategies, patterns, and how to write tests for new features.

## Testing Architecture

### Test Structure

```
src/__tests__/
├── unit/                          # Unit tests for individual components
│   ├── UnifiedSDK.test.ts        # Main SDK functionality
│   ├── UnifiedSDK.autoDetection.test.ts  # Data type detection
│   ├── UnifiedSDK.nightingale.test.ts    # Nightingale data types
│   ├── RulesInterpreter.test.ts  # Metadata validation and rules
│   ├── Dispatcher.test.ts        # Request routing and actions
│   └── Orchestrator.test.ts      # Action execution
├── integration/                   # Integration tests
│   ├── ddc-integration.test.ts   # DDC Client integration
│   ├── activity-integration.test.ts  # Activity SDK integration
│   └── end-to-end.test.ts        # Complete workflows
├── helpers/                       # Test utilities and fixtures
│   ├── test-fixtures.ts          # Mock data and fixtures
│   ├── test-utils.ts             # Test utility functions
│   └── mock-implementations.ts   # Mock service implementations
└── __mocks__/                     # Jest mocks
    ├── ddc-client.ts             # DDC Client mocks
    └── activity-sdk.ts           # Activity SDK mocks
```

### Test Categories

1. **Unit Tests**: Test individual components in isolation
2. **Integration Tests**: Test component interactions
3. **End-to-End Tests**: Test complete workflows
4. **Performance Tests**: Test performance characteristics
5. **Error Handling Tests**: Test error scenarios and recovery

## Running Tests

### All Tests
```bash
npm test
```

### Specific Test Suites
```bash
# Unit tests only
npm test -- --testPathPattern=unit

# Integration tests only
npm test -- --testPathPattern=integration

# Specific component tests
npm test -- --testPathPattern=UnifiedSDK

# Nightingale-specific tests
npm test -- --testPathPattern=nightingale

# Watch mode for development
npm run test:watch
```

### Test Coverage
```bash
# Generate coverage report
npm test -- --coverage

# View coverage in browser
npm test -- --coverage --coverageReporters=html
open coverage/lcov-report/index.html
```

## Unit Testing Patterns

### Component Testing with Mocks

```typescript
// Example: UnifiedSDK unit test
import { UnifiedSDK } from '../../UnifiedSDK';
import { mockTelegramEvent, createMockConfig } from '../helpers/test-fixtures';

// Mock all dependencies
jest.mock('../../RulesInterpreter');
jest.mock('../../Dispatcher');
jest.mock('../../Orchestrator');

describe('UnifiedSDK', () => {
  let sdk: UnifiedSDK;
  let mockConfig: any;

  beforeEach(async () => {
    mockConfig = createMockConfig();
    sdk = new UnifiedSDK(mockConfig);

    // Setup successful initialization
    const mockOrchestrator = (sdk as any).orchestrator;
    mockOrchestrator.initialize = jest.fn().mockResolvedValue(undefined);
    await sdk.initialize();

    jest.clearAllMocks();
  });

  afterEach(async () => {
    await sdk.cleanup();
  });

  describe('Data Type Detection', () => {
    it('should detect Telegram events correctly', async () => {
      const eventData = mockTelegramEvent();
      
      // Setup component mocks
      const mockRulesInterpreter = (sdk as any).rulesInterpreter;
      const mockDispatcher = (sdk as any).dispatcher;
      const mockOrchestrator = (sdk as any).orchestrator;

      mockRulesInterpreter.validateMetadata = jest.fn().mockReturnValue({
        processing: {
          dataCloudWriteMode: 'viaIndex',
          indexWriteMode: 'realtime',
        },
      });
      
      mockRulesInterpreter.extractProcessingRules = jest.fn().mockReturnValue({
        dataCloudAction: 'write_via_index',
        indexAction: 'write_realtime',
        batchingRequired: false,
      });
      
      mockDispatcher.routeRequest = jest.fn().mockReturnValue({
        actions: [{ target: 'activity-sdk', method: 'sendEvent' }],
        executionMode: 'sequential',
      });
      
      mockOrchestrator.execute = jest.fn().mockResolvedValue({
        results: [{ target: 'activity-sdk', success: true, response: { eventId: 'evt_123' } }],
        overallStatus: 'success',
        transactionId: 'txn_123',
      });

      const result = await sdk.writeData(eventData);

      expect(result.status).toBe('success');
      expect(result.indexId).toBe('evt_123');
      
      // Verify correct metadata was generated
      expect(mockRulesInterpreter.validateMetadata).toHaveBeenCalledWith(
        expect.objectContaining({
          userContext: expect.objectContaining({
            source: 'telegram',
            eventType: eventData.eventType,
            userId: eventData.userId,
          }),
        })
      );
    });
  });
});
```

### Data Type-Specific Testing

#### Telegram Event Testing
```typescript
describe('Telegram Event Processing', () => {
  it('should process quest completion events', async () => {
    const questEvent = {
      eventType: 'quest_completed',
      userId: 'user123',
      chatId: 'chat456',
      eventData: {
        questId: 'daily-check-in',
        points: 100,
        level: 5,
      },
      timestamp: new Date(),
    };

    const result = await sdk.writeData(questEvent);
    
    expect(result.status).toBe('success');
    expect(result.metadata.dataType).toBe('telegram_event');
  });

  it('should process message storage', async () => {
    const message = {
      messageId: 'msg789',
      chatId: 'chat456',
      userId: 'user123',
      messageText: 'Hello world!',
      messageType: 'text',
      timestamp: new Date(),
    };

    const result = await sdk.writeData(message);
    
    expect(result.status).toBe('success');
    expect(result.dataCloudHash).toBeDefined();
    expect(result.indexId).toBeDefined();
  });
});
```

#### Bullish Campaign Testing
```typescript
describe('Bullish Campaign Processing', () => {
  it('should process video segment completion', async () => {
    const segmentEvent = {
      eventType: 'SEGMENT_WATCHED',
      campaignId: 'bullish_education_2024',
      accountId: 'user_12345',
      payload: {
        segmentId: 'trading_basics_001',
        watchDuration: 300000,
        completionPercentage: 100,
      },
      questId: 'education_quest_001',
      timestamp: new Date(),
    };

    const result = await sdk.writeData(segmentEvent);
    
    expect(result.status).toBe('success');
    expect(result.metadata.campaignContext).toEqual({
      campaignId: 'bullish_education_2024',
      questId: 'education_quest_001',
    });
  });

  it('should process quiz answers with scoring', async () => {
    const quizEvent = {
      eventType: 'QUESTION_ANSWERED',
      campaignId: 'bullish_quiz_challenge',
      accountId: 'user_67890',
      payload: {
        questionId: 'q_trading_001',
        selectedAnswer: 'A market with rising prices',
        isCorrect: true,
        timeToAnswer: 15000,
        points: 10,
      },
      timestamp: new Date(),
    };

    const result = await sdk.writeData(quizEvent);
    
    expect(result.status).toBe('success');
    expect(result.metadata.questTracking).toBe(true);
  });
});
```

#### Nightingale Data Testing
```typescript
describe('Nightingale Data Processing', () => {
  it('should process RGB video streams', async () => {
    const videoStream = {
      droneId: 'drone_001',
      streamId: 'stream_video_123',
      timestamp: new Date(),
      videoMetadata: {
        duration: 300000,
        fps: 30,
        resolution: '1920x1080',
        codec: 'h264',
        streamType: 'rgb',
      },
      chunks: [
        {
          chunkId: 'chunk_001',
          startTime: 0,
          endTime: 10000,
          data: Buffer.from('video_chunk_data'),
          size: 2048000,
        },
      ],
    };

    const result = await sdk.writeData(videoStream);
    
    expect(result.status).toBe('success');
    expect(result.dataCloudHash).toBeDefined();
    expect(result.metadata.droneContext).toEqual({
      droneId: 'drone_001',
      streamId: 'stream_video_123',
      streamType: 'rgb',
    });
  });

  it('should process thermal video streams', async () => {
    const thermalVideo = {
      droneId: 'drone_thermal_001',
      streamId: 'stream_thermal_456',
      timestamp: new Date(),
      videoMetadata: {
        duration: 180000,
        fps: 60,
        resolution: '640x480',
        codec: 'flir',
        streamType: 'thermal',
      },
      chunks: [
        {
          chunkId: 'thermal_chunk_001',
          startTime: 0,
          endTime: 5000,
          data: Buffer.from('thermal_data'),
          size: 1024000,
        },
      ],
    };

    const result = await sdk.writeData(thermalVideo);
    
    expect(result.status).toBe('success');
    expect(result.metadata.droneContext.streamType).toBe('thermal');
  });

  it('should process KLV metadata', async () => {
    const klvData = {
      droneId: 'drone_001',
      streamId: 'stream_video_123',
      timestamp: new Date(),
      pts: 1000,
      klvMetadata: {
        type: 'ST 0601',
        missionId: 'mission_alpha_001',
        platform: {
          headingAngle: 45.5,
          pitchAngle: -2.1,
          rollAngle: 1.3,
        },
        sensor: {
          latitude: 40.7128,
          longitude: -74.0060,
          trueAltitude: 1500.0,
          horizontalFieldOfView: 60.0,
          verticalFieldOfView: 45.0,
          relativeAzimuth: 90.0,
          relativeElevation: 15.0,
          relativeRoll: 0.5,
        },
        frameCenter: {
          latitude: 40.7129,
          longitude: -74.0061,
          elevation: 100.0,
        },
        fields: {
          timestamp: new Date().toISOString(),
          securityClassification: 'UNCLASSIFIED',
        },
      },
    };

    const result = await sdk.writeData(klvData);
    
    expect(result.status).toBe('success');
    expect(result.indexId).toBeDefined();
    expect(result.metadata.coordinateIndexing).toBe(true);
  });

  it('should process telemetry data', async () => {
    const telemetry = {
      droneId: 'drone_001',
      timestamp: new Date(),
      telemetryData: {
        gps: { lat: 40.7128, lng: -74.0060, alt: 150.5 },
        orientation: { pitch: 2.1, roll: -1.3, yaw: 45.5 },
        velocity: { x: 10.5, y: 2.3, z: 0.1 },
        battery: 85,
        signalStrength: 92,
      },
      coordinates: {
        latitude: 40.7128,
        longitude: -74.0060,
        altitude: 150.5,
      },
      missionId: 'mission_alpha_001',
    };

    const result = await sdk.writeData(telemetry);
    
    expect(result.status).toBe('success');
    expect(result.dataCloudHash).toBeDefined();
    expect(result.indexId).toBeDefined();
  });

  it('should process frame analysis results', async () => {
    const frameAnalysis = {
      droneId: 'drone_001',
      streamId: 'stream_video_123',
      frameId: 'frame_001_1000',
      timestamp: new Date(),
      pts: 1000,
      frameData: {
        base64EncodedData: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        metadata: {
          width: 1920,
          height: 1080,
          format: 'jpeg',
        },
      },
      analysisResults: {
        objects: [
          {
            type: 'person',
            confidence: 0.95,
            boundingBox: [100, 200, 150, 300],
          },
          {
            type: 'vehicle',
            confidence: 0.87,
            boundingBox: [500, 400, 200, 100],
          },
        ],
        features: {
          sceneType: 'urban',
          lightingConditions: 'daylight',
        },
      },
    };

    const result = await sdk.writeData(frameAnalysis);
    
    expect(result.status).toBe('success');
    expect(result.dataCloudHash).toBeDefined();
    expect(result.indexId).toBeDefined();
  });
});
```

### Component Testing

#### RulesInterpreter Testing
```typescript
describe('RulesInterpreter', () => {
  let interpreter: RulesInterpreter;

  beforeEach(() => {
    interpreter = new RulesInterpreter();
  });

  describe('Metadata Validation', () => {
    it('should validate correct metadata', () => {
      const metadata = {
        processing: {
          dataCloudWriteMode: 'direct',
          indexWriteMode: 'realtime',
          priority: 'high',
        },
        userContext: {
          source: 'telegram',
          userId: 'user123',
        },
      };

      const result = interpreter.validateMetadata(metadata);
      expect(result).toEqual(metadata);
    });

    it('should reject invalid metadata', () => {
      const invalidMetadata = {
        processing: {
          dataCloudWriteMode: 'invalid_mode',
          indexWriteMode: 'realtime',
        },
      };

      expect(() => {
        interpreter.validateMetadata(invalidMetadata);
      }).toThrow(ValidationError);
    });

    it('should enforce business rules', () => {
      const invalidRules = {
        processing: {
          dataCloudWriteMode: 'skip',
          indexWriteMode: 'skip', // Both cannot be skip
        },
      };

      expect(() => {
        interpreter.validateMetadata(invalidRules);
      }).toThrow('Both data cloud and index actions cannot be skip');
    });
  });

  describe('Rule Extraction', () => {
    it('should extract processing rules correctly', () => {
      const metadata = {
        processing: {
          dataCloudWriteMode: 'direct',
          indexWriteMode: 'realtime',
          priority: 'high',
          encryption: true,
        },
      };

      const rules = interpreter.extractProcessingRules(metadata);
      
      expect(rules).toEqual({
        dataCloudAction: 'write_direct',
        indexAction: 'write_realtime',
        batchingRequired: false,
        additionalParams: {
          priority: 'high',
          encryption: true,
        },
      });
    });
  });

  describe('Rule Optimization', () => {
    it('should optimize for large payloads', () => {
      const rules = {
        dataCloudAction: 'write_batch',
        indexAction: 'write_realtime',
        batchingRequired: true,
        additionalParams: {
          priority: 'normal',
          encryption: false,
          batchOptions: {
            maxSize: 1000,
            maxWaitTime: 5000,
          },
        },
      };

      const context = { payloadSize: 5 * 1024 * 1024 }; // 5MB
      const optimized = interpreter.optimizeProcessingRules(rules, context);
      
      expect(optimized.additionalParams.batchOptions.maxSize).toBeLessThan(1000);
    });

    it('should optimize for high priority', () => {
      const rules = {
        dataCloudAction: 'write_batch',
        indexAction: 'write_realtime',
        batchingRequired: true,
        additionalParams: {
          priority: 'high',
          encryption: false,
          batchOptions: {
            maxSize: 1000,
            maxWaitTime: 5000,
          },
        },
      };

      const optimized = interpreter.optimizeProcessingRules(rules);
      
      expect(optimized.additionalParams.batchOptions.maxWaitTime).toBeLessThan(5000);
    });
  });
});
```

#### Dispatcher Testing
```typescript
describe('Dispatcher', () => {
  let dispatcher: Dispatcher;

  beforeEach(() => {
    dispatcher = new Dispatcher();
  });

  describe('Request Routing', () => {
    it('should create correct actions for direct storage', () => {
      const payload = { data: 'test data' };
      const rules = {
        dataCloudAction: 'write_direct',
        indexAction: 'write_realtime',
        batchingRequired: false,
        additionalParams: {
          priority: 'normal',
          encryption: false,
        },
      };

      const plan = dispatcher.routeRequest(payload, rules);
      
      expect(plan.actions).toHaveLength(2);
      expect(plan.actions[0].target).toBe('ddc-client');
      expect(plan.actions[0].method).toBe('store');
      expect(plan.actions[1].target).toBe('activity-sdk');
      expect(plan.actions[1].method).toBe('sendEvent');
      expect(plan.executionMode).toBe('parallel');
    });

    it('should handle batch processing', () => {
      const payload = { data: 'batch data' };
      const rules = {
        dataCloudAction: 'write_batch',
        indexAction: 'write_realtime',
        batchingRequired: true,
        additionalParams: {
          priority: 'normal',
          encryption: false,
          batchOptions: {
            maxSize: 100,
            maxWaitTime: 3000,
          },
        },
      };

      const plan = dispatcher.routeRequest(payload, rules);
      
      expect(plan.actions).toHaveLength(1);
      expect(plan.actions[0].target).toBe('ddc-client');
      expect(plan.actions[0].method).toBe('storeBatch');
    });

    it('should handle via-index routing', () => {
      const payload = { data: 'index data' };
      const rules = {
        dataCloudAction: 'write_via_index',
        indexAction: 'write_realtime',
        batchingRequired: false,
        additionalParams: {
          priority: 'normal',
          encryption: false,
        },
      };

      const plan = dispatcher.routeRequest(payload, rules);
      
      expect(plan.actions).toHaveLength(1);
      expect(plan.actions[0].target).toBe('activity-sdk');
      expect(plan.actions[0].method).toBe('sendEvent');
      expect(plan.executionMode).toBe('sequential');
    });
  });

  describe('Payload Transformation', () => {
    it('should transform Telegram events for Activity SDK', () => {
      const telegramEvent = {
        eventType: 'quest_completed',
        userId: 'user123',
        eventData: { questId: 'daily', points: 100 },
        timestamp: new Date(),
      };

      const transformed = dispatcher.transformPayloadForActivity(telegramEvent);
      
      expect(transformed.type).toBe('telegram.event');
      expect(transformed.userId).toBe('user123');
      expect(transformed.data).toEqual(telegramEvent.eventData);
    });

    it('should transform Bullish campaigns for Activity SDK', () => {
      const campaignEvent = {
        eventType: 'SEGMENT_WATCHED',
        campaignId: 'bullish_education_2024',
        accountId: 'user_12345',
        payload: {
          segmentId: 'trading_basics_001',
          completionPercentage: 100,
        },
        timestamp: new Date(),
      };

      const transformed = dispatcher.transformPayloadForActivity(campaignEvent);
      
      expect(transformed.type).toBe('bullish.campaign');
      expect(transformed.userId).toBe('user_12345');
      expect(transformed.campaignId).toBe('bullish_education_2024');
      expect(transformed.eventType).toBe('SEGMENT_WATCHED');
    });
  });
});
```

## Integration Testing

### DDC Integration Testing
```typescript
describe('DDC Integration', () => {
  let sdk: UnifiedSDK;
  let realConfig: UnifiedSDKConfig;

  beforeAll(() => {
    // Use real DDC configuration for integration tests
    realConfig = {
      ddcConfig: {
        signer: process.env.TEST_DDC_SIGNER || '//Alice',
        bucketId: BigInt(process.env.TEST_DDC_BUCKET_ID || '12345'),
        network: 'devnet',
      },
      processing: {
        enableBatching: false,
        defaultBatchSize: 1,
        defaultBatchTimeout: 1000,
        maxRetries: 1,
        retryDelay: 500,
      },
      logging: {
        level: 'error', // Reduce noise in tests
        enableMetrics: false,
      },
    };
  });

  beforeEach(async () => {
    sdk = new UnifiedSDK(realConfig);
    await sdk.initialize();
  });

  afterEach(async () => {
    await sdk.cleanup();
  });

  it('should store data in DDC and return CID', async () => {
    const testData = {
      message: 'Integration test data',
      timestamp: new Date().toISOString(),
    };

    const result = await sdk.writeData(testData, {
      metadata: {
        processing: {
          dataCloudWriteMode: 'direct',
          indexWriteMode: 'skip', // Skip Activity SDK for DDC-only test
        },
      },
    });

    expect(result.status).toBe('success');
    expect(result.dataCloudHash).toBeDefined();
    expect(result.dataCloudHash).toMatch(/^0x[a-fA-F0-9]+$/); // CID format
  });

  it('should handle large payloads', async () => {
    const largeData = {
      content: 'x'.repeat(1024 * 1024), // 1MB of data
      timestamp: new Date().toISOString(),
    };

    const result = await sdk.writeData(largeData, {
      metadata: {
        processing: {
          dataCloudWriteMode: 'direct',
          indexWriteMode: 'skip',
        },
      },
    });

    expect(result.status).toBe('success');
    expect(result.dataCloudHash).toBeDefined();
  });
});
```

### Activity SDK Integration Testing
```typescript
describe('Activity SDK Integration', () => {
  let sdk: UnifiedSDK;
  let realConfig: UnifiedSDKConfig;

  beforeAll(() => {
    realConfig = {
      ddcConfig: {
        signer: process.env.TEST_DDC_SIGNER || '//Alice',
        bucketId: BigInt(process.env.TEST_DDC_BUCKET_ID || '12345'),
        network: 'devnet',
      },
      activityConfig: {
        endpoint: process.env.TEST_ACTIVITY_ENDPOINT || 'https://api.stats.testnet.cere.network',
        keyringUri: process.env.TEST_ACTIVITY_KEYRING_URI || '//Alice',
        appId: 'unified-sdk-integration-test',
        appPubKey: 'test-app-key',
        dataServicePubKey: 'test-service-key',
      },
      processing: {
        enableBatching: false,
        defaultBatchSize: 1,
        defaultBatchTimeout: 1000,
        maxRetries: 1,
        retryDelay: 500,
      },
      logging: {
        level: 'error',
        enableMetrics: false,
      },
    };
  });

  beforeEach(async () => {
    sdk = new UnifiedSDK(realConfig);
    await sdk.initialize();
  });

  afterEach(async () => {
    await sdk.cleanup();
  });

  it('should send events to Activity SDK', async () => {
    const eventData = {
      eventType: 'integration_test',
      userId: 'test_user_123',
      eventData: {
        testId: 'integration_' + Date.now(),
        action: 'test_action',
      },
      timestamp: new Date(),
    };

    const result = await sdk.writeData(eventData, {
      metadata: {
        processing: {
          dataCloudWriteMode: 'skip', // Skip DDC for Activity-only test
          indexWriteMode: 'realtime',
        },
      },
    });

    expect(result.status).toBe('success');
    expect(result.indexId).toBeDefined();
    expect(result.indexId).toMatch(/^evt_/); // Event ID format
  });
});
```

## Error Handling Testing

### Error Scenario Testing
```typescript
describe('Error Handling', () => {
  let sdk: UnifiedSDK;

  beforeEach(async () => {
    const config = createMockConfig();
    sdk = new UnifiedSDK(config);
    await sdk.initialize();
  });

  describe('Validation Errors', () => {
    it('should handle invalid metadata gracefully', async () => {
      const invalidData = { invalid: 'data' };

      await expect(
        sdk.writeData(invalidData, {
          metadata: {
            processing: {
              dataCloudWriteMode: 'invalid_mode' as any,
              indexWriteMode: 'realtime',
            },
          },
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should provide detailed validation error information', async () => {
      const invalidData = { test: 'data' };

      try {
        await sdk.writeData(invalidData, {
          metadata: {
            processing: {
              dataCloudWriteMode: 'skip',
              indexWriteMode: 'skip', // Both cannot be skip
            },
          },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(UnifiedSDKError);
        expect(error.code).toBe('INVALID_RULE_COMBINATION');
        expect(error.component).toBe('RulesInterpreter');
      }
    });
  });

  describe('Service Failures', () => {
    it('should handle DDC service failure with fallback', async () => {
      const mockOrchestrator = (sdk as any).orchestrator;
      mockOrchestrator.execute = jest.fn().mockResolvedValue({
        results: [
          {
            target: 'ddc-client',
            success: false,
            error: 'DDC service unavailable',
          },
          {
            target: 'activity-sdk',
            success: true,
            response: { eventId: 'evt_123' },
          },
        ],
        overallStatus: 'partial',
        transactionId: 'txn_123',
      });

      const testData = { test: 'data' };
      const result = await sdk.writeData(testData);

      expect(result.status).toBe('partial');
      expect(result.indexId).toBe('evt_123');
      expect(result.dataCloudHash).toBeUndefined();
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].component).toBe('ddc-client');
    });

    it('should handle Activity SDK failure with fallback', async () => {
      const mockOrchestrator = (sdk as any).orchestrator;
      mockOrchestrator.execute = jest.fn().mockResolvedValue({
        results: [
          {
            target: 'ddc-client',
            success: true,
            response: { cid: '0xabc123' },
          },
          {
            target: 'activity-sdk',
            success: false,
            error: 'Activity SDK unavailable',
          },
        ],
        overallStatus: 'partial',
        transactionId: 'txn_123',
      });

      const testData = { test: 'data' };
      const result = await sdk.writeData(testData);

      expect(result.status).toBe('partial');
      expect(result.dataCloudHash).toBe('0xabc123');
      expect(result.indexId).toBeUndefined();
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].component).toBe('activity-sdk');
    });
  });

  describe('Recovery Mechanisms', () => {
    it('should retry recoverable errors', async () => {
      const mockOrchestrator = (sdk as any).orchestrator;
      let attemptCount = 0;
      
      mockOrchestrator.execute = jest.fn().mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new UnifiedSDKError('Temporary failure', 'NETWORK_ERROR', 'Orchestrator', true);
        }
        return {
          results: [{ target: 'ddc-client', success: true, response: { cid: '0xabc123' } }],
          overallStatus: 'success',
          transactionId: 'txn_123',
        };
      });

      const testData = { test: 'data' };
      const result = await sdk.writeData(testData);

      expect(result.status).toBe('success');
      expect(attemptCount).toBe(3); // Should have retried twice
    });
  });
});
```

## Performance Testing

### Performance Benchmarks
```typescript
describe('Performance Tests', () => {
  let sdk: UnifiedSDK;

  beforeEach(async () => {
    const config = createMockConfig();
    sdk = new UnifiedSDK(config);
    await sdk.initialize();
  });

  describe('Throughput Testing', () => {
    it('should handle high-volume data ingestion', async () => {
      const testData = Array.from({ length: 1000 }, (_, i) => ({
        eventType: 'performance_test',
        userId: `user_${i}`,
        eventData: { testId: i },
        timestamp: new Date(),
      }));

      const startTime = Date.now();
      
      const results = await Promise.all(
        testData.map(data => sdk.writeData(data))
      );

      const endTime = Date.now();
      const duration = endTime - startTime;
      const throughput = testData.length / (duration / 1000); // events per second

      expect(results).toHaveLength(1000);
      expect(results.every(r => r.status === 'success')).toBe(true);
      expect(throughput).toBeGreaterThan(100); // Should process at least 100 events/sec
    });

    it('should optimize batch processing for large payloads', async () => {
      const largePayload = {
        data: 'x'.repeat(1024 * 1024), // 1MB
        timestamp: new Date(),
      };

      const startTime = Date.now();
      const result = await sdk.writeData(largePayload);
      const endTime = Date.now();

      expect(result.status).toBe('success');
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });

  describe('Memory Usage', () => {
    it('should not leak memory during repeated operations', async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Perform many operations
      for (let i = 0; i < 100; i++) {
        await sdk.writeData({
          eventType: 'memory_test',
          userId: `user_${i}`,
          eventData: { iteration: i },
          timestamp: new Date(),
        });
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });
});
```

## Test Utilities and Fixtures

### Mock Data Generation
```typescript
// test-fixtures.ts
export function mockTelegramEvent(): TelegramEventData {
  return {
    eventType: 'quest_completed',
    userId: 'user_' + Math.random().toString(36).substr(2, 9),
    chatId: 'chat_' + Math.random().toString(36).substr(2, 9),
    eventData: {
      questId: 'daily-check-in',
      points: Math.floor(Math.random() * 100) + 1,
      level: Math.floor(Math.random() * 10) + 1,
    },
    timestamp: new Date(),
  };
}

export function mockTelegramMessage(): TelegramMessageData {
  return {
    messageId: 'msg_' + Math.random().toString(36).substr(2, 9),
    chatId: 'chat_' + Math.random().toString(36).substr(2, 9),
    userId: 'user_' + Math.random().toString(36).substr(2, 9),
    messageText: 'Test message ' + Date.now(),
    messageType: 'text',
    timestamp: new Date(),
    metadata: {
      miniAppName: 'Test App',
      actionContext: 'test',
    },
  };
}

export function mockBullishEvent(): BullishCampaignEvent {
  return {
    eventType: 'SEGMENT_WATCHED',
    campaignId: 'test_campaign_' + Date.now(),
    accountId: 'account_' + Math.random().toString(36).substr(2, 9),
    payload: {
      segmentId: 'segment_001',
      watchDuration: Math.floor(Math.random() * 300000),
      completionPercentage: Math.floor(Math.random() * 100),
    },
    questId: 'quest_' + Math.random().toString(36).substr(2, 9),
    timestamp: new Date(),
  };
}

export function mockNightingaleVideoStream(): NightingaleVideoStream {
  return {
    droneId: 'drone_' + Math.random().toString(36).substr(2, 9),
    streamId: 'stream_' + Math.now(),
    timestamp: new Date(),
    videoMetadata: {
      duration: 300000,
      fps: 30,
      resolution: '1920x1080',
      codec: 'h264',
      streamType: 'rgb',
    },
    chunks: [
      {
        chunkId: 'chunk_001',
        startTime: 0,
        endTime: 10000,
        data: Buffer.from('mock_video_data'),
        size: 1024000,
      },
    ],
  };
}

export function createMockConfig(): UnifiedSDKConfig {
  return {
    ddcConfig: {
      signer: '//Alice',
      bucketId: BigInt(12345),
      network: 'devnet',
    },
    processing: {
      enableBatching: false,
      defaultBatchSize: 1,
      defaultBatchTimeout: 1000,
      maxRetries: 1,
      retryDelay: 500,
    },
    logging: {
      level: 'error',
      enableMetrics: false,
    },
  };
}
```

### Test Utilities
```typescript
// test-utils.ts
export async function createInitializedSDK(config?: Partial<UnifiedSDKConfig>): Promise<UnifiedSDK> {
  const mockConfig = { ...createMockConfig(), ...config };
  const sdk = new UnifiedSDK(mockConfig);
  
  // Mock the orchestrator initialization
  const mockOrchestrator = (sdk as any).orchestrator;
  mockOrchestrator.initialize = jest.fn().mockResolvedValue(undefined);
  
  await sdk.initialize();
  return sdk;
}

export function setupMockComponents(sdk: UnifiedSDK) {
  const mockRulesInterpreter = (sdk as any).rulesInterpreter;
  const mockDispatcher = (sdk as any).dispatcher;
  const mockOrchestrator = (sdk as any).orchestrator;

  return {
    mockRulesInterpreter,
    mockDispatcher,
    mockOrchestrator,
  };
}

export function expectSuccessfulResult(result: UnifiedResponse) {
  expect(result.status).toBe('success');
  expect(result.transactionId).toBeDefined();
  expect(result.metadata.processedAt).toBeInstanceOf(Date);
  expect(result.metadata.processingTime).toBeGreaterThan(0);
}

export function expectPartialResult(result: UnifiedResponse) {
  expect(result.status).toBe('partial');
  expect(result.errors).toBeDefined();
  expect(result.errors.length).toBeGreaterThan(0);
}
```

## Continuous Integration

### GitHub Actions Test Configuration
```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm test -- --testPathPattern=unit --coverage
      
      - name: Run integration tests
        run: npm test -- --testPathPattern=integration
        env:
          TEST_DDC_SIGNER: ${{ secrets.TEST_DDC_SIGNER }}
          TEST_DDC_BUCKET_ID: ${{ secrets.TEST_DDC_BUCKET_ID }}
          TEST_ACTIVITY_ENDPOINT: ${{ secrets.TEST_ACTIVITY_ENDPOINT }}
          TEST_ACTIVITY_KEYRING_URI: ${{ secrets.TEST_ACTIVITY_KEYRING_URI }}
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

## Best Practices

### 1. Test Organization
- **Separate Concerns**: Unit tests for components, integration tests for workflows
- **Mock External Dependencies**: Use mocks for external services in unit tests
- **Real Integration**: Use real services for integration tests with test credentials

### 2. Test Data Management
- **Consistent Fixtures**: Use standardized test data generators
- **Isolated Tests**: Each test should be independent and not rely on others
- **Cleanup**: Always clean up resources after tests

### 3. Error Testing
- **Test All Error Paths**: Ensure all error scenarios are covered
- **Validate Error Messages**: Check that error messages are helpful
- **Test Recovery**: Verify that recovery mechanisms work correctly

### 4. Performance Testing
- **Set Realistic Expectations**: Performance tests should reflect real-world usage
- **Monitor Resource Usage**: Track memory and CPU usage during tests
- **Benchmark Regularly**: Run performance tests in CI to catch regressions

### 5. Maintenance
- **Keep Tests Updated**: Update tests when adding new features
- **Review Test Coverage**: Regularly review coverage reports
- **Refactor Test Code**: Keep test code clean and maintainable

This comprehensive testing guide ensures the Unified SDK maintains high quality and reliability across all supported data types and use cases.
