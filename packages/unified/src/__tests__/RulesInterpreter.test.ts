import { RulesInterpreter } from '../RulesInterpreter';
import { ValidationError } from '../types';

describe('RulesInterpreter', () => {
  let interpreter: RulesInterpreter;

  beforeEach(() => {
    interpreter = new RulesInterpreter();
  });

  describe('validateMetadata', () => {
    it('should validate correct metadata', () => {
      const metadata = {
        processing: {
          dataCloudWriteMode: 'viaIndex',
          indexWriteMode: 'realtime',
        },
      };

      const result = interpreter.validateMetadata(metadata);
      expect(result).toEqual(metadata);
    });

    it('should throw ValidationError for invalid metadata', () => {
      const metadata = {
        processing: {
          dataCloudWriteMode: 'skip',
          indexWriteMode: 'skip', // Both skip - invalid
        },
      };

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
  });

  describe('extractProcessingRules', () => {
    it('should extract rules for viaIndex + realtime', () => {
      const metadata = {
        processing: {
          dataCloudWriteMode: 'viaIndex',
          indexWriteMode: 'realtime',
          priority: 'high',
          encryption: true,
        },
      };

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
      const metadata = {
        processing: {
          dataCloudWriteMode: 'batch',
          indexWriteMode: 'realtime',
          batchOptions: {
            maxSize: 500,
            maxWaitTime: 3000,
          },
        },
      };

      const validatedMetadata = interpreter.validateMetadata(metadata);
      const rules = interpreter.extractProcessingRules(validatedMetadata);

      expect(rules.dataCloudAction).toBe('write_batch');
      expect(rules.batchingRequired).toBe(true);
      expect(rules.additionalParams.batchOptions).toEqual({
        maxSize: 500,
        maxWaitTime: 3000,
      });
    });

    it('should apply default values', () => {
      const metadata = {
        processing: {
          dataCloudWriteMode: 'direct',
          indexWriteMode: 'realtime',
        },
      };

      const validatedMetadata = interpreter.validateMetadata(metadata);
      const rules = interpreter.extractProcessingRules(validatedMetadata);

      expect(rules.additionalParams.priority).toBe('normal');
      expect(rules.additionalParams.encryption).toBe(false);
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
          batchOptions: {
            maxSize: 1000,
            maxWaitTime: 5000,
          },
        },
      };

      const context = {
        payloadSize: 2 * 1024 * 1024, // 2MB
      };

      const optimizedRules = interpreter.optimizeProcessingRules(rules, context);

      expect(optimizedRules.additionalParams.batchOptions?.maxSize).toBeLessThan(1000);
    });
  });
});
