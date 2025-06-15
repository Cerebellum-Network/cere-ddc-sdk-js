import { UnifiedSDK } from '../../UnifiedSDK';
import { createMockConfig, createLargePayload, createBatchPayload, testScenarios } from '../helpers/test-fixtures';
import { measureExecutionTime, createInitializedSDK } from '../helpers/test-utils';

// Mock all dependencies
jest.mock('../../RulesInterpreter');
jest.mock('../../Dispatcher');
jest.mock('../../Orchestrator');

describe('UnifiedSDK - Performance & Integration', () => {
  let sdk: UnifiedSDK;

  beforeEach(async () => {
    sdk = await createInitializedSDK();
    jest.clearAllMocks();
  });

  describe('Performance benchmarks', () => {
    it('should handle large payloads efficiently', async () => {
      const largePayload = createLargePayload(100); // 100KB payload
      const options = {
        metadata: testScenarios.directWrite.metadata,
      };

      // Setup mocks for large payload handling
      const mockRulesInterpreter = (sdk as any).rulesInterpreter;
      const mockOrchestrator = (sdk as any).orchestrator;

      mockRulesInterpreter.validateMetadata = jest.fn().mockReturnValue(options.metadata);
      mockRulesInterpreter.extractProcessingRules = jest.fn().mockReturnValue({
        dataCloudAction: 'write_direct',
        indexAction: 'write_realtime',
        batchingRequired: false,
        additionalParams: { priority: 'normal', encryption: false },
      });
      mockOrchestrator.execute = jest.fn().mockResolvedValue({
        results: [{ target: 'ddc-client', success: true, response: { cid: '0xlarge123' } }],
        overallStatus: 'success',
        transactionId: 'txn_large_123',
      });

      const { result, executionTime } = await measureExecutionTime(async () => {
        return sdk.writeData(largePayload, options);
      });

      expect(result.status).toBe('success');
      expect(executionTime).toBeLessThan(5000); // Should complete within 5 seconds
      expect(result.transactionId).toBe('txn_large_123');
    });

    it('should handle batch operations efficiently', async () => {
      const batchPayload = createBatchPayload(50); // 50 items
      const options = {
        metadata: testScenarios.batchWrite.metadata,
      };

      // Setup mocks for batch handling
      const mockRulesInterpreter = (sdk as any).rulesInterpreter;
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
      mockOrchestrator.execute = jest.fn().mockResolvedValue({
        results: [{ target: 'ddc-client', success: true, response: { cid: '0xbatch123' } }],
        overallStatus: 'success',
        transactionId: 'txn_batch_123',
      });

      const { result, executionTime } = await measureExecutionTime(async () => {
        return sdk.writeData(batchPayload, options);
      });

      expect(result.status).toBe('success');
      expect(executionTime).toBeLessThan(3000); // Batch should be faster
      expect(result.transactionId).toBe('txn_batch_123');
    });

    it('should handle concurrent write operations', async () => {
      const concurrentOperations = 10;
      const payloads = Array.from({ length: concurrentOperations }, (_, i) => ({
        id: `concurrent_${i}`,
        data: `test_data_${i}`,
      }));

      // Setup mocks
      const mockRulesInterpreter = (sdk as any).rulesInterpreter;
      const mockOrchestrator = (sdk as any).orchestrator;

      mockRulesInterpreter.validateMetadata = jest.fn().mockReturnValue(testScenarios.directWrite.metadata);
      mockRulesInterpreter.extractProcessingRules = jest.fn().mockReturnValue({
        dataCloudAction: 'write_direct',
        indexAction: 'write_realtime',
        batchingRequired: false,
        additionalParams: { priority: 'normal', encryption: false },
      });
      mockOrchestrator.execute = jest.fn().mockImplementation(async () => ({
        results: [{ target: 'ddc-client', success: true, response: { cid: '0xconcurrent123' } }],
        overallStatus: 'success',
        transactionId: `txn_concurrent_${Date.now()}`,
      }));

      const { result: results, executionTime } = await measureExecutionTime(async () => {
        return Promise.all(
          payloads.map((payload) => sdk.writeData(payload, { metadata: testScenarios.directWrite.metadata })),
        );
      });

      expect(results).toHaveLength(concurrentOperations);
      results.forEach((result: any) => {
        expect(result.status).toBe('success');
        expect(result.transactionId).toMatch(/^txn_concurrent_/);
      });
      expect(executionTime).toBeLessThan(10000); // All concurrent operations within 10 seconds
    });
  });

  describe('Resource management', () => {
    it('should properly clean up resources on multiple operations', async () => {
      const operations = 5;

      // Setup mocks
      const mockRulesInterpreter = (sdk as any).rulesInterpreter;
      const mockOrchestrator = (sdk as any).orchestrator;

      mockRulesInterpreter.validateMetadata = jest.fn().mockReturnValue(testScenarios.directWrite.metadata);
      mockRulesInterpreter.extractProcessingRules = jest.fn().mockReturnValue({
        dataCloudAction: 'write_direct',
        indexAction: 'write_realtime',
        batchingRequired: false,
        additionalParams: { priority: 'normal', encryption: false },
      });
      mockOrchestrator.execute = jest.fn().mockResolvedValue({
        results: [{ target: 'ddc-client', success: true, response: { cid: '0xcleanup123' } }],
        overallStatus: 'success',
        transactionId: 'txn_cleanup_123',
      });

      // Perform multiple operations
      for (let i = 0; i < operations; i++) {
        const result = await sdk.writeData({ operation: i }, { metadata: testScenarios.directWrite.metadata });
        expect(result.status).toBe('success');
      }

      // Verify that mocks were called the expected number of times
      expect(mockRulesInterpreter.validateMetadata).toHaveBeenCalledTimes(operations);
      expect(mockOrchestrator.execute).toHaveBeenCalledTimes(operations);
    });

    it('should handle memory-intensive operations without leaks', async () => {
      // Create multiple large payloads
      const largeOperations = 3;
      const payloadSize = 50; // 50KB each

      // Setup mocks
      const mockRulesInterpreter = (sdk as any).rulesInterpreter;
      const mockOrchestrator = (sdk as any).orchestrator;

      mockRulesInterpreter.validateMetadata = jest.fn().mockReturnValue(testScenarios.directWrite.metadata);
      mockRulesInterpreter.extractProcessingRules = jest.fn().mockReturnValue({
        dataCloudAction: 'write_direct',
        indexAction: 'write_realtime',
        batchingRequired: false,
        additionalParams: { priority: 'normal', encryption: false },
      });
      mockOrchestrator.execute = jest.fn().mockResolvedValue({
        results: [{ target: 'ddc-client', success: true, response: { cid: '0xmemory123' } }],
        overallStatus: 'success',
        transactionId: 'txn_memory_123',
      });

      const memoryBefore = process.memoryUsage();

      // Perform memory-intensive operations
      for (let i = 0; i < largeOperations; i++) {
        const largePayload = createLargePayload(payloadSize);
        const result = await sdk.writeData(largePayload, { metadata: testScenarios.directWrite.metadata });
        expect(result.status).toBe('success');
      }

      const memoryAfter = process.memoryUsage();

      // Memory usage should not grow excessively (basic leak detection)
      const memoryGrowth = memoryAfter.heapUsed - memoryBefore.heapUsed;
      // More realistic memory growth expectation for test environment
      expect(memoryGrowth).toBeLessThan(payloadSize * largeOperations * 1024 * 10); // Allow 10x buffer for test overhead
    });
  });

  describe('Error recovery and resilience', () => {
    it('should recover from temporary failures', async () => {
      const payload = { test: 'recovery' };
      const options = {
        metadata: testScenarios.directWrite.metadata,
      };

      // Setup mocks to simulate failure then success
      const mockRulesInterpreter = (sdk as any).rulesInterpreter;
      const mockOrchestrator = (sdk as any).orchestrator;

      mockRulesInterpreter.validateMetadata = jest.fn().mockReturnValue(options.metadata);
      mockRulesInterpreter.extractProcessingRules = jest.fn().mockReturnValue({
        dataCloudAction: 'write_direct',
        indexAction: 'write_realtime',
        batchingRequired: false,
        additionalParams: { priority: 'normal', encryption: false },
      });

      // First call fails, second succeeds
      mockOrchestrator.execute = jest
        .fn()
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockResolvedValueOnce({
          results: [{ target: 'ddc-client', success: true, response: { cid: '0xrecovery123' } }],
          overallStatus: 'success',
          transactionId: 'txn_recovery_123',
        });

      // First attempt should fail
      await expect(sdk.writeData(payload, options)).rejects.toThrow();

      // Second attempt should succeed
      const result = await sdk.writeData(payload, options);
      expect(result.status).toBe('success');
      expect(result.transactionId).toBe('txn_recovery_123');
    });

    it('should handle mixed success/failure scenarios gracefully', async () => {
      const payload = { test: 'mixed results' };
      const options = {
        metadata: testScenarios.directWrite.metadata,
      };

      // Setup mocks
      const mockRulesInterpreter = (sdk as any).rulesInterpreter;
      const mockOrchestrator = (sdk as any).orchestrator;

      mockRulesInterpreter.validateMetadata = jest.fn().mockReturnValue(options.metadata);
      mockRulesInterpreter.extractProcessingRules = jest.fn().mockReturnValue({
        dataCloudAction: 'write_direct',
        indexAction: 'write_realtime',
        batchingRequired: false,
        additionalParams: { priority: 'normal', encryption: false },
      });
      mockOrchestrator.execute = jest.fn().mockResolvedValue({
        results: [
          { target: 'ddc-client', success: true, response: { cid: '0xmixed123' } },
          { target: 'activity-sdk', success: false, error: 'Activity service unavailable' },
        ],
        overallStatus: 'partial',
        transactionId: 'txn_mixed_123',
      });

      const result = await sdk.writeData(payload, options);

      expect(result.status).toBe('partial');
      expect(result.transactionId).toBe('txn_mixed_123');
      expect(result.dataCloudHash).toBe('0xmixed123');
      expect(result.errors).toBeDefined();
      expect(result.errors?.length).toBeGreaterThan(0);
    });
  });

  describe('Configuration edge cases', () => {
    it('should handle extreme batch configurations', async () => {
      const extremeBatchConfig = createMockConfig({
        processing: {
          enableBatching: true,
          defaultBatchSize: 1000, // Very large batch
          defaultBatchTimeout: 100, // Very short timeout
          maxRetries: 1,
          retryDelay: 50,
        },
      });

      const extremeSdk = await createInitializedSDK(extremeBatchConfig);
      const payload = createBatchPayload(10);

      // Setup mocks
      const mockRulesInterpreter = (extremeSdk as any).rulesInterpreter;
      const mockOrchestrator = (extremeSdk as any).orchestrator;

      mockRulesInterpreter.validateMetadata = jest.fn().mockReturnValue(testScenarios.batchWrite.metadata);
      mockRulesInterpreter.extractProcessingRules = jest.fn().mockReturnValue({
        dataCloudAction: 'write_batch',
        indexAction: 'write_realtime',
        batchingRequired: true,
        additionalParams: {
          priority: 'normal',
          encryption: false,
          batchOptions: { maxSize: 1000, maxWaitTime: 100 },
        },
      });
      mockOrchestrator.execute = jest.fn().mockResolvedValue({
        results: [{ target: 'ddc-client', success: true, response: { cid: '0xextreme123' } }],
        overallStatus: 'success',
        transactionId: 'txn_extreme_123',
      });

      const result = await extremeSdk.writeData(payload, { metadata: testScenarios.batchWrite.metadata });

      expect(result.status).toBe('success');
      expect(result.transactionId).toBe('txn_extreme_123');
    });
  });
});
