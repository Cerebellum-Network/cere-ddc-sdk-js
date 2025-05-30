import {
  DataCloudWriteModeSchema,
  IndexWriteModeSchema,
  ProcessingMetadataSchema,
  MetadataSchema,
  UnifiedSDKError,
  ValidationError,
} from '../types';
import { z } from 'zod';

describe('Types and Schemas', () => {
  describe('DataCloudWriteModeSchema', () => {
    it('should validate correct write modes', () => {
      expect(DataCloudWriteModeSchema.parse('direct')).toBe('direct');
      expect(DataCloudWriteModeSchema.parse('batch')).toBe('batch');
      expect(DataCloudWriteModeSchema.parse('viaIndex')).toBe('viaIndex');
      expect(DataCloudWriteModeSchema.parse('skip')).toBe('skip');
    });

    it('should reject invalid write modes', () => {
      expect(() => DataCloudWriteModeSchema.parse('invalid')).toThrow();
      expect(() => DataCloudWriteModeSchema.parse('')).toThrow();
      expect(() => DataCloudWriteModeSchema.parse(123)).toThrow();
    });
  });

  describe('IndexWriteModeSchema', () => {
    it('should validate correct index modes', () => {
      expect(IndexWriteModeSchema.parse('realtime')).toBe('realtime');
      expect(IndexWriteModeSchema.parse('skip')).toBe('skip');
    });

    it('should reject invalid index modes', () => {
      expect(() => IndexWriteModeSchema.parse('invalid')).toThrow();
      expect(() => IndexWriteModeSchema.parse('batch')).toThrow();
      expect(() => IndexWriteModeSchema.parse(null)).toThrow();
    });
  });

  describe('ProcessingMetadataSchema', () => {
    it('should validate minimal valid metadata', () => {
      const metadata = {
        dataCloudWriteMode: 'direct',
        indexWriteMode: 'realtime',
      };

      const result = ProcessingMetadataSchema.parse(metadata);
      expect(result.dataCloudWriteMode).toBe('direct');
      expect(result.indexWriteMode).toBe('realtime');
    });

    it('should validate metadata with all optional fields', () => {
      const metadata = {
        dataCloudWriteMode: 'batch',
        indexWriteMode: 'realtime',
        priority: 'high',
        ttl: 3600,
        encryption: true,
        batchOptions: {
          maxSize: 100,
          maxWaitTime: 5000,
        },
      };

      const result = ProcessingMetadataSchema.parse(metadata);
      expect(result.priority).toBe('high');
      expect(result.ttl).toBe(3600);
      expect(result.encryption).toBe(true);
      expect(result.batchOptions?.maxSize).toBe(100);
    });

    it('should reject both skip modes', () => {
      const metadata = {
        dataCloudWriteMode: 'skip',
        indexWriteMode: 'skip',
      };

      expect(() => ProcessingMetadataSchema.parse(metadata)).toThrow(
        /Both dataCloudWriteMode and indexWriteMode cannot be 'skip'/,
      );
    });

    it('should reject invalid priority values', () => {
      const metadata = {
        dataCloudWriteMode: 'direct',
        indexWriteMode: 'realtime',
        priority: 'invalid',
      };

      expect(() => ProcessingMetadataSchema.parse(metadata)).toThrow();
    });

    it('should reject negative TTL', () => {
      const metadata = {
        dataCloudWriteMode: 'direct',
        indexWriteMode: 'realtime',
        ttl: -100,
      };

      expect(() => ProcessingMetadataSchema.parse(metadata)).toThrow();
    });

    it('should reject invalid batch options', () => {
      const metadata = {
        dataCloudWriteMode: 'batch',
        indexWriteMode: 'realtime',
        batchOptions: {
          maxSize: 0, // Invalid - must be >= 1
          maxWaitTime: -1000, // Invalid - must be >= 0
        },
      };

      expect(() => ProcessingMetadataSchema.parse(metadata)).toThrow();
    });
  });

  describe('MetadataSchema', () => {
    it('should validate complete metadata', () => {
      const metadata = {
        processing: {
          dataCloudWriteMode: 'viaIndex',
          indexWriteMode: 'realtime',
          priority: 'normal',
        },
        userContext: {
          source: 'telegram',
          userId: 'user123',
        },
        traceId: 'trace_abc123',
      };

      const result = MetadataSchema.parse(metadata);
      expect(result.processing.dataCloudWriteMode).toBe('viaIndex');
      expect(result.userContext?.source).toBe('telegram');
      expect(result.traceId).toBe('trace_abc123');
    });

    it('should validate metadata with minimal processing only', () => {
      const metadata = {
        processing: {
          dataCloudWriteMode: 'direct',
          indexWriteMode: 'realtime',
        },
      };

      const result = MetadataSchema.parse(metadata);
      expect(result.processing).toBeDefined();
      expect(result.userContext).toBeUndefined();
      expect(result.traceId).toBeUndefined();
    });

    it('should allow arbitrary user context data', () => {
      const metadata = {
        processing: {
          dataCloudWriteMode: 'direct',
          indexWriteMode: 'realtime',
        },
        userContext: {
          customField: 'value',
          nestedObject: { deep: true },
          array: [1, 2, 3],
        },
      };

      const result = MetadataSchema.parse(metadata);
      expect(result.userContext?.customField).toBe('value');
      expect(result.userContext?.nestedObject.deep).toBe(true);
      expect(result.userContext?.array).toEqual([1, 2, 3]);
    });
  });

  describe('UnifiedSDKError', () => {
    it('should create error with all properties', () => {
      const originalError = new Error('Original');
      const error = new UnifiedSDKError('Test error', 'TEST_CODE', 'TestComponent', true, originalError);

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.component).toBe('TestComponent');
      expect(error.recoverable).toBe(true);
      expect(error.originalError).toBe(originalError);
      expect(error.name).toBe('UnifiedSDKError');
    });

    it('should create error with minimal properties', () => {
      const error = new UnifiedSDKError('Simple error', 'SIMPLE_CODE', 'SimpleComponent');

      expect(error.message).toBe('Simple error');
      expect(error.code).toBe('SIMPLE_CODE');
      expect(error.component).toBe('SimpleComponent');
      expect(error.recoverable).toBe(false); // Default
      expect(error.originalError).toBeUndefined();
    });

    it('should be instance of Error', () => {
      const error = new UnifiedSDKError('Test', 'CODE', 'Component');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(UnifiedSDKError);
    });
  });

  describe('ValidationError', () => {
    it('should create validation error with ZodError', () => {
      const zodError = new z.ZodError([
        {
          code: z.ZodIssueCode.invalid_type,
          expected: 'string',
          received: 'number',
          path: ['field'],
          message: 'Expected string, received number',
        },
      ]);

      const error = new ValidationError('Validation failed', zodError);

      expect(error.message).toBe('Validation failed');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.component).toBe('RulesInterpreter');
      expect(error.recoverable).toBe(false);
      expect(error.validationErrors).toBe(zodError);
      expect(error).toBeInstanceOf(UnifiedSDKError);
    });

    it('should contain validation details', () => {
      const zodError = new z.ZodError([
        {
          code: z.ZodIssueCode.too_small,
          minimum: 1,
          type: 'number',
          inclusive: true,
          exact: false,
          path: ['ttl'],
          message: 'Number must be greater than or equal to 1',
        },
      ]);

      const error = new ValidationError('TTL validation failed', zodError);

      expect(error.validationErrors.errors).toHaveLength(1);
      expect(error.validationErrors.errors[0].path).toEqual(['ttl']);
      expect(error.validationErrors.errors[0].message).toContain('must be greater than');
    });
  });

  describe('TelegramEventData type', () => {
    // This tests TypeScript compilation, not runtime validation
    it('should compile with valid Telegram event types', () => {
      // These should compile without TypeScript errors
      const questEvent = {
        eventType: 'quest_completed' as const,
        userId: 'user123',
        chatId: 'chat456',
        eventData: { questId: 'daily', points: 100 },
        timestamp: new Date(),
      };

      const userAction = {
        eventType: 'user_action' as const,
        userId: 'user456',
        eventData: { action: 'click', buttonId: 'btn1' },
        timestamp: new Date(),
      };

      const miniAppEvent = {
        eventType: 'mini_app_interaction' as const,
        userId: 'user789',
        chatId: 'chat123',
        eventData: { interaction: 'navigation', screen: 'game' },
        timestamp: new Date(),
      };

      expect(questEvent.eventType).toBe('quest_completed');
      expect(userAction.eventType).toBe('user_action');
      expect(miniAppEvent.eventType).toBe('mini_app_interaction');
    });
  });

  describe('TelegramMessageData type', () => {
    it('should compile with valid message types', () => {
      const textMessage = {
        messageId: 'msg1',
        chatId: 'chat1',
        userId: 'user1',
        messageText: 'Hello',
        messageType: 'text' as const,
        timestamp: new Date(),
      };

      const photoMessage = {
        messageId: 'msg2',
        chatId: 'chat2',
        userId: 'user2',
        messageType: 'photo' as const,
        timestamp: new Date(),
        metadata: { caption: 'A nice photo' },
      };

      expect(textMessage.messageType).toBe('text');
      expect(photoMessage.messageType).toBe('photo');
      expect(photoMessage.metadata?.caption).toBe('A nice photo');
    });
  });
});
