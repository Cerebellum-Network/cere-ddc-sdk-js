import { UnifiedSDK } from '../UnifiedSDK';
import { UnifiedSDKConfig, TelegramEventData, TelegramMessageData, UnifiedSDKError } from '../types';

// Mock all dependencies
jest.mock('../RulesInterpreter');
jest.mock('../Dispatcher');
jest.mock('../Orchestrator');

describe('UnifiedSDK', () => {
  let sdk: UnifiedSDK;
  let mockConfig: UnifiedSDKConfig;

  beforeEach(() => {
    mockConfig = {
      ddcConfig: {
        signer: '//Alice',
        bucketId: BigInt(12345),
        network: 'testnet',
      },
      activityConfig: {
        keyringUri: '//Alice',
        appId: 'test-app',
        endpoint: 'https://api.stats.cere.network',
        appPubKey: 'test-key',
        dataServicePubKey: 'test-service-key',
      },
      processing: {
        enableBatching: true,
        defaultBatchSize: 100,
        defaultBatchTimeout: 5000,
        maxRetries: 3,
        retryDelay: 1000,
      },
      logging: {
        level: 'info',
        enableMetrics: true,
      },
    };

    sdk = new UnifiedSDK(mockConfig);
  });

  describe('constructor', () => {
    it('should create SDK with all components', () => {
      expect(sdk).toBeInstanceOf(UnifiedSDK);
      expect((sdk as any).rulesInterpreter).toBeDefined();
      expect((sdk as any).dispatcher).toBeDefined();
      expect((sdk as any).orchestrator).toBeDefined();
    });
  });

  describe('initialize', () => {
    it('should initialize successfully', async () => {
      const mockOrchestrator = (sdk as any).orchestrator;
      mockOrchestrator.initialize = jest.fn().mockResolvedValue(undefined);

      await sdk.initialize();

      expect(mockOrchestrator.initialize).toHaveBeenCalled();
      expect((sdk as any).initialized).toBe(true);
    });

    it('should not initialize twice', async () => {
      const mockOrchestrator = (sdk as any).orchestrator;
      mockOrchestrator.initialize = jest.fn().mockResolvedValue(undefined);

      await sdk.initialize();
      await sdk.initialize(); // Second call

      expect(mockOrchestrator.initialize).toHaveBeenCalledTimes(1);
    });

    it('should throw error on initialization failure', async () => {
      const mockOrchestrator = (sdk as any).orchestrator;
      mockOrchestrator.initialize = jest.fn().mockRejectedValue(new Error('Init failed'));

      await expect(sdk.initialize()).rejects.toThrow('Init failed');
      expect((sdk as any).initialized).toBe(false);
    });
  });

  describe('writeData', () => {
    beforeEach(async () => {
      const mockOrchestrator = (sdk as any).orchestrator;
      mockOrchestrator.initialize = jest.fn().mockResolvedValue(undefined);
      await sdk.initialize();
    });

    it('should process data successfully', async () => {
      const payload = { test: 'data' };
      const options = {
        priority: 'normal' as const,
        encryption: false,
        metadata: {
          processing: {
            dataCloudWriteMode: 'direct' as const,
            indexWriteMode: 'realtime' as const,
          },
        },
      };

      // Mock component responses
      const mockRulesInterpreter = (sdk as any).rulesInterpreter;
      const mockDispatcher = (sdk as any).dispatcher;
      const mockOrchestrator = (sdk as any).orchestrator;

      mockRulesInterpreter.validateMetadata = jest.fn().mockReturnValue(options.metadata);
      mockRulesInterpreter.extractProcessingRules = jest.fn().mockReturnValue({
        dataCloudAction: 'write_direct',
        indexAction: 'write_realtime',
        batchingRequired: false,
        additionalParams: { priority: 'normal', encryption: false },
      });
      mockRulesInterpreter.optimizeProcessingRules = jest.fn().mockReturnValue({
        dataCloudAction: 'write_direct',
        indexAction: 'write_realtime',
        batchingRequired: false,
        additionalParams: { priority: 'normal', encryption: false },
      });
      mockDispatcher.routeRequest = jest.fn().mockReturnValue({
        actions: [{ target: 'ddc-client', method: 'store' }],
        executionMode: 'sequential',
        rollbackRequired: false,
      });
      mockOrchestrator.execute = jest.fn().mockResolvedValue({
        results: [{ target: 'ddc-client', success: true, response: { cid: '0xabc123' }, executionTime: 100 }],
        overallStatus: 'success',
        totalExecutionTime: 100,
        transactionId: 'txn_123',
      });

      const result = await sdk.writeData(payload, options);

      expect(result.status).toBe('success');
      expect(result.transactionId).toBe('txn_123');
      expect(result.dataCloudHash).toBe('0xabc123');
    });

    it('should throw error when not initialized', async () => {
      const sdkNotInit = new UnifiedSDK(mockConfig);

      await expect(
        sdkNotInit.writeData(
          {},
          {
            metadata: {
              processing: {
                dataCloudWriteMode: 'direct',
                indexWriteMode: 'realtime',
              },
            },
          },
        ),
      ).rejects.toThrow(UnifiedSDKError);
    });

    it('should handle validation errors', async () => {
      const mockRulesInterpreter = (sdk as any).rulesInterpreter;
      mockRulesInterpreter.validateMetadata = jest.fn().mockImplementation(() => {
        throw new Error('Validation failed');
      });

      await expect(
        sdk.writeData(
          {},
          {
            metadata: {
              processing: {
                dataCloudWriteMode: 'direct',
                indexWriteMode: 'realtime',
              },
            },
          },
        ),
      ).rejects.toThrow(UnifiedSDKError);
    });
  });

  describe('writeData with auto-detection', () => {
    beforeEach(async () => {
      const mockOrchestrator = (sdk as any).orchestrator;
      mockOrchestrator.initialize = jest.fn().mockResolvedValue(undefined);
      await sdk.initialize();
    });

    it('should auto-detect and process Telegram event', async () => {
      const eventData: TelegramEventData = {
        eventType: 'quest_completed',
        userId: 'user123',
        chatId: 'chat456',
        eventData: { questId: 'daily', points: 100 },
        timestamp: new Date(),
      };

      // Mock component responses for auto-detection
      const mockRulesInterpreter = (sdk as any).rulesInterpreter;
      const mockDispatcher = (sdk as any).dispatcher;
      const mockOrchestrator = (sdk as any).orchestrator;

      mockRulesInterpreter.validateMetadata = jest.fn().mockReturnValue({
        processing: {
          dataCloudWriteMode: 'viaIndex',
          indexWriteMode: 'realtime',
          priority: 'normal',
          encryption: false,
        },
      });
      mockRulesInterpreter.extractProcessingRules = jest.fn().mockReturnValue({
        dataCloudAction: 'write_via_index',
        indexAction: 'write_realtime',
        batchingRequired: false,
        additionalParams: { priority: 'normal', encryption: false },
      });
      mockRulesInterpreter.optimizeProcessingRules = jest.fn().mockReturnValue({
        dataCloudAction: 'write_via_index',
        indexAction: 'write_realtime',
        batchingRequired: false,
        additionalParams: { priority: 'normal', encryption: false },
      });
      mockDispatcher.routeRequest = jest.fn().mockReturnValue({
        actions: [{ target: 'activity-sdk', method: 'sendEvent' }],
        executionMode: 'sequential',
        rollbackRequired: false,
      });
      mockOrchestrator.execute = jest.fn().mockResolvedValue({
        results: [{ target: 'activity-sdk', success: true, response: { eventId: 'evt_123' }, executionTime: 50 }],
        overallStatus: 'success',
        totalExecutionTime: 50,
        transactionId: 'txn_event_123',
      });

      const result = await sdk.writeData(eventData);

      expect(result.status).toBe('success');
      expect(result.transactionId).toBe('txn_event_123');
      // Verify that detectDataType was called internally (via createMetadataForPayload)
      expect(mockRulesInterpreter.validateMetadata).toHaveBeenCalled();
      expect(mockDispatcher.routeRequest).toHaveBeenCalled();
    });

    it('should auto-detect and process Telegram message', async () => {
      const messageData: TelegramMessageData = {
        messageId: 'msg123',
        chatId: 'chat456',
        userId: 'user789',
        messageText: 'Hello world',
        messageType: 'text',
        timestamp: new Date(),
      };

      // Mock component responses for auto-detection
      const mockRulesInterpreter = (sdk as any).rulesInterpreter;
      const mockDispatcher = (sdk as any).dispatcher;
      const mockOrchestrator = (sdk as any).orchestrator;

      mockRulesInterpreter.validateMetadata = jest.fn().mockReturnValue({
        processing: {
          dataCloudWriteMode: 'viaIndex',
          indexWriteMode: 'realtime',
          priority: 'normal',
          encryption: false,
        },
      });
      mockRulesInterpreter.extractProcessingRules = jest.fn().mockReturnValue({
        dataCloudAction: 'write_via_index',
        indexAction: 'write_realtime',
        batchingRequired: false,
        additionalParams: { priority: 'normal', encryption: false },
      });
      mockRulesInterpreter.optimizeProcessingRules = jest.fn().mockReturnValue({
        dataCloudAction: 'write_via_index',
        indexAction: 'write_realtime',
        batchingRequired: false,
        additionalParams: { priority: 'normal', encryption: false },
      });
      mockDispatcher.routeRequest = jest.fn().mockReturnValue({
        actions: [{ target: 'ddc-client', method: 'store' }],
        executionMode: 'sequential',
        rollbackRequired: false,
      });
      mockOrchestrator.execute = jest.fn().mockResolvedValue({
        results: [{ target: 'ddc-client', success: true, response: { cid: '0xmsg123' }, executionTime: 30 }],
        overallStatus: 'success',
        totalExecutionTime: 30,
        transactionId: 'txn_msg_123',
      });

      const result = await sdk.writeData(messageData);

      expect(result.status).toBe('success');
      expect(result.transactionId).toBe('txn_msg_123');
      expect(result.dataCloudHash).toBe('0xmsg123');
    });

    it('should process custom data with explicit options', async () => {
      const customData = { analytics: true, userId: 'user123', action: 'click' };
      const options = {
        priority: 'high' as const,
        encryption: true,
        writeMode: 'batch' as const,
      };

      // Mock component responses
      const mockRulesInterpreter = (sdk as any).rulesInterpreter;
      const mockDispatcher = (sdk as any).dispatcher;
      const mockOrchestrator = (sdk as any).orchestrator;

      mockRulesInterpreter.validateMetadata = jest.fn().mockReturnValue({
        processing: {
          dataCloudWriteMode: 'batch',
          indexWriteMode: 'realtime',
          priority: 'high',
          encryption: true,
        },
      });
      mockRulesInterpreter.extractProcessingRules = jest.fn().mockReturnValue({
        dataCloudAction: 'write_batch',
        indexAction: 'write_realtime',
        batchingRequired: true,
        additionalParams: { priority: 'high', encryption: true },
      });
      mockRulesInterpreter.optimizeProcessingRules = jest.fn().mockReturnValue({
        dataCloudAction: 'write_batch',
        indexAction: 'write_realtime',
        batchingRequired: true,
        additionalParams: { priority: 'high', encryption: true },
      });
      mockDispatcher.routeRequest = jest.fn().mockReturnValue({
        actions: [{ target: 'ddc-client', method: 'storeBatch' }],
        executionMode: 'sequential',
        rollbackRequired: false,
      });
      mockOrchestrator.execute = jest.fn().mockResolvedValue({
        results: [{ target: 'ddc-client', success: true, response: { cid: '0xcustom456' }, executionTime: 75 }],
        overallStatus: 'success',
        totalExecutionTime: 75,
        transactionId: 'txn_custom_456',
      });

      const result = await sdk.writeData(customData, options);

      expect(result.status).toBe('success');
      expect(result.transactionId).toBe('txn_custom_456');
      expect(result.dataCloudHash).toBe('0xcustom456');
    });
  });

  describe('getStatus', () => {
    it('should return status before initialization', () => {
      const status = sdk.getStatus();

      expect(status.initialized).toBe(false);
      expect(status.components.rulesInterpreter).toBe(true);
      expect(status.components.dispatcher).toBe(true);
      expect(status.components.orchestrator).toBe(true);
    });

    it('should return status after initialization', async () => {
      const mockOrchestrator = (sdk as any).orchestrator;
      mockOrchestrator.initialize = jest.fn().mockResolvedValue(undefined);
      await sdk.initialize();

      const status = sdk.getStatus();

      expect(status.initialized).toBe(true);
      expect(status.config).toBeDefined();
      expect(status.config.activityConfig?.keyringUri).toBeUndefined(); // Should be sanitized
    });
  });

  describe('cleanup', () => {
    it('should cleanup orchestrator', async () => {
      const mockOrchestrator = (sdk as any).orchestrator;
      mockOrchestrator.cleanup = jest.fn().mockResolvedValue(undefined);

      await sdk.cleanup();

      expect(mockOrchestrator.cleanup).toHaveBeenCalled();
    });
  });

  describe('private methods', () => {
    it('should estimate payload size correctly', () => {
      const payload = { test: 'data', number: 123, nested: { value: true } };
      const size = (sdk as any).estimatePayloadSize(payload);

      expect(size).toBeGreaterThan(0);
      expect(typeof size).toBe('number');
    });

    it('should create unified response correctly', () => {
      const orchestrationResult = {
        results: [
          { target: 'ddc-client', success: true, response: { cid: '0xabc123' }, executionTime: 50 },
          { target: 'activity-sdk', success: true, response: { eventId: 'evt_456' }, executionTime: 30 },
        ],
        overallStatus: 'success' as const,
        totalExecutionTime: 80,
        transactionId: 'txn_test_123',
      };

      const startTime = Date.now() - 100;
      const response = (sdk as any).createUnifiedResponse(orchestrationResult, startTime);

      expect(response.transactionId).toBe('txn_test_123');
      expect(response.status).toBe('success');
      expect(response.dataCloudHash).toBe('0xabc123');
      expect(response.metadata.actionsExecuted).toEqual(['ddc-client', 'activity-sdk']);
      expect(response.metadata.processingTime).toBeGreaterThan(0);
    });

    it('should sanitize config properly', () => {
      const sanitized = (sdk as any).sanitizeConfig(mockConfig);

      expect(sanitized.activityConfig?.keyringUri).toBeUndefined();
      expect(sanitized.ddcConfig.signer).toBeUndefined();
      expect(sanitized.ddcConfig.bucketId).toBeDefined();
    });
  });
});
