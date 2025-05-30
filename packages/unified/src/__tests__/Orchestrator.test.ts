/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-extraneous-dependencies */
import { Orchestrator } from '../Orchestrator';
import { Action, DispatchPlan } from '../Dispatcher';
import { UnifiedSDKConfig, UnifiedSDKError } from '../types';

describe('Orchestrator', () => {
  let orchestrator: Orchestrator;
  let mockLogger: jest.Mock;
  let mockConfig: UnifiedSDKConfig;

  beforeEach(() => {
    mockLogger = jest.fn();
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
        level: 'debug',
        enableMetrics: true,
      },
    };

    orchestrator = new Orchestrator(mockConfig, mockLogger);
  });

  describe('initialize', () => {
    it('should initialize DDC client successfully', async () => {
      const mockDdcClient = {
        store: jest.fn(),
        disconnect: jest.fn(),
      };

      // Mock DDC Client creation
      const { DdcClient } = await import('@cere-ddc-sdk/ddc-client');
      (DdcClient.create as jest.Mock) = jest.fn().mockResolvedValue(mockDdcClient);

      await orchestrator.initialize();

      expect(DdcClient.create).toHaveBeenCalledWith('//Alice', {
        blockchain: 'wss://rpc.testnet.cere.network/ws',
        logLevel: 'debug',
      });
    });

    it('should initialize Activity SDK when config provided', async () => {
      const mockEventDispatcher = { dispatchEvent: jest.fn() };
      const mockSigner = {};
      const mockCipher = {};

      // Mock Activity SDK modules
      const { EventDispatcher } = await import('@cere-activity-sdk/events');
      const { UriSigner } = await import('@cere-activity-sdk/signers');
      const { NoOpCipher } = await import('@cere-activity-sdk/ciphers');

      jest.mocked(EventDispatcher).mockReturnValue(mockEventDispatcher as any);
      jest.mocked(UriSigner).mockReturnValue(mockSigner as any);
      jest.mocked(NoOpCipher).mockReturnValue(mockCipher as any);

      await orchestrator.initialize();

      expect(UriSigner).toHaveBeenCalledWith('//Alice');
      expect(NoOpCipher).toHaveBeenCalled();
      expect(EventDispatcher).toHaveBeenCalledWith(mockSigner, mockCipher, {
        baseUrl: 'https://api.stats.cere.network',
        appId: 'test-app',
        connectionId: undefined,
        sessionId: undefined,
        appPubKey: 'test-key',
        dataServicePubKey: 'test-service-key',
      });
    });

    it('should handle Activity SDK initialization failure gracefully', async () => {
      const { UriSigner } = await import('@cere-activity-sdk/signers');
      jest.mocked(UriSigner).mockImplementation(() => {
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
      const { DdcClient } = await import('@cere-ddc-sdk/ddc-client');
      jest.mocked(DdcClient.create).mockRejectedValue(new Error('DDC failed'));

      await expect(orchestrator.initialize()).rejects.toThrow(UnifiedSDKError);
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

    beforeEach(async () => {
      // Mock successful initialization with proper return values
      const mockDdcClient = {
        store: jest.fn().mockResolvedValue({ toString: () => '0xabc123' }),
        disconnect: jest.fn(),
      };
      const { DdcClient } = await import('@cere-ddc-sdk/ddc-client');
      (DdcClient.create as jest.Mock) = jest.fn().mockResolvedValue(mockDdcClient);
      await orchestrator.initialize();
    });

    it('should execute sequential actions', async () => {
      const result = await orchestrator.execute(mockPlan);

      expect(result.results).toHaveLength(1);
      expect(result.overallStatus).toBe('success');
      expect(result.transactionId).toMatch(/^txn_/);
      expect(result.totalExecutionTime).toBeGreaterThanOrEqual(0);

      // Check the DDC response structure
      const ddcResult = result.results[0];
      expect(ddcResult.success).toBe(true);
      expect(ddcResult.response.cid).toBe('0xabc123');
      expect(ddcResult.response.status).toBe('stored');
    });

    it('should execute parallel actions', async () => {
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

      expect(result.results).toHaveLength(2);
      expect(result.overallStatus).toBe('partial'); // Activity SDK action will be skipped/failed

      // DDC action should succeed
      expect(result.results[0].success).toBe(true);
      expect(result.results[0].response.cid).toBe('0xabc123');

      // Activity SDK action should be skipped (no Activity SDK initialized)
      expect(result.results[1].success).toBe(false);
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
            target: 'http-api', // This will fail
            method: 'post',
            payload: { data: 'test' },
            options: {},
            priority: 'normal',
          },
        ],
      };

      const result = await orchestrator.execute(mixedPlan);

      expect(result.overallStatus).toBe('partial');
      expect(result.results.some((r) => r.success)).toBe(true);
      expect(result.results.some((r) => !r.success)).toBe(true);
    });
  });

  describe('executeDDCAction', () => {
    const mockAction: Action = {
      target: 'ddc-client',
      method: 'store',
      payload: { data: JSON.stringify({ test: 'data' }) },
      options: {},
      priority: 'normal',
    };

    beforeEach(async () => {
      const mockDdcClient = {
        store: jest.fn().mockResolvedValue({ toString: () => '0xabc123' }),
        disconnect: jest.fn(),
      };
      const { DdcClient } = await import('@cere-ddc-sdk/ddc-client');
      (DdcClient.create as jest.Mock) = jest.fn().mockResolvedValue(mockDdcClient);
      await orchestrator.initialize();
    });

    it('should execute DDC store action with DagNode', async () => {
      const mockDagNode = {
        dataBuffer: new Uint8Array(),
        links: [],
        tags: [],
        size: 0,
        data: mockAction.payload.data,
      };
      const { DagNode } = await import('@cere-ddc-sdk/ddc-client');
      jest.mocked(DagNode).mockReturnValue(mockDagNode as any);

      const result = await (orchestrator as any).executeDDCAction(mockAction);

      expect(DagNode).toHaveBeenCalledWith(mockAction.payload.data, []);
      expect(result.cid).toBe('0xabc123');
      expect(result.status).toBe('stored');
      expect(result.bucketId).toBe(BigInt(12345));
    });

    it('should execute DDC store action with File', async () => {
      const fileAction = {
        ...mockAction,
        payload: { data: new Uint8Array([1, 2, 3]) },
      };

      const mockFile = {
        body: fileAction.payload.data,
        size: fileAction.payload.data.length,
        meta: {},
      };
      const { File } = await import('@cere-ddc-sdk/ddc-client');
      jest.mocked(File).mockReturnValue(mockFile as any);

      const result = await (orchestrator as any).executeDDCAction(fileAction);

      expect(File).toHaveBeenCalledWith(fileAction.payload.data, {});
      expect(result.cid).toBe('0xabc123');
      expect(result.status).toBe('stored');
    });

    it('should throw error for batch storage (not implemented)', async () => {
      const batchAction = { ...mockAction, method: 'storeBatch' };

      await expect((orchestrator as any).executeDDCAction(batchAction)).rejects.toThrow(
        'Batch storage not yet implemented',
      );
    });
  });

  describe('executeActivityAction', () => {
    const mockAction: Action = {
      target: 'activity-sdk',
      method: 'sendEvent',
      payload: { type: 'test_event', data: { test: true } },
      options: { writeToDataCloud: true },
      priority: 'normal',
    };

    it('should return skipped response when Activity SDK not available', async () => {
      // Initialize without Activity SDK
      const mockDdcClient = { store: jest.fn(), disconnect: jest.fn() };
      const { DdcClient } = await import('@cere-ddc-sdk/ddc-client');
      (DdcClient.create as jest.Mock) = jest.fn().mockResolvedValue(mockDdcClient);

      const configWithoutActivity = { ...mockConfig };
      delete configWithoutActivity.activityConfig;
      const orchestratorNoActivity = new Orchestrator(configWithoutActivity, mockLogger);
      await orchestratorNoActivity.initialize();

      const result = await (orchestratorNoActivity as any).executeActivityAction(mockAction);

      expect(result.status).toBe('skipped');
      expect(result.reason).toBe('Activity SDK not initialized');
    });

    it('should execute Activity SDK action successfully', async () => {
      const mockEventDispatcher = {
        dispatchEvent: jest.fn().mockResolvedValue(true),
      };
      const mockActivityEvent = {
        id: 'evt_123',
        time: new Date(),
        payload: { test: true },
      };

      // Mock initialization
      const { EventDispatcher } = await import('@cere-activity-sdk/events');
      const { UriSigner } = await import('@cere-activity-sdk/signers');
      const { NoOpCipher } = await import('@cere-activity-sdk/ciphers');
      const { ActivityEvent } = await import('@cere-activity-sdk/events');

      jest.mocked(EventDispatcher).mockReturnValue(mockEventDispatcher as any);
      jest.mocked(UriSigner).mockReturnValue({} as any);
      jest.mocked(NoOpCipher).mockReturnValue({} as any);
      jest.mocked(ActivityEvent).mockReturnValue(mockActivityEvent as any);

      await orchestrator.initialize();

      const result = await (orchestrator as any).executeActivityAction(mockAction);

      expect(ActivityEvent).toHaveBeenCalledWith('test_event', { test: true }, { time: expect.any(Date) });
      expect(mockEventDispatcher.dispatchEvent).toHaveBeenCalledWith(mockActivityEvent);
      expect(result.status).toBe('sent');
      expect(result.eventId).toBe('evt_123');
    });

    it('should fallback to DDC when Activity SDK fails and writeToDataCloud is true', async () => {
      // First initialize DDC client so fallback can work
      const mockDdcClient = {
        store: jest.fn().mockResolvedValue('0xfallback123'),
        disconnect: jest.fn(),
      } as any;
      const { DdcClient } = await import('@cere-ddc-sdk/ddc-client');
      jest.mocked(DdcClient.create).mockResolvedValue(mockDdcClient);

      const mockEventDispatcher = {
        dispatchEvent: jest.fn().mockRejectedValue(new Error('Activity failed')),
      };

      const { EventDispatcher } = await import('@cere-activity-sdk/events');
      jest.mocked(EventDispatcher).mockReturnValue(mockEventDispatcher as any);

      await orchestrator.initialize();

      const result = await (orchestrator as any).executeActivityAction(mockAction);

      expect(result.status).toBe('fallback_to_ddc');
      expect(result.originalError).toBe('Activity failed');
      expect(result.ddcResult).toBeDefined();
    });
  });

  describe('cleanup', () => {
    it('should cleanup DDC client', async () => {
      const mockDdcClient = {
        store: jest.fn(),
        disconnect: jest.fn(),
      };
      const { DdcClient } = await import('@cere-ddc-sdk/ddc-client');
      (DdcClient.create as jest.Mock) = jest.fn().mockResolvedValue(mockDdcClient);

      await orchestrator.initialize();
      await orchestrator.cleanup();

      expect(mockDdcClient.disconnect).toHaveBeenCalled();
    });
  });
});
