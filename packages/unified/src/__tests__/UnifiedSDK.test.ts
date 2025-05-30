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
      const metadata = {
        processing: {
          dataCloudWriteMode: 'direct' as const,
          indexWriteMode: 'realtime' as const,
        },
      };

      // Mock component responses
      const mockRulesInterpreter = (sdk as any).rulesInterpreter;
      const mockDispatcher = (sdk as any).dispatcher;
      const mockOrchestrator = (sdk as any).orchestrator;

      mockRulesInterpreter.validateMetadata = jest.fn().mockReturnValue(metadata);
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

      const result = await sdk.writeData(payload, metadata);

      expect(result.status).toBe('success');
      expect(result.transactionId).toBe('txn_123');
      expect(result.dataCloudHash).toBe('0xabc123');
    });

    it('should throw error when not initialized', async () => {
      const sdkNotInit = new UnifiedSDK(mockConfig);

      await expect(
        sdkNotInit.writeData({}, { processing: { dataCloudWriteMode: 'direct', indexWriteMode: 'realtime' } }),
      ).rejects.toThrow(UnifiedSDKError);
    });

    it('should handle validation errors', async () => {
      const mockRulesInterpreter = (sdk as any).rulesInterpreter;
      mockRulesInterpreter.validateMetadata = jest.fn().mockImplementation(() => {
        throw new Error('Validation failed');
      });

      await expect(
        sdk.writeData({}, { processing: { dataCloudWriteMode: 'direct', indexWriteMode: 'realtime' } }),
      ).rejects.toThrow(UnifiedSDKError);
    });
  });

  describe('writeTelegramEvent', () => {
    beforeEach(async () => {
      const mockOrchestrator = (sdk as any).orchestrator;
      mockOrchestrator.initialize = jest.fn().mockResolvedValue(undefined);
      await sdk.initialize();
    });

    it('should write Telegram event with defaults', async () => {
      const eventData: TelegramEventData = {
        eventType: 'quest_completed',
        userId: 'user123',
        chatId: 'chat456',
        eventData: { questId: 'daily', points: 100 },
        timestamp: new Date(),
      };

      // Mock writeData method
      jest.spyOn(sdk, 'writeData').mockResolvedValue({
        transactionId: 'txn_event_123',
        status: 'success',
        metadata: {
          processedAt: new Date(),
          processingTime: 50,
          actionsExecuted: ['ddc-client'],
        },
      });

      const result = await sdk.writeTelegramEvent(eventData);

      expect(sdk.writeData).toHaveBeenCalledWith(eventData, {
        processing: {
          dataCloudWriteMode: 'viaIndex',
          indexWriteMode: 'realtime',
          priority: 'normal',
          encryption: false,
        },
        userContext: {
          source: 'telegram',
          eventType: 'quest_completed',
          userId: 'user123',
        },
        traceId: expect.stringMatching(/^telegram_event_user123_\d+$/),
      });

      expect(result.status).toBe('success');
    });

    it('should write Telegram event with custom options', async () => {
      const eventData: TelegramEventData = {
        eventType: 'user_action',
        userId: 'user456',
        eventData: { action: 'purchase' },
        timestamp: new Date(),
      };

      jest.spyOn(sdk, 'writeData').mockResolvedValue({
        transactionId: 'txn_event_456',
        status: 'success',
        metadata: {
          processedAt: new Date(),
          processingTime: 75,
          actionsExecuted: ['ddc-client', 'activity-sdk'],
        },
      });

      const result = await sdk.writeTelegramEvent(eventData, {
        priority: 'high',
        encryption: true,
        writeMode: 'batch',
      });

      expect(sdk.writeData).toHaveBeenCalledWith(eventData, {
        processing: {
          dataCloudWriteMode: 'batch',
          indexWriteMode: 'realtime',
          priority: 'high',
          encryption: true,
        },
        userContext: {
          source: 'telegram',
          eventType: 'user_action',
          userId: 'user456',
        },
        traceId: expect.stringMatching(/^telegram_event_user456_\d+$/),
      });

      expect(result.status).toBe('success');
    });
  });

  describe('writeTelegramMessage', () => {
    beforeEach(async () => {
      const mockOrchestrator = (sdk as any).orchestrator;
      mockOrchestrator.initialize = jest.fn().mockResolvedValue(undefined);
      await sdk.initialize();
    });

    it('should write Telegram message with defaults', async () => {
      const messageData: TelegramMessageData = {
        messageId: 'msg123',
        chatId: 'chat456',
        userId: 'user789',
        messageText: 'Hello world',
        messageType: 'text',
        timestamp: new Date(),
      };

      jest.spyOn(sdk, 'writeData').mockResolvedValue({
        transactionId: 'txn_msg_123',
        status: 'success',
        metadata: {
          processedAt: new Date(),
          processingTime: 30,
          actionsExecuted: ['ddc-client'],
        },
      });

      const result = await sdk.writeTelegramMessage(messageData);

      expect(sdk.writeData).toHaveBeenCalledWith(messageData, {
        processing: {
          dataCloudWriteMode: 'viaIndex',
          indexWriteMode: 'realtime',
          priority: 'normal',
          encryption: false,
        },
        userContext: {
          source: 'telegram',
          messageType: 'text',
          userId: 'user789',
          chatId: 'chat456',
        },
        traceId: expect.stringMatching(/^telegram_message_msg123_\d+$/),
      });

      expect(result.status).toBe('success');
    });

    it('should write Telegram message with custom options', async () => {
      const messageData: TelegramMessageData = {
        messageId: 'msg456',
        chatId: 'chat789',
        userId: 'user123',
        messageType: 'photo',
        timestamp: new Date(),
        metadata: { caption: 'A nice photo' },
      };

      jest.spyOn(sdk, 'writeData').mockResolvedValue({
        transactionId: 'txn_msg_456',
        status: 'success',
        metadata: {
          processedAt: new Date(),
          processingTime: 45,
          actionsExecuted: ['ddc-client'],
        },
      });

      const result = await sdk.writeTelegramMessage(messageData, {
        priority: 'low',
        encryption: false,
        writeMode: 'batch',
      });

      expect(sdk.writeData).toHaveBeenCalledWith(messageData, {
        processing: {
          dataCloudWriteMode: 'batch',
          indexWriteMode: 'realtime',
          priority: 'low',
          encryption: false,
        },
        userContext: {
          source: 'telegram',
          messageType: 'photo',
          userId: 'user123',
          chatId: 'chat789',
        },
        traceId: expect.stringMatching(/^telegram_message_msg456_\d+$/),
      });

      expect(result.status).toBe('success');
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
