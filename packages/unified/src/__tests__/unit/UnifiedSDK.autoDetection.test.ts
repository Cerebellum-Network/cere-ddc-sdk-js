import { UnifiedSDK } from '../../UnifiedSDK';
import { mockTelegramEvent, mockTelegramMessage, mockBullishEvent, createMockConfig } from '../helpers/test-fixtures';

// Mock all dependencies
jest.mock('../../RulesInterpreter');
jest.mock('../../Dispatcher');
jest.mock('../../Orchestrator');

describe('UnifiedSDK - Auto-Detection', () => {
  let sdk: UnifiedSDK;
  let mockConfig = createMockConfig();

  beforeEach(async () => {
    mockConfig = createMockConfig();
    sdk = new UnifiedSDK(mockConfig);

    // Setup successful initialization
    const mockOrchestrator = (sdk as any).orchestrator;
    mockOrchestrator.initialize = jest.fn().mockResolvedValue(undefined);
    await sdk.initialize();

    jest.clearAllMocks();
  });

  describe('Telegram event auto-detection', () => {
    it('should auto-detect and process Telegram event', async () => {
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
        additionalParams: { priority: 'normal', encryption: false },
      });
      mockDispatcher.routeRequest = jest.fn().mockReturnValue({
        actions: [{ target: 'activity-sdk', method: 'sendEvent' }],
        executionMode: 'sequential',
        rollbackRequired: false,
      });
      mockOrchestrator.execute = jest.fn().mockResolvedValue({
        results: [{ target: 'activity-sdk', success: true, response: { eventId: 'evt_tg_123' } }],
        overallStatus: 'success',
        transactionId: 'txn_tg_123',
      });

      const result = await sdk.writeData(eventData);

      expect(result.status).toBe('success');
      expect(result.transactionId).toBe('txn_tg_123');
      expect(result.indexId).toBe('evt_tg_123');

      // Verify that the correct metadata was generated
      expect(mockRulesInterpreter.validateMetadata).toHaveBeenCalledWith(
        expect.objectContaining({
          processing: expect.objectContaining({
            dataCloudWriteMode: 'viaIndex',
            indexWriteMode: 'realtime',
          }),
          userContext: expect.objectContaining({
            source: 'telegram',
            userId: eventData.userId,
            chatId: eventData.chatId,
          }),
        }),
      );
    });

    it('should auto-detect and process Telegram message', async () => {
      const messageData = mockTelegramMessage();

      // Setup component mocks
      const mockRulesInterpreter = (sdk as any).rulesInterpreter;
      const mockDispatcher = (sdk as any).dispatcher;
      const mockOrchestrator = (sdk as any).orchestrator;

      mockRulesInterpreter.validateMetadata = jest.fn().mockReturnValue({
        processing: {
          dataCloudWriteMode: 'direct',
          indexWriteMode: 'realtime',
        },
      });
      mockRulesInterpreter.extractProcessingRules = jest.fn().mockReturnValue({
        dataCloudAction: 'write_direct',
        indexAction: 'write_realtime',
        batchingRequired: false,
        additionalParams: { priority: 'normal', encryption: false },
      });
      mockDispatcher.routeRequest = jest.fn().mockReturnValue({
        actions: [
          { target: 'ddc-client', method: 'store' },
          { target: 'activity-sdk', method: 'sendEvent' },
        ],
        executionMode: 'sequential',
        rollbackRequired: false,
      });
      mockOrchestrator.execute = jest.fn().mockResolvedValue({
        results: [
          { target: 'ddc-client', success: true, response: { cid: '0xmsg123' } },
          { target: 'activity-sdk', success: true, response: { eventId: 'evt_msg_123' } },
        ],
        overallStatus: 'success',
        transactionId: 'txn_msg_123',
      });

      const result = await sdk.writeData(messageData);

      expect(result.status).toBe('success');
      expect(result.transactionId).toBe('txn_msg_123');
      expect(result.dataCloudHash).toBe('0xmsg123');
      expect(result.indexId).toBe('evt_msg_123');

      // Verify that the correct metadata was generated for message
      expect(mockRulesInterpreter.validateMetadata).toHaveBeenCalledWith(
        expect.objectContaining({
          processing: expect.objectContaining({
            dataCloudWriteMode: 'direct',
            indexWriteMode: 'realtime',
          }),
          userContext: expect.objectContaining({
            source: 'telegram',
            userId: messageData.userId,
            chatId: messageData.chatId,
            messageType: messageData.messageType,
          }),
        }),
      );
    });
  });

  describe('Bullish campaign auto-detection', () => {
    it('should auto-detect and process Bullish campaign event', async () => {
      const campaignEvent = mockBullishEvent();

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
        additionalParams: { priority: 'high', encryption: false },
      });
      mockDispatcher.routeRequest = jest.fn().mockReturnValue({
        actions: [{ target: 'activity-sdk', method: 'sendEvent' }],
        executionMode: 'sequential',
        rollbackRequired: false,
      });
      mockOrchestrator.execute = jest.fn().mockResolvedValue({
        results: [{ target: 'activity-sdk', success: true, response: { eventId: 'evt_bullish_123' } }],
        overallStatus: 'success',
        transactionId: 'txn_bullish_123',
      });

      const result = await sdk.writeData(campaignEvent);

      expect(result.status).toBe('success');
      expect(result.transactionId).toBe('txn_bullish_123');
      expect(result.indexId).toBe('evt_bullish_123');

      // Verify that the correct metadata was generated for campaign
      expect(mockRulesInterpreter.validateMetadata).toHaveBeenCalledWith(
        expect.objectContaining({
          processing: expect.objectContaining({
            dataCloudWriteMode: 'viaIndex',
            indexWriteMode: 'realtime',
          }),
          userContext: expect.objectContaining({
            source: 'bullish',
            accountId: campaignEvent.accountId,
            campaignId: campaignEvent.campaignId,
            eventType: campaignEvent.eventType,
          }),
        }),
      );
    });
  });

  describe('Generic data handling', () => {
    it('should handle generic data without auto-detection', async () => {
      const genericData = {
        customField: 'value',
        data: { nested: 'object' },
        timestamp: new Date(),
      };

      // Setup component mocks
      const mockRulesInterpreter = (sdk as any).rulesInterpreter;
      const mockDispatcher = (sdk as any).dispatcher;
      const mockOrchestrator = (sdk as any).orchestrator;

      mockRulesInterpreter.validateMetadata = jest.fn().mockReturnValue({
        processing: {
          dataCloudWriteMode: 'direct',
          indexWriteMode: 'skip',
        },
      });
      mockRulesInterpreter.extractProcessingRules = jest.fn().mockReturnValue({
        dataCloudAction: 'write_direct',
        indexAction: 'skip',
        batchingRequired: false,
        additionalParams: { priority: 'normal', encryption: false },
      });
      mockDispatcher.routeRequest = jest.fn().mockReturnValue({
        actions: [{ target: 'ddc-client', method: 'store' }],
        executionMode: 'sequential',
        rollbackRequired: false,
      });
      mockOrchestrator.execute = jest.fn().mockResolvedValue({
        results: [{ target: 'ddc-client', success: true, response: { cid: '0xgeneric123' } }],
        overallStatus: 'success',
        transactionId: 'txn_generic_123',
      });

      const result = await sdk.writeData(genericData);

      expect(result.status).toBe('success');
      expect(result.transactionId).toBe('txn_generic_123');
      expect(result.dataCloudHash).toBe('0xgeneric123');
      expect(result.indexId).toBeUndefined();

      // Verify that generic processing metadata was used
      expect(mockRulesInterpreter.validateMetadata).toHaveBeenCalledWith(
        expect.objectContaining({
          processing: expect.objectContaining({
            dataCloudWriteMode: 'direct',
            indexWriteMode: 'skip',
          }),
        }),
      );
    });
  });

  describe('Auto-detection edge cases', () => {
    it('should handle malformed Telegram-like data', async () => {
      const malformedData = {
        eventType: 'quest_completed',
        // Missing required fields like userId, chatId
        eventData: { questId: 'daily' },
      };

      // Should fall back to generic processing
      const mockRulesInterpreter = (sdk as any).rulesInterpreter;
      const mockDispatcher = (sdk as any).dispatcher;
      const mockOrchestrator = (sdk as any).orchestrator;

      mockRulesInterpreter.validateMetadata = jest.fn().mockReturnValue({
        processing: {
          dataCloudWriteMode: 'direct',
          indexWriteMode: 'skip',
        },
      });
      mockRulesInterpreter.extractProcessingRules = jest.fn().mockReturnValue({
        dataCloudAction: 'write_direct',
        indexAction: 'skip',
        batchingRequired: false,
        additionalParams: { priority: 'normal', encryption: false },
      });
      mockDispatcher.routeRequest = jest.fn().mockReturnValue({
        actions: [{ target: 'ddc-client', method: 'store' }],
        executionMode: 'sequential',
        rollbackRequired: false,
      });
      mockOrchestrator.execute = jest.fn().mockResolvedValue({
        results: [{ target: 'ddc-client', success: true, response: { cid: '0xmalformed123' } }],
        overallStatus: 'success',
        transactionId: 'txn_malformed_123',
      });

      const result = await sdk.writeData(malformedData);

      expect(result.status).toBe('success');
      expect(result.transactionId).toBe('txn_malformed_123');
      expect(result.dataCloudHash).toBe('0xmalformed123');

      // Should not have user context for malformed data
      expect(mockRulesInterpreter.validateMetadata).toHaveBeenCalledWith(
        expect.objectContaining({
          processing: expect.objectContaining({
            dataCloudWriteMode: 'direct',
            indexWriteMode: 'skip',
          }),
        }),
      );
    });
  });
});
