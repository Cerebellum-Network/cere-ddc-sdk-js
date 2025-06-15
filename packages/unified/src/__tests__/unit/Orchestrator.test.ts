import { Orchestrator } from '../../Orchestrator';
import { Action, DispatchPlan } from '../../Dispatcher';
import { UnifiedSDKError } from '../../types';
import { createMockConfig } from '../helpers/test-fixtures';
import { setupMockDDCClient, setupMockActivitySDK } from '../helpers/test-utils';

// Enhanced mock responses based on actual implementation
const mockResponses = {
  ddcSuccess: {
    cid: '0xabc123',
    bucketId: BigInt(12345),
    status: 'stored',
    timestamp: '2023-01-01T00:00:00.000Z',
    size: 1024,
  },
  activitySuccess: {
    eventId: 'evt_123',
    status: 'sent',
    timestamp: '2023-01-01T00:00:00.000Z',
    payload: { type: 'test' },
    success: true,
  },
  activitySkipped: {
    eventId: 'evt_123456789_abcdefghi',
    status: 'skipped',
    reason: 'Activity SDK not initialized',
    timestamp: '2023-01-01T00:00:00.000Z',
  },
  ddcError: new Error('DDC storage failed'),
  activityError: new Error('Activity dispatch failed'),
};

// Mock the DDC client modules that are dynamically imported
jest.mock('@cere-ddc-sdk/ddc-client', () => ({
  DdcClient: {
    create: jest.fn(),
  },
  DagNode: jest.fn().mockImplementation((data, links) => ({ data, links })),
  File: jest.fn().mockImplementation((data, metadata) => ({ data, metadata })),
}));

// Mock Activity SDK modules
jest.mock('@cere-activity-sdk/events', () => {
  const ActivityEventMock = jest.fn().mockImplementation((type: any, data: any, options: any = {}) => {
    return {
      id: 'evt_123',
      type,
      payload: data,
      time: options.time || new Date('2023-01-01T00:00:00.000Z'),
    };
  });
  
  return {
    EventDispatcher: jest.fn(),
    ActivityEvent: ActivityEventMock,
  };
});

jest.mock('@cere-activity-sdk/signers', () => ({
  UriSigner: jest.fn().mockImplementation(() => ({
    address: '0xtest123',
    sign: jest.fn().mockResolvedValue('mock-signature'),
  })),
}));

jest.mock('@cere-activity-sdk/ciphers', () => ({
  NoOpCipher: jest.fn().mockImplementation(() => ({
    encrypt: jest.fn().mockImplementation((data) => Promise.resolve(data)),
    decrypt: jest.fn().mockImplementation((data) => Promise.resolve(data)),
  })),
}));

