import { UnifiedSDK } from '../UnifiedSDK';
import {
  UnifiedSDKConfig,
  TelegramEventData,
  TelegramMessageData,
  BullishCampaignEvent,
  UnifiedSDKError,
} from '../types';

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

  describe('Bullish Campaign Integration', () => {
    beforeEach(async () => {
      const mockOrchestrator = (sdk as any).orchestrator;
      mockOrchestrator.initialize = jest.fn().mockResolvedValue(undefined);
      await sdk.initialize();
    });

    it('should detect and process SEGMENT_WATCHED events', async () => {
      const campaignEvent: BullishCampaignEvent = {
        eventType: 'SEGMENT_WATCHED',
        accountId: 'user123',
        campaignId: 'crypto-education-campaign',
        timestamp: new Date(),
        payload: {
          videoId: 'intro-to-defi-video',
          segmentsWatched: [1, 2, 3],
          questId: 'video-viewing-quest',
        },
      };

      // Mock component responses for Bullish campaign
      const mockRulesInterpreter = (sdk as any).rulesInterpreter;
      const mockDispatcher = (sdk as any).dispatcher;
      const mockOrchestrator = (sdk as any).orchestrator;

      mockRulesInterpreter.validateMetadata = jest.fn().mockReturnValue({
        processing: {
          dataCloudWriteMode: 'direct',
          indexWriteMode: 'realtime',
          priority: 'high',
          encryption: false,
        },
      });
      mockRulesInterpreter.extractProcessingRules = jest.fn().mockReturnValue({
        dataCloudAction: 'write_direct',
        indexAction: 'write_realtime',
        batchingRequired: false,
        additionalParams: { priority: 'high', encryption: false },
      });
      mockRulesInterpreter.optimizeProcessingRules = jest.fn().mockReturnValue({
        dataCloudAction: 'write_direct',
        indexAction: 'write_realtime',
        batchingRequired: false,
        additionalParams: { priority: 'high', encryption: false },
      });
      mockDispatcher.routeRequest = jest.fn().mockReturnValue({
        actions: [
          { target: 'ddc-client', method: 'store', options: { campaignTracking: true } },
          { target: 'activity-sdk', method: 'sendEvent', options: { questTracking: true } },
        ],
        executionMode: 'parallel',
        rollbackRequired: true,
      });
      mockOrchestrator.execute = jest.fn().mockResolvedValue({
        results: [
          { target: 'ddc-client', success: true, response: { cid: '0xcampaign123' }, executionTime: 60 },
          { target: 'activity-sdk', success: true, response: { eventId: 'evt_campaign_123' }, executionTime: 40 },
        ],
        overallStatus: 'success',
        totalExecutionTime: 100,
        transactionId: 'txn_campaign_123',
      });

      const result = await sdk.writeData(campaignEvent);

      expect(result.status).toBe('success');
      expect(result.transactionId).toBe('txn_campaign_123');
      expect(result.dataCloudHash).toBe('0xcampaign123');
      expect(result.indexId).toBe('evt_campaign_123');

      // Verify it was detected as bullish_campaign
      expect((sdk as any).detectDataType(campaignEvent)).toBe('bullish_campaign');
    });

    it('should detect and process QUESTION_ANSWERED events', async () => {
      const campaignEvent: BullishCampaignEvent = {
        eventType: 'QUESTION_ANSWERED',
        accountId: 'user456',
        campaignId: 'crypto-education-campaign',
        timestamp: new Date(),
        payload: {
          questionId: 'defi-basics-q1',
          answerId: 'correct-answer-id',
          points: 50,
          questId: 'quiz-quest',
        },
      };

      // Mock component responses
      const mockRulesInterpreter = (sdk as any).rulesInterpreter;
      const mockDispatcher = (sdk as any).dispatcher;
      const mockOrchestrator = (sdk as any).orchestrator;

      mockRulesInterpreter.validateMetadata = jest.fn().mockReturnValue({
        processing: {
          dataCloudWriteMode: 'direct',
          indexWriteMode: 'realtime',
          priority: 'high',
          encryption: false,
        },
      });
      mockRulesInterpreter.extractProcessingRules = jest.fn().mockReturnValue({
        dataCloudAction: 'write_direct',
        indexAction: 'write_realtime',
        batchingRequired: false,
        additionalParams: { priority: 'high', encryption: false },
      });
      mockRulesInterpreter.optimizeProcessingRules = jest.fn().mockReturnValue({
        dataCloudAction: 'write_direct',
        indexAction: 'write_realtime',
        batchingRequired: false,
        additionalParams: { priority: 'high', encryption: false },
      });
      mockDispatcher.routeRequest = jest.fn().mockReturnValue({
        actions: [
          { target: 'ddc-client', method: 'store', options: { campaignTracking: true } },
          { target: 'activity-sdk', method: 'sendEvent', options: { questTracking: true } },
        ],
        executionMode: 'parallel',
        rollbackRequired: true,
      });
      mockOrchestrator.execute = jest.fn().mockResolvedValue({
        results: [
          { target: 'ddc-client', success: true, response: { cid: '0xquiz123' }, executionTime: 45 },
          { target: 'activity-sdk', success: true, response: { eventId: 'evt_quiz_123' }, executionTime: 35 },
        ],
        overallStatus: 'success',
        totalExecutionTime: 80,
        transactionId: 'txn_quiz_123',
      });

      const result = await sdk.writeData(campaignEvent);

      expect(result.status).toBe('success');
      expect(result.transactionId).toBe('txn_quiz_123');
      expect((sdk as any).detectDataType(campaignEvent)).toBe('bullish_campaign');
    });

    it('should detect and process JOIN_CAMPAIGN events', async () => {
      const campaignEvent: BullishCampaignEvent = {
        eventType: 'JOIN_CAMPAIGN',
        accountId: 'user789',
        campaignId: 'crypto-education-campaign',
        timestamp: new Date(),
        payload: {
          questId: 'onboarding-quest',
          joinedAt: new Date(),
        },
      };

      // Mock component responses
      const mockRulesInterpreter = (sdk as any).rulesInterpreter;
      const mockDispatcher = (sdk as any).dispatcher;
      const mockOrchestrator = (sdk as any).orchestrator;

      mockRulesInterpreter.validateMetadata = jest.fn().mockReturnValue({
        processing: {
          dataCloudWriteMode: 'direct',
          indexWriteMode: 'realtime',
          priority: 'high',
          encryption: false,
        },
      });
      mockRulesInterpreter.extractProcessingRules = jest.fn().mockReturnValue({
        dataCloudAction: 'write_direct',
        indexAction: 'write_realtime',
        batchingRequired: false,
        additionalParams: { priority: 'high', encryption: false },
      });
      mockRulesInterpreter.optimizeProcessingRules = jest.fn().mockReturnValue({
        dataCloudAction: 'write_direct',
        indexAction: 'write_realtime',
        batchingRequired: false,
        additionalParams: { priority: 'high', encryption: false },
      });
      mockDispatcher.routeRequest = jest.fn().mockReturnValue({
        actions: [
          { target: 'ddc-client', method: 'store', options: { campaignTracking: true } },
          { target: 'activity-sdk', method: 'sendEvent', options: { questTracking: true } },
        ],
        executionMode: 'parallel',
        rollbackRequired: true,
      });
      mockOrchestrator.execute = jest.fn().mockResolvedValue({
        results: [
          { target: 'ddc-client', success: true, response: { cid: '0xjoin123' }, executionTime: 50 },
          { target: 'activity-sdk', success: true, response: { eventId: 'evt_join_123' }, executionTime: 30 },
        ],
        overallStatus: 'success',
        totalExecutionTime: 80,
        transactionId: 'txn_join_123',
      });

      const result = await sdk.writeData(campaignEvent);

      expect(result.status).toBe('success');
      expect(result.transactionId).toBe('txn_join_123');
      expect((sdk as any).detectDataType(campaignEvent)).toBe('bullish_campaign');
    });

    it('should preserve existing Telegram functionality', async () => {
      // Test that existing Telegram patterns still work (CRITICAL)
      const telegramEvent: TelegramEventData = {
        eventType: 'quest_completed',
        userId: 'user123',
        chatId: 'chat456',
        eventData: { questId: 'daily', points: 100 },
        timestamp: new Date(),
      };

      // Mock component responses for Telegram
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
        results: [
          { target: 'activity-sdk', success: true, response: { eventId: 'evt_telegram_123' }, executionTime: 50 },
        ],
        overallStatus: 'success',
        totalExecutionTime: 50,
        transactionId: 'txn_telegram_123',
      });

      const result = await sdk.writeData(telegramEvent);

      expect(result.status).toBe('success');
      expect(result.transactionId).toBe('txn_telegram_123');
      expect((sdk as any).detectDataType(telegramEvent)).toBe('telegram_event');
    });

    it('should handle mixed workload (Telegram + Bullish)', async () => {
      // Test processing both Telegram and Bullish events in sequence
      const telegramEvent: TelegramEventData = {
        eventType: 'user_action',
        userId: 'user123',
        eventData: { action: 'click' },
        timestamp: new Date(),
      };

      const bullishEvent: BullishCampaignEvent = {
        eventType: 'CUSTOM_EVENTS',
        accountId: 'user123',
        campaignId: 'mixed-campaign',
        timestamp: new Date(),
        payload: { customAction: 'social_share' },
      };

      // Mock responses for both events
      const mockRulesInterpreter = (sdk as any).rulesInterpreter;
      const mockDispatcher = (sdk as any).dispatcher;
      const mockOrchestrator = (sdk as any).orchestrator;

      // Setup mocks to handle both event types
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
        results: [{ target: 'activity-sdk', success: true, response: { eventId: 'evt_mixed_123' }, executionTime: 40 }],
        overallStatus: 'success',
        totalExecutionTime: 40,
        transactionId: 'txn_mixed_123',
      });

      // Process Telegram event
      const telegramResult = await sdk.writeData(telegramEvent);
      expect(telegramResult.status).toBe('success');
      expect((sdk as any).detectDataType(telegramEvent)).toBe('telegram_event');

      // Process Bullish event
      const bullishResult = await sdk.writeData(bullishEvent);
      expect(bullishResult.status).toBe('success');
      expect((sdk as any).detectDataType(bullishEvent)).toBe('bullish_campaign');

      // Verify both processed successfully
      expect(telegramResult.transactionId).toBeDefined();
      expect(bullishResult.transactionId).toBeDefined();
    });
  });

  describe('should handle mixed workload (Telegram + Bullish)', () => {
    it('should handle mixed workload (Telegram + Bullish)', async () => {
      const mockOrchestrator = {
        initialize: jest.fn().mockResolvedValue(undefined),
        execute: jest.fn().mockResolvedValue({
          overallStatus: 'success',
          results: [{ target: 'activity-sdk', success: true, response: { eventId: 'evt_mixed_123' } }],
          transactionId: 'txn_mixed_123',
        }),
      };

      (sdk as any).orchestrator = mockOrchestrator;
      await sdk.initialize();

      // Process Telegram event
      const telegramEvent = {
        eventType: 'quest_completed',
        userId: 'user123',
        eventData: { questId: 'quest456' },
        timestamp: new Date(),
      };

      const telegramResult = await sdk.writeData(telegramEvent);
      expect(telegramResult.status).toBe('success');

      // Process Bullish campaign event
      const bullishEvent = {
        eventType: 'SEGMENT_WATCHED',
        accountId: 'account123',
        campaignId: 'campaign456',
        timestamp: new Date(),
        payload: { segmentId: 'segment789' },
      };

      const bullishResult = await sdk.writeData(bullishEvent);
      expect(bullishResult.status).toBe('success');

      expect(mockOrchestrator.execute).toHaveBeenCalledTimes(2);
    });
  });

  describe('Nightingale Integration', () => {
    describe('should detect and process Nightingale video streams', () => {
      it('should detect and process Nightingale video streams', async () => {
        const mockOrchestrator = {
          initialize: jest.fn().mockResolvedValue(undefined),
          execute: jest.fn().mockResolvedValue({
            overallStatus: 'success',
            results: [{ target: 'ddc-client', success: true, response: { cid: '0xvideo123' } }],
            transactionId: 'txn_video_123',
          }),
        };

        // Set up the mocks properly
        const mockRulesInterpreter = {
          validateMetadata: jest.fn().mockImplementation((metadata) => metadata),
          extractProcessingRules: jest.fn().mockReturnValue({
            dataCloudAction: 'write_direct',
            indexAction: 'skip',
            batchingRequired: false,
            additionalParams: { priority: 'normal', encryption: false },
          }),
          optimizeProcessingRules: jest.fn().mockImplementation((rules) => rules),
        };

        const mockDispatcher = {
          routeRequest: jest.fn().mockReturnValue({
            actions: [
              {
                target: 'ddc-client',
                method: 'store',
                payload: { data: 'test' },
                options: {},
                priority: 'normal',
              },
            ],
            executionMode: 'sequential',
            rollbackRequired: false,
          }),
        };

        (sdk as any).orchestrator = mockOrchestrator;
        (sdk as any).rulesInterpreter = mockRulesInterpreter;
        (sdk as any).dispatcher = mockDispatcher;
        await sdk.initialize();

        const nightingaleVideoStream = {
          droneId: 'drone_001',
          streamId: 'stream_thermal_001',
          timestamp: new Date(),
          videoMetadata: {
            duration: 120,
            fps: 30,
            resolution: '1920x1080',
            codec: 'h264',
            streamType: 'thermal' as const,
          },
          chunks: [
            {
              chunkId: 'chunk_001',
              startTime: 0,
              endTime: 30,
              data: 'base64_video_data_chunk_1',
              offset: 0,
              size: 1048576,
            },
            {
              chunkId: 'chunk_002',
              startTime: 30,
              endTime: 60,
              data: 'base64_video_data_chunk_2',
              offset: 1048576,
              size: 1048576,
            },
          ],
        };

        const result = await sdk.writeData(nightingaleVideoStream);

        expect(result.status).toBe('success');
        expect(result.transactionId).toBe('txn_video_123');
        expect(result.dataCloudHash).toBe('0xvideo123');
        expect(mockOrchestrator.execute).toHaveBeenCalledTimes(1);
      });
    });

    describe('should detect and process Nightingale KLV data', () => {
      it('should detect and process Nightingale KLV data', async () => {
        const mockOrchestrator = {
          initialize: jest.fn().mockResolvedValue(undefined),
          execute: jest.fn().mockResolvedValue({
            overallStatus: 'success',
            results: [{ target: 'activity-sdk', success: true, response: { eventId: 'evt_klv_123' } }],
            transactionId: 'txn_klv_123',
          }),
        };

        const mockRulesInterpreter = {
          validateMetadata: jest.fn().mockImplementation((metadata) => metadata),
          extractProcessingRules: jest.fn().mockReturnValue({
            dataCloudAction: 'skip',
            indexAction: 'write_realtime',
            batchingRequired: false,
            additionalParams: { priority: 'high', encryption: false },
          }),
          optimizeProcessingRules: jest.fn().mockImplementation((rules) => rules),
        };

        const mockDispatcher = {
          routeRequest: jest.fn().mockReturnValue({
            actions: [
              {
                target: 'activity-sdk',
                method: 'sendEvent',
                payload: { type: 'nightingale.klv' },
                options: {},
                priority: 'high',
              },
            ],
            executionMode: 'sequential',
            rollbackRequired: false,
          }),
        };

        (sdk as any).orchestrator = mockOrchestrator;
        (sdk as any).rulesInterpreter = mockRulesInterpreter;
        (sdk as any).dispatcher = mockDispatcher;
        await sdk.initialize();

        const nightingaleKLVData = {
          droneId: 'drone_001',
          streamId: 'stream_thermal_001',
          chunkCid: '0xchunk123',
          timestamp: new Date(),
          pts: 1738629253474656,
          klvMetadata: {
            type: 'ST 0601',
            missionId: '67a160778ea44d30b28867e3',
            platform: {
              headingAngle: 76.098,
              pitchAngle: 0.0,
              rollAngle: 0.0,
            },
            sensor: {
              latitude: 37.516,
              longitude: -122.045,
              trueAltitude: 3.7,
              horizontalFieldOfView: 0.0,
              verticalFieldOfView: 0.0,
              relativeAzimuth: 330.0,
              relativeElevation: -77.94,
              relativeRoll: 359.96,
            },
            frameCenter: {
              latitude: 37.516,
              longitude: -122.045,
              elevation: 4.6,
            },
            fields: {
              precisionTimeStamp: 1738629253474656,
            },
          },
        };

        const result = await sdk.writeData(nightingaleKLVData);

        expect(result.status).toBe('success');
        expect(result.transactionId).toBe('txn_klv_123');
        expect(result.indexId).toBe('evt_klv_123');
        expect(mockOrchestrator.execute).toHaveBeenCalledTimes(1);
      });
    });

    describe('should detect and process Nightingale telemetry', () => {
      it('should detect and process Nightingale telemetry', async () => {
        const mockOrchestrator = {
          initialize: jest.fn().mockResolvedValue(undefined),
          execute: jest.fn().mockResolvedValue({
            overallStatus: 'success',
            results: [
              { target: 'ddc-client', success: true, response: { cid: '0xtelemetry123' } },
              { target: 'activity-sdk', success: true, response: { eventId: 'evt_telemetry_123' } },
            ],
            transactionId: 'txn_telemetry_123',
          }),
        };

        const mockRulesInterpreter = {
          validateMetadata: jest.fn().mockImplementation((metadata) => metadata),
          extractProcessingRules: jest.fn().mockReturnValue({
            dataCloudAction: 'write_direct',
            indexAction: 'write_realtime',
            batchingRequired: false,
            additionalParams: { priority: 'high', encryption: false },
          }),
          optimizeProcessingRules: jest.fn().mockImplementation((rules) => rules),
        };

        const mockDispatcher = {
          routeRequest: jest.fn().mockReturnValue({
            actions: [
              {
                target: 'ddc-client',
                method: 'store',
                payload: { data: 'telemetry' },
                options: {},
                priority: 'high',
              },
              {
                target: 'activity-sdk',
                method: 'sendEvent',
                payload: { type: 'nightingale.telemetry' },
                options: {},
                priority: 'high',
              },
            ],
            executionMode: 'parallel',
            rollbackRequired: true,
          }),
        };

        (sdk as any).orchestrator = mockOrchestrator;
        (sdk as any).rulesInterpreter = mockRulesInterpreter;
        (sdk as any).dispatcher = mockDispatcher;
        await sdk.initialize();

        const nightingaleTelemetry = {
          droneId: 'drone_001',
          timestamp: new Date(),
          telemetryData: {
            gps: { lat: 37.516, lng: -122.045, alt: 100.5 },
            orientation: { pitch: 0.0, roll: 0.0, yaw: 76.098 },
            velocity: { x: 5.2, y: 0.0, z: 0.1 },
            battery: 85,
            signalStrength: 95,
          },
          coordinates: {
            latitude: 37.516,
            longitude: -122.045,
            altitude: 100.5,
          },
          missionId: '67a160778ea44d30b28867e3',
        };

        const result = await sdk.writeData(nightingaleTelemetry);

        expect(result.status).toBe('success');
        expect(result.transactionId).toBe('txn_telemetry_123');
        expect(result.dataCloudHash).toBe('0xtelemetry123');
        expect(result.indexId).toBe('evt_telemetry_123');
        expect(mockOrchestrator.execute).toHaveBeenCalledTimes(1);
      });
    });

    describe('should detect and process Nightingale frame analysis', () => {
      it('should detect and process Nightingale frame analysis', async () => {
        const mockOrchestrator = {
          initialize: jest.fn().mockResolvedValue(undefined),
          execute: jest.fn().mockResolvedValue({
            overallStatus: 'success',
            results: [
              { target: 'ddc-client', success: true, response: { cid: '0xframe123' } },
              { target: 'activity-sdk', success: true, response: { eventId: 'evt_frame_123' } },
            ],
            transactionId: 'txn_frame_123',
          }),
        };

        const mockRulesInterpreter = {
          validateMetadata: jest.fn().mockImplementation((metadata) => metadata),
          extractProcessingRules: jest.fn().mockReturnValue({
            dataCloudAction: 'write_direct',
            indexAction: 'write_realtime',
            batchingRequired: false,
            additionalParams: { priority: 'normal', encryption: false },
          }),
          optimizeProcessingRules: jest.fn().mockImplementation((rules) => rules),
        };

        const mockDispatcher = {
          routeRequest: jest.fn().mockReturnValue({
            actions: [
              {
                target: 'ddc-client',
                method: 'store',
                payload: { frameData: 'base64_frame_image_data' },
                options: {},
                priority: 'normal',
              },
              {
                target: 'activity-sdk',
                method: 'sendEvent',
                payload: { type: 'nightingale.frame_analysis' },
                options: {},
                priority: 'normal',
              },
            ],
            executionMode: 'parallel',
            rollbackRequired: true,
          }),
        };

        (sdk as any).orchestrator = mockOrchestrator;
        (sdk as any).rulesInterpreter = mockRulesInterpreter;
        (sdk as any).dispatcher = mockDispatcher;
        await sdk.initialize();

        const nightingaleFrameAnalysis = {
          droneId: 'drone_001',
          streamId: 'stream_thermal_001',
          frameId: 'frame_001',
          chunkCid: '0xchunk123',
          timestamp: new Date(),
          pts: 1738629253474656,
          frameData: {
            base64EncodedData: 'base64_frame_image_data',
            metadata: {
              width: 1920,
              height: 1080,
              format: 'jpeg',
            },
          },
          analysisResults: {
            objects: [
              {
                type: 'vehicle',
                confidence: 0.95,
                boundingBox: [100, 200, 300, 400] as [number, number, number, number],
              },
              {
                type: 'person',
                confidence: 0.87,
                boundingBox: [500, 600, 700, 800] as [number, number, number, number],
              },
            ],
            features: {
              motionDetected: true,
              anomalyScore: 0.12,
            },
          },
        };

        const result = await sdk.writeData(nightingaleFrameAnalysis);

        expect(result.status).toBe('success');
        expect(result.transactionId).toBe('txn_frame_123');
        expect(result.dataCloudHash).toBe('0xframe123');
        expect(result.indexId).toBe('evt_frame_123');
        expect(mockOrchestrator.execute).toHaveBeenCalledTimes(1);
      });
    });

    describe('should preserve existing drone functionality', () => {
      it('should preserve existing drone functionality', async () => {
        const mockOrchestrator = {
          initialize: jest.fn().mockResolvedValue(undefined),
          execute: jest.fn().mockResolvedValue({
            overallStatus: 'success',
            results: [{ target: 'activity-sdk', success: true, response: { eventId: 'evt_legacy_123' } }],
            transactionId: 'txn_legacy_123',
          }),
        };

        (sdk as any).orchestrator = mockOrchestrator;
        await sdk.initialize();

        // Test legacy drone telemetry still works
        const legacyDroneTelemetry = {
          droneId: 'legacy_drone_001',
          telemetry: {
            gps: { lat: 37.516, lng: -122.045 },
            battery: 85,
          },
          latitude: 37.516,
          longitude: -122.045,
        };

        const result = await sdk.writeData(legacyDroneTelemetry);

        expect(result.status).toBe('success');
        expect(result.transactionId).toBe('txn_legacy_123');

        // Verify it's detected as legacy drone_telemetry, not nightingale
        const detectDataType = (sdk as any).detectDataType.bind(sdk);
        expect(detectDataType(legacyDroneTelemetry)).toBe('drone_telemetry');
      });
    });

    describe('should handle mixed Nightingale workload', () => {
      it('should handle mixed Nightingale workload', async () => {
        const mockOrchestrator = {
          initialize: jest.fn().mockResolvedValue(undefined),
          execute: jest.fn().mockResolvedValue({
            overallStatus: 'success',
            results: [{ target: 'activity-sdk', success: true, response: { eventId: 'evt_mixed_123' } }],
            transactionId: 'txn_mixed_123',
          }),
        };

        (sdk as any).orchestrator = mockOrchestrator;
        await sdk.initialize();

        // Process KLV data
        const klvData = {
          droneId: 'drone_001',
          streamId: 'stream_001',
          timestamp: new Date(),
          pts: 123456,
          klvMetadata: {
            type: 'ST 0601',
            platform: { headingAngle: 76, pitchAngle: 0, rollAngle: 0 },
            sensor: {
              latitude: 37.516,
              longitude: -122.045,
              trueAltitude: 3.7,
              horizontalFieldOfView: 0,
              verticalFieldOfView: 0,
              relativeAzimuth: 330,
              relativeElevation: -77.94,
              relativeRoll: 359.96,
            },
            frameCenter: { latitude: 37.516, longitude: -122.045, elevation: 4.6 },
            fields: {},
          },
        };

        const klvResult = await sdk.writeData(klvData);
        expect(klvResult.status).toBe('success');

        // Process telemetry data
        const telemetryData = {
          droneId: 'drone_001',
          timestamp: new Date(),
          telemetryData: {
            gps: { lat: 37.516, lng: -122.045, alt: 100 },
            orientation: { pitch: 0, roll: 0, yaw: 76 },
            velocity: { x: 5, y: 0, z: 0 },
            battery: 85,
            signalStrength: 95,
          },
          coordinates: { latitude: 37.516, longitude: -122.045, altitude: 100 },
        };

        const telemetryResult = await sdk.writeData(telemetryData);
        expect(telemetryResult.status).toBe('success');

        expect(mockOrchestrator.execute).toHaveBeenCalledTimes(2);
      });
    });
  });
});
