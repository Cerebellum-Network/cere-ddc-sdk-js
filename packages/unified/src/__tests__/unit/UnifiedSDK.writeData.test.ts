import { UnifiedSDK } from '../../UnifiedSDK';
import { UnifiedSDKError } from '../../types';
import { createMockConfig, createMockMetadata, testScenarios } from '../helpers/test-fixtures';

// Mock all dependencies
jest.mock('../../RulesInterpreter');
jest.mock('../../Dispatcher');
jest.mock('../../Orchestrator');

describe('UnifiedSDK - writeData', () => {
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

  describe('basic writeData operations', () => {
    it('should process data successfully with direct write', async () => {
      const payload = { test: 'data' };
      const options = {
        priority: 'normal' as const,
        encryption: false,
        metadata: testScenarios.directWrite.metadata,
      };

      // Setup component mocks
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
            metadata: testScenarios.directWrite.metadata,
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
            metadata: testScenarios.directWrite.metadata,
          },
        ),
      ).rejects.toThrow(UnifiedSDKError);
    });
  });

  describe('batch operations', () => {
    it('should handle batch write operations', async () => {
      const payload = { test: 'batch data' };
      const options = {
        metadata: testScenarios.batchWrite.metadata,
      };

      const mockRulesInterpreter = (sdk as any).rulesInterpreter;
      const mockDispatcher = (sdk as any).dispatcher;
      const mockOrchestrator = (sdk as any).orchestrator;

      mockRulesInterpreter.validateMetadata = jest.fn().mockReturnValue(options.metadata);
      mockRulesInterpreter.extractProcessingRules = jest.fn().mockReturnValue({
        dataCloudAction: 'write_batch',
        indexAction: 'write_realtime',
        batchingRequired: true,
        additionalParams: {
          priority: 'normal',
          encryption: false,
          batchOptions: { maxSize: 100, maxWaitTime: 5000 },
        },
      });
      mockRulesInterpreter.optimizeProcessingRules = jest.fn().mockReturnValue({
        dataCloudAction: 'write_batch',
        indexAction: 'write_realtime',
        batchingRequired: true,
        additionalParams: {
          priority: 'normal',
          encryption: false,
          batchOptions: { maxSize: 100, maxWaitTime: 5000 },
        },
      });
      mockDispatcher.routeRequest = jest.fn().mockReturnValue({
        actions: [{ target: 'ddc-client', method: 'storeBatch' }],
        executionMode: 'sequential',
        rollbackRequired: false,
      });
      mockOrchestrator.execute = jest.fn().mockResolvedValue({
        results: [{ target: 'ddc-client', success: true, response: { cid: '0xbatch123' }, executionTime: 200 }],
        overallStatus: 'success',
        totalExecutionTime: 200,
        transactionId: 'txn_batch_456',
      });

      const result = await sdk.writeData(payload, options);

      expect(result.status).toBe('success');
      expect(result.transactionId).toBe('txn_batch_456');
      expect(result.dataCloudHash).toBe('0xbatch123');
    });
  });

  describe('via index operations', () => {
    it('should handle via index write operations', async () => {
      const payload = { test: 'via index data' };
      const options = {
        metadata: testScenarios.viaIndexWrite.metadata,
      };

      const mockRulesInterpreter = (sdk as any).rulesInterpreter;
      const mockDispatcher = (sdk as any).dispatcher;
      const mockOrchestrator = (sdk as any).orchestrator;

      mockRulesInterpreter.validateMetadata = jest.fn().mockReturnValue(options.metadata);
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
        results: [{ target: 'activity-sdk', success: true, response: { eventId: 'evt_123' }, executionTime: 150 }],
        overallStatus: 'success',
        totalExecutionTime: 150,
        transactionId: 'txn_index_789',
      });

      const result = await sdk.writeData(payload, options);

      expect(result.status).toBe('success');
      expect(result.transactionId).toBe('txn_index_789');
      expect(result.indexId).toBe('evt_123');
    });
  });

  describe('error handling', () => {
    it('should handle orchestrator execution failures', async () => {
      const payload = { test: 'error data' };
      const options = {
        metadata: testScenarios.directWrite.metadata,
      };

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
      mockOrchestrator.execute = jest.fn().mockRejectedValue(new Error('Execution failed'));

      await expect(sdk.writeData(payload, options)).rejects.toThrow(UnifiedSDKError);
    });

    it('should handle partial execution results', async () => {
      const payload = { test: 'partial data' };
      const options = {
        metadata: testScenarios.directWrite.metadata,
      };

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
        actions: [
          { target: 'ddc-client', method: 'store' },
          { target: 'activity-sdk', method: 'sendEvent' },
        ],
        executionMode: 'sequential',
        rollbackRequired: false,
      });
      mockOrchestrator.execute = jest.fn().mockResolvedValue({
        results: [
          { target: 'ddc-client', success: true, response: { cid: '0xabc123' }, executionTime: 100 },
          { target: 'activity-sdk', success: false, error: 'Activity failed', executionTime: 50 },
        ],
        overallStatus: 'partial',
        totalExecutionTime: 150,
        transactionId: 'txn_partial_999',
      });

      const result = await sdk.writeData(payload, options);

      expect(result.status).toBe('partial');
      expect(result.transactionId).toBe('txn_partial_999');
      expect(result.dataCloudHash).toBe('0xabc123');
      expect(result.errors).toBeDefined();
      expect(result.errors?.length).toBeGreaterThan(0);
    });

    it('should handle complete execution failures', async () => {
      const payload = { test: 'failed data' };
      const options = {
        metadata: testScenarios.directWrite.metadata,
      };

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
        results: [{ target: 'ddc-client', success: false, error: 'DDC failed', executionTime: 100 }],
        overallStatus: 'failed',
        totalExecutionTime: 100,
        transactionId: 'txn_failed_000',
      });

      const result = await sdk.writeData(payload, options);

      expect(result.status).toBe('failed');
      expect(result.transactionId).toBe('txn_failed_000');
      expect(result.errors).toBeDefined();
      expect(result.errors?.length).toBeGreaterThan(0);
    });
  });

  describe('encryption support', () => {
    it('should handle encrypted data writes', async () => {
      const payload = { sensitiveData: 'secret' };
      const options = {
        encryption: true,
        metadata: createMockMetadata({
          processing: {
            dataCloudWriteMode: 'direct',
            indexWriteMode: 'realtime',
            encryption: true,
          },
        }),
      };

      const mockRulesInterpreter = (sdk as any).rulesInterpreter;
      const mockDispatcher = (sdk as any).dispatcher;
      const mockOrchestrator = (sdk as any).orchestrator;

      mockRulesInterpreter.validateMetadata = jest.fn().mockReturnValue(options.metadata);
      mockRulesInterpreter.extractProcessingRules = jest.fn().mockReturnValue({
        dataCloudAction: 'write_direct',
        indexAction: 'write_realtime',
        batchingRequired: false,
        additionalParams: { priority: 'normal', encryption: true },
      });
      mockRulesInterpreter.optimizeProcessingRules = jest.fn().mockReturnValue({
        dataCloudAction: 'write_direct',
        indexAction: 'write_realtime',
        batchingRequired: false,
        additionalParams: { priority: 'normal', encryption: true },
      });
      mockDispatcher.routeRequest = jest.fn().mockReturnValue({
        actions: [{ target: 'ddc-client', method: 'store', options: { encryption: true } }],
        executionMode: 'sequential',
        rollbackRequired: false,
      });
      mockOrchestrator.execute = jest.fn().mockResolvedValue({
        results: [{ target: 'ddc-client', success: true, response: { cid: '0xencrypted123' }, executionTime: 120 }],
        overallStatus: 'success',
        totalExecutionTime: 120,
        transactionId: 'txn_encrypted_111',
      });

      const result = await sdk.writeData(payload, options);

      expect(result.status).toBe('success');
      expect(result.transactionId).toBe('txn_encrypted_111');
      expect(result.dataCloudHash).toBe('0xencrypted123');
    });
  });
});
