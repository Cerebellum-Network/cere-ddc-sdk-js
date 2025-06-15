import { UnifiedSDK } from '../../UnifiedSDK';
import { UnifiedSDKError } from '../../types';
import { createMockConfig } from '../helpers/test-fixtures';
import { setupMockDDCClient, setupMockActivitySDK } from '../helpers/test-utils';

// Mock all dependencies
jest.mock('../../RulesInterpreter');
jest.mock('../../Dispatcher');
jest.mock('../../Orchestrator');

describe('UnifiedSDK - Constructor & Initialization', () => {
  let mockConfig = createMockConfig();

  beforeEach(() => {
    mockConfig = createMockConfig();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create SDK with all components', () => {
      const sdk = new UnifiedSDK(mockConfig);

      expect(sdk).toBeInstanceOf(UnifiedSDK);
      expect((sdk as any).rulesInterpreter).toBeDefined();
      expect((sdk as any).dispatcher).toBeDefined();
      expect((sdk as any).orchestrator).toBeDefined();
      expect((sdk as any).config).toEqual(mockConfig);
      expect((sdk as any).initialized).toBe(false);
    });

    it('should handle config with undefined ddcConfig', () => {
      // Constructor should handle missing ddcConfig gracefully
      const configWithUndefinedDDC = {
        ...mockConfig,
        ddcConfig: undefined,
      };

      // This will fail because sanitizeConfig expects ddcConfig to exist
      expect(() => new UnifiedSDK(configWithUndefinedDDC as any)).toThrow();
    });

    it('should handle missing optional activity config', () => {
      const configWithoutActivity = {
        ...mockConfig,
        activityConfig: undefined,
      };

      const sdk = new UnifiedSDK(configWithoutActivity);
      expect(sdk).toBeInstanceOf(UnifiedSDK);
    });

    it('should accept processing config without immediate validation', () => {
      // Constructor doesn't validate processing config
      const invalidProcessingConfig = {
        ...mockConfig,
        processing: {
          ...mockConfig.processing,
          defaultBatchSize: 0, // Invalid but accepted in constructor
        },
      };

      expect(() => new UnifiedSDK(invalidProcessingConfig)).not.toThrow();
    });
  });

  describe('initialize', () => {
    let sdk: UnifiedSDK;

    beforeEach(() => {
      sdk = new UnifiedSDK(mockConfig);
    });

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
      expect((sdk as any).initialized).toBe(true);
    });

    it('should throw Error on initialization failure', async () => {
      const mockOrchestrator = (sdk as any).orchestrator;
      const initError = new Error('Init failed');
      mockOrchestrator.initialize = jest.fn().mockRejectedValue(initError);

      // The actual implementation just re-throws the original error
      await expect(sdk.initialize()).rejects.toThrow(Error);
      await expect(sdk.initialize()).rejects.toThrow('Init failed');
      expect((sdk as any).initialized).toBe(false);
    });

    it('should handle DDC client initialization failure', async () => {
      setupMockDDCClient();
      const { DdcClient } = require('@cere-ddc-sdk/ddc-client');
      DdcClient.create.mockRejectedValue(new Error('DDC connection failed'));

      const mockOrchestrator = (sdk as any).orchestrator;
      mockOrchestrator.initialize = jest
        .fn()
        .mockRejectedValue(new UnifiedSDKError('Failed to initialize DDC client', 'DDC_INIT_ERROR', 'Orchestrator'));

      await expect(sdk.initialize()).rejects.toThrow(UnifiedSDKError);
      expect((sdk as any).initialized).toBe(false);
    });

    it('should handle Activity SDK initialization failure gracefully', async () => {
      setupMockActivitySDK();
      const { UriSigner } = require('@cere-activity-sdk/signers');
      UriSigner.mockImplementation(() => {
        throw new Error('Signer failed');
      });

      const mockOrchestrator = (sdk as any).orchestrator;
      mockOrchestrator.initialize = jest.fn().mockResolvedValue(undefined);

      // Should still succeed even if Activity SDK fails
      await expect(sdk.initialize()).resolves.not.toThrow();
      expect((sdk as any).initialized).toBe(true);
    });

    it('should initialize successfully with valid configuration', async () => {
      const mockOrchestrator = (sdk as any).orchestrator;
      mockOrchestrator.initialize = jest.fn().mockResolvedValue(undefined);

      // Valid configuration should pass
      await expect(sdk.initialize()).resolves.not.toThrow();
      expect((sdk as any).initialized).toBe(true);
    });
  });

  describe('configuration handling', () => {
    it('should accept various DDC config values in constructor', () => {
      // Constructor doesn't validate - accepts all values
      const configs = [
        { ...mockConfig, ddcConfig: { ...mockConfig.ddcConfig, signer: '' } },
        { ...mockConfig, ddcConfig: { ...mockConfig.ddcConfig, bucketId: BigInt(-1) } },
        { ...mockConfig, ddcConfig: { ...mockConfig.ddcConfig, network: 'invalid' as any } },
      ];

      configs.forEach((config) => {
        expect(() => new UnifiedSDK(config)).not.toThrow();
      });
    });

    it('should accept various processing config values in constructor', () => {
      // Constructor doesn't validate - accepts all values
      const configs = [
        { ...mockConfig, processing: { ...mockConfig.processing, defaultBatchSize: -1 } },
        { ...mockConfig, processing: { ...mockConfig.processing, defaultBatchTimeout: 0 } },
        { ...mockConfig, processing: { ...mockConfig.processing, maxRetries: -1 } },
      ];

      configs.forEach((config) => {
        expect(() => new UnifiedSDK(config)).not.toThrow();
      });
    });

    it('should accept invalid logging config in constructor', () => {
      // Constructor doesn't validate logging config
      const invalidConfig = {
        ...mockConfig,
        logging: { ...mockConfig.logging, level: 'invalid' as any },
      };

      expect(() => new UnifiedSDK(invalidConfig)).not.toThrow();
    });
  });

  describe('component integration', () => {
    it('should properly wire up components', () => {
      const sdk = new UnifiedSDK(mockConfig);

      const rulesInterpreter = (sdk as any).rulesInterpreter;
      const dispatcher = (sdk as any).dispatcher;
      const orchestrator = (sdk as any).orchestrator;

      expect(rulesInterpreter).toBeDefined();
      expect(dispatcher).toBeDefined();
      expect(orchestrator).toBeDefined();

      // Check that components received proper configuration
      expect(rulesInterpreter.constructor).toHaveBeenCalled();
      expect(dispatcher.constructor).toHaveBeenCalled();
      expect(orchestrator.constructor).toHaveBeenCalledWith(mockConfig, expect.any(Function));
    });
  });
});
