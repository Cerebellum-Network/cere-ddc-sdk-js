import { RulesInterpreter } from '../../RulesInterpreter';
import { ValidationError } from '../../types';
import { createMockMetadata } from '../helpers/test-fixtures';

describe('RulesInterpreter', () => {
  let interpreter: RulesInterpreter;

  beforeEach(() => {
    interpreter = new RulesInterpreter();
  });

  describe('validateMetadata', () => {
    it('should validate correct metadata', () => {
      const metadata = createMockMetadata({
        processing: { dataCloudWriteMode: 'viaIndex', indexWriteMode: 'realtime' },
      });

      const result = interpreter.validateMetadata(metadata);
      expect(result).toEqual(metadata);
    });

    it('should throw ValidationError for invalid metadata', () => {
      const metadata = createMockMetadata({
        processing: { dataCloudWriteMode: 'skip', indexWriteMode: 'skip' }, // Both skip - invalid
      });

      expect(() => interpreter.validateMetadata(metadata)).toThrow(ValidationError);
    });

    it('should throw ValidationError for missing required fields', () => {
      const metadata = {
        processing: {
          dataCloudWriteMode: 'viaIndex',
          // Missing indexWriteMode
        },
      };

      expect(() => interpreter.validateMetadata(metadata)).toThrow(ValidationError);
    });

    it('should validate complex metadata with all fields', () => {
      const metadata = createMockMetadata({
        processing: {
          dataCloudWriteMode: 'batch',
          indexWriteMode: 'realtime',
          priority: 'high',
          encryption: true,
          ttl: 3600,
          batchOptions: { maxSize: 500, maxWaitTime: 3000 },
        },
        userContext: { source: 'telegram', userId: 'user123', chatId: 'chat456' },
        traceId: 'trace_xyz789',
      });

      const result = interpreter.validateMetadata(metadata);
      expect(result.processing.priority).toBe('high');
      expect(result.processing.encryption).toBe(true);
      expect(result.processing.batchOptions?.maxSize).toBe(500);
      expect(result.userContext?.source).toBe('telegram');
    });
  });

  describe('extractProcessingRules', () => {
    it('should extract rules for viaIndex + realtime', () => {
      const metadata = createMockMetadata({
        processing: {
          dataCloudWriteMode: 'viaIndex',
          indexWriteMode: 'realtime',
          priority: 'high',
          encryption: true,
        },
      });

      const validatedMetadata = interpreter.validateMetadata(metadata);
      const rules = interpreter.extractProcessingRules(validatedMetadata);

      expect(rules).toEqual({
        dataCloudAction: 'write_via_index',
        indexAction: 'write_realtime',
        batchingRequired: false,
        additionalParams: {
          priority: 'high',
          ttl: undefined,
          encryption: true,
          batchOptions: undefined,
        },
      });
    });

    it('should extract rules for batch mode', () => {
      const metadata = createMockMetadata({
        processing: {
          dataCloudWriteMode: 'batch',
          indexWriteMode: 'realtime',
          batchOptions: { maxSize: 500, maxWaitTime: 3000 },
        },
      });

      const validatedMetadata = interpreter.validateMetadata(metadata);
      const rules = interpreter.extractProcessingRules(validatedMetadata);

      expect(rules.dataCloudAction).toBe('write_batch');
      expect(rules.batchingRequired).toBe(true);
      expect(rules.additionalParams.batchOptions).toEqual({
        maxSize: 500,
        maxWaitTime: 3000,
      });
    });

    it('should extract rules for direct write with skip index', () => {
      const metadata = createMockMetadata({
        processing: {
          dataCloudWriteMode: 'direct',
          indexWriteMode: 'skip',
          encryption: false,
        },
      });

      const validatedMetadata = interpreter.validateMetadata(metadata);
      const rules = interpreter.extractProcessingRules(validatedMetadata);

      expect(rules).toEqual({
        dataCloudAction: 'write_direct',
        indexAction: 'skip',
        batchingRequired: false,
        additionalParams: {
          priority: 'normal', // Default value
          ttl: undefined,
          encryption: false,
          batchOptions: undefined,
        },
      });
    });

    it('should apply default values', () => {
      const metadata = createMockMetadata({
        processing: { dataCloudWriteMode: 'direct', indexWriteMode: 'realtime' },
      });

      const validatedMetadata = interpreter.validateMetadata(metadata);
      const rules = interpreter.extractProcessingRules(validatedMetadata);

      expect(rules.additionalParams.priority).toBe('normal');
      expect(rules.additionalParams.encryption).toBe(false);
      expect(rules.additionalParams.ttl).toBeUndefined();
      expect(rules.additionalParams.batchOptions).toBeUndefined();
    });

    it('should handle TTL settings', () => {
      const metadata = createMockMetadata({
        processing: {
          dataCloudWriteMode: 'direct',
          indexWriteMode: 'realtime',
          ttl: 7200,
        },
      });

      const validatedMetadata = interpreter.validateMetadata(metadata);
      const rules = interpreter.extractProcessingRules(validatedMetadata);

      expect(rules.additionalParams.ttl).toBe(7200);
    });
  });

  describe('optimizeProcessingRules', () => {
    it('should optimize batch size for large payloads', () => {
      const rules = {
        dataCloudAction: 'write_batch' as const,
        indexAction: 'write_realtime' as const,
        batchingRequired: true,
        additionalParams: {
          priority: 'normal' as const,
          encryption: false,
          batchOptions: { maxSize: 1000, maxWaitTime: 5000 },
        },
      };

      const context = { payloadSize: 2 * 1024 * 1024 }; // 2MB

      const optimizedRules = interpreter.optimizeProcessingRules(rules, context);

      expect(optimizedRules.additionalParams.batchOptions?.maxSize).toBeLessThan(1000);
    });

    it('should not modify rules when no optimization needed', () => {
      const rules = {
        dataCloudAction: 'write_direct' as const,
        indexAction: 'write_realtime' as const,
        batchingRequired: false,
        additionalParams: {
          priority: 'normal' as const,
          encryption: false,
        },
      };

      const context = { payloadSize: 1024 }; // 1KB

      const optimizedRules = interpreter.optimizeProcessingRules(rules, context);

      expect(optimizedRules).toEqual(rules);
    });

    it('should adjust timeout for high priority operations', () => {
      const rules = {
        dataCloudAction: 'write_batch' as const,
        indexAction: 'write_realtime' as const,
        batchingRequired: true,
        additionalParams: {
          priority: 'high' as const,
          encryption: false,
          batchOptions: { maxSize: 100, maxWaitTime: 5000 },
        },
      };

      const context = { payloadSize: 1024 };

      const optimizedRules = interpreter.optimizeProcessingRules(rules, context);

      // High priority should reduce wait time
      expect(optimizedRules.additionalParams.batchOptions?.maxWaitTime).toBeLessThan(5000);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle missing optional fields gracefully', () => {
      const metadata = createMockMetadata({
        processing: { dataCloudWriteMode: 'direct', indexWriteMode: 'realtime' },
        userContext: undefined,
        traceId: undefined,
      });

      const validatedMetadata = interpreter.validateMetadata(metadata);
      const rules = interpreter.extractProcessingRules(validatedMetadata);

      expect(rules.dataCloudAction).toBe('write_direct');
      expect(rules.additionalParams.priority).toBe('normal');
    });

    it('should validate against schema constraints', () => {
      const invalidMetadata = {
        processing: {
          dataCloudWriteMode: 'invalid_mode',
          indexWriteMode: 'realtime',
        },
      };

      expect(() => interpreter.validateMetadata(invalidMetadata)).toThrow(ValidationError);
    });

    it('should handle zero and negative values appropriately', () => {
      const metadata = {
        processing: {
          dataCloudWriteMode: 'batch',
          indexWriteMode: 'realtime',
          batchOptions: { maxSize: 0, maxWaitTime: -1000 },
        },
      };

      expect(() => interpreter.validateMetadata(metadata)).toThrow(ValidationError);
    });
  });
});