describe('Orchestrator', () => {
  let orchestrator: Orchestrator;
  let mockLogger: jest.Mock;
  let mockConfig = createMockConfig();

  beforeEach(() => {
    jest.clearAllMocks();
    mockConfig = createMockConfig();
    mockLogger = jest.fn();
    orchestrator = new Orchestrator(mockConfig, mockLogger);
  });

  describe('initialize', () => {
    it('should initialize DDC client successfully', async () => {
      setupMockDDCClient();

      await orchestrator.initialize();

      expect(mockLogger).toHaveBeenCalledWith('info', 'Initializing Orchestrator');
      expect(mockLogger).toHaveBeenCalledWith('info', 'Orchestrator initialized successfully');
      expect((orchestrator as any).ddcClient).toBeTruthy();
    });

    it('should initialize Activity SDK when config provided', async () => {
      setupMockDDCClient();
      setupMockActivitySDK();

      await orchestrator.initialize();

      expect(mockLogger).toHaveBeenCalledWith('debug', 'Initializing Activity SDK...');
      expect((orchestrator as any).activityClient).toBeTruthy();
    });

    it('should handle Activity SDK initialization failure gracefully', async () => {
      setupMockDDCClient();

      const { UriSigner } = require('@cere-activity-sdk/signers');
      UriSigner.mockImplementation(() => {
        throw new Error('Signer failed');
      });

      await expect(orchestrator.initialize()).resolves.not.toThrow();
      expect(mockLogger).toHaveBeenCalledWith(
        'warn',
        'Failed to initialize Activity SDK - will operate in DDC-only mode',
        expect.any(Error),
      );
    });

    it('should throw UnifiedSDKError on DDC client failure', async () => {
      const { DdcClient } = require('@cere-ddc-sdk/ddc-client');
      DdcClient.create.mockRejectedValue(new Error('DDC failed'));

      await expect(orchestrator.initialize()).rejects.toThrow(UnifiedSDKError);
      await expect(orchestrator.initialize()).rejects.toThrow('Orchestrator initialization failed');
    });

    it('should handle missing activity config gracefully', async () => {
      const configWithoutActivity = createMockConfig({ activityConfig: undefined });
      const orchestratorNoActivity = new Orchestrator(configWithoutActivity, mockLogger);

      setupMockDDCClient();

      await expect(orchestratorNoActivity.initialize()).resolves.not.toThrow();
      expect(mockLogger).toHaveBeenCalledWith('info', 'Orchestrator initialized successfully');
    });
  });

  describe('execute', () => {
    const mockPlan: DispatchPlan = {
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
    };

    beforeEach(() => {
      const mockDdcClient = setupMockDDCClient();
      (orchestrator as any).ddcClient = mockDdcClient;
    });

    it('should execute sequential actions', async () => {
      const result = await orchestrator.execute(mockPlan);

      expect(result.results).toHaveLength(1);
      expect(result.overallStatus).toBe('success');
      expect(result.transactionId).toMatch(/^txn_/);
      expect(result.totalExecutionTime).toBeGreaterThanOrEqual(0);

      const ddcResult = result.results[0];
      expect(ddcResult.success).toBe(true);
      expect(ddcResult.response.cid).toBe('0xabc123');
      expect(ddcResult.response.status).toBe('stored');
    });

    it('should execute parallel actions', async () => {
      const { mockEventDispatcher } = setupMockActivitySDK();
      // Ensure both dispatchEvent returns true for success
      mockEventDispatcher.dispatchEvent.mockResolvedValue(true);
      (orchestrator as any).activityClient = mockEventDispatcher;

      const parallelPlan: DispatchPlan = {
        ...mockPlan,
        executionMode: 'parallel',
        rollbackRequired: true,
        actions: [
          ...mockPlan.actions,
          {
            target: 'activity-sdk',
            method: 'sendEvent',
            payload: { type: 'test' },
            options: {},
            priority: 'normal',
          },
        ],
      };

      const result = await orchestrator.execute(parallelPlan);

      // Debug the actual results to understand the failure
      console.log('Parallel execution results:', {
        overallStatus: result.overallStatus,
        results: result.results.map((r) => ({
          target: r.target,
          success: r.success,
          error: r.error,
        })),
      });

      expect(result.results).toHaveLength(2);
      expect(result.overallStatus).toBe('success');

      expect(result.results[0].success).toBe(true);
      expect(result.results[0].response.cid).toBe('0xabc123');

      expect(result.results[1].success).toBe(true);
      expect(result.results[1].response.eventId).toBe('evt_123');
    });

    it('should determine correct overall status', async () => {
      const mixedPlan: DispatchPlan = {
        ...mockPlan,
        rollbackRequired: true,
        actions: [
          {
            target: 'ddc-client',
            method: 'store',
            payload: { data: 'test' },
            options: {},
            priority: 'normal',
          },
          {
            target: 'http-api', // This will fail with NOT_IMPLEMENTED
            method: 'post',
            payload: { data: 'test' },
            options: {},
            priority: 'normal',
          },
        ],
      };

      const result = await orchestrator.execute(mixedPlan);

      expect(result.results).toHaveLength(2);
      expect(result.overallStatus).toBe('partial');
      expect(result.results[0].success).toBe(true);
      expect(result.results[1].success).toBe(false);
      expect(result.results[1].error).toContain('HTTP API actions not yet implemented');
    });

    it('should handle execution timeout', async () => {
      const timeoutConfig = createMockConfig({
        processing: { ...mockConfig.processing, retryDelay: 100 },
      });
      const timeoutOrchestrator = new Orchestrator(timeoutConfig, mockLogger);

      // Mock a very slow operation
      const slowMockClient = {
        store: jest
          .fn()
          .mockImplementation(
            () => new Promise((resolve) => setTimeout(() => resolve(mockResponses.ddcSuccess), 10000)),
          ),
        disconnect: jest.fn(),
      };
      (timeoutOrchestrator as any).ddcClient = slowMockClient;

      const slowPlan = { ...mockPlan };
      const startTime = Date.now();

      const result = await timeoutOrchestrator.execute(slowPlan);
      const duration = Date.now() - startTime;

      // Should complete (albeit slowly) because no actual timeout is implemented
      expect(duration).toBeGreaterThan(100);
      expect(result.overallStatus).toBe('success');
    });
  });

  describe('executeDDCAction', () => {
    beforeEach(() => {
      const mockDdcClient = setupMockDDCClient();
      (orchestrator as any).ddcClient = mockDdcClient;
    });

    it('should execute DDC store action with DagNode', async () => {
      const action: Action = {
        target: 'ddc-client',
        method: 'store',
        payload: { data: 'test data', links: [] },
        options: {},
        priority: 'normal',
      };

      const result = await (orchestrator as any).executeDDCAction(action);

      // executeDDCAction returns the direct response, not wrapped in ExecutionResult
      expect(result.cid).toBe('0xabc123');
      expect(result.status).toBe('stored');
    });

    it('should execute DDC store action with File', async () => {
      const action: Action = {
        target: 'ddc-client',
        method: 'store',
        payload: { data: Buffer.from('file content'), metadata: { filename: 'test.txt' } },
        options: { useFile: true },
        priority: 'normal',
      };

      const result = await (orchestrator as any).executeDDCAction(action);

      expect(result.cid).toBe('0xabc123');
      expect(result.status).toBe('stored');
    });

    it('should handle DDC action failures', async () => {
      const mockDdcClient = {
        store: jest.fn().mockRejectedValue(mockResponses.ddcError),
        disconnect: jest.fn(),
      };
      (orchestrator as any).ddcClient = mockDdcClient;

      const action: Action = {
        target: 'ddc-client',
        method: 'store',
        payload: { data: 'test' },
        options: {},
        priority: 'normal',
      };

      await expect((orchestrator as any).executeDDCAction(action)).rejects.toThrow('DDC storage failed');
    });
  });

  describe('executeActivityAction', () => {
    it('should return skipped response when Activity SDK not available', async () => {
      // Ensure no Activity SDK is available
      (orchestrator as any).activityClient = null;

      const action: Action = {
        target: 'activity-sdk',
        method: 'sendEvent',
        payload: { type: 'test' },
        options: {},
        priority: 'normal',
      };

      const result = await (orchestrator as any).executeActivityAction(action);

      expect(result.status).toBe('skipped');
      expect(result.reason).toBe('Activity SDK not initialized');
      expect(result.eventId).toMatch(/^evt_/);
    });

    it('should execute Activity SDK action successfully', async () => {
      const { mockEventDispatcher } = setupMockActivitySDK();
      (orchestrator as any).activityClient = mockEventDispatcher;

      const action: Action = {
        target: 'activity-sdk',
        method: 'sendEvent',
        payload: { type: 'test_event', userId: 'user123' },
        options: {},
        priority: 'normal',
      };

      const result = await (orchestrator as any).executeActivityAction(action);

      expect(result.eventId).toBe('evt_123');
      expect(result.status).toBe('sent');
      expect(result.success).toBe(true);
    });

    it('should fallback to DDC when Activity SDK fails and writeToDataCloud is true', async () => {
      const mockDdcClient = setupMockDDCClient();
      (orchestrator as any).ddcClient = mockDdcClient;

      const failingDispatcher = {
        dispatchEvent: jest.fn().mockRejectedValue(mockResponses.activityError),
      };
      (orchestrator as any).activityClient = failingDispatcher;

      const action: Action = {
        target: 'activity-sdk',
        method: 'sendEvent',
        payload: { type: 'test_event' },
        options: { writeToDataCloud: true },
        priority: 'normal',
      };

      const result = await (orchestrator as any).executeActivityAction(action);

      // Should fallback to DDC storage
      expect(result.status).toBe('fallback_to_ddc');
      expect(result.ddcResult.cid).toBe('0xabc123'); // DDC fallback result
      expect(result.originalError).toBe('Activity dispatch failed');
    });
  });

  describe('cleanup', () => {
    it('should cleanup DDC client', async () => {
      const mockDdcClient = setupMockDDCClient();
      (orchestrator as any).ddcClient = mockDdcClient;

      await orchestrator.cleanup();

      expect(mockDdcClient.disconnect).toHaveBeenCalled();
      expect(mockLogger).toHaveBeenCalledWith('info', 'Cleaning up Orchestrator');
      expect(mockLogger).toHaveBeenCalledWith('info', 'Orchestrator cleanup completed');
    });

    it('should handle cleanup when not initialized', async () => {
      // Should not throw error
      await expect(orchestrator.cleanup()).resolves.not.toThrow();
      expect(mockLogger).toHaveBeenCalledWith('info', 'Orchestrator cleanup completed');
    });

    it('should handle cleanup errors gracefully', async () => {
      const faultyClient = {
        disconnect: jest.fn().mockRejectedValue(new Error('Disconnect failed')),
      };
      (orchestrator as any).ddcClient = faultyClient;

      // Should log error but not throw
      await expect(orchestrator.cleanup()).resolves.not.toThrow();
      expect(mockLogger).toHaveBeenCalledWith('warn', 'Failed to disconnect DDC client', expect.any(Error));
    });
  });

  describe('resource management', () => {
    it('should manage multiple concurrent operations', async () => {
      const mockDdcClient = setupMockDDCClient();
      (orchestrator as any).ddcClient = mockDdcClient;

      const concurrentPlans = Array.from({ length: 5 }, (_, i) => ({
        actions: [
          {
            target: 'ddc-client' as const,
            method: 'store',
            payload: { data: `test_${i}` },
            options: {},
            priority: 'normal' as const,
          },
        ],
        executionMode: 'sequential' as const,
        rollbackRequired: false,
      }));

      const results = await Promise.all(concurrentPlans.map((plan) => orchestrator.execute(plan)));

      results.forEach((result, index) => {
        expect(result.overallStatus).toBe('success');
        expect(result.results).toHaveLength(1);
        expect(result.transactionId).toMatch(/^txn_/);
      });
    });

    it('should handle memory pressure gracefully', async () => {
      const mockDdcClient = setupMockDDCClient();
      (orchestrator as any).ddcClient = mockDdcClient;

      // Create a large payload plan
      const largePlan: DispatchPlan = {
        actions: [
          {
            target: 'ddc-client',
            method: 'store',
            payload: { data: 'x'.repeat(1024 * 1024) }, // 1MB
            options: {},
            priority: 'normal',
          },
        ],
        executionMode: 'sequential',
        rollbackRequired: false,
      };

      const result = await orchestrator.execute(largePlan);
      expect(result.overallStatus).toBe('success');
    });
  });
});
