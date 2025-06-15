import {
  DataCloudWriteModeSchema,
  IndexWriteModeSchema,
  ProcessingMetadataSchema,
  MetadataSchema,
  UnifiedSDKError,
  ValidationError,
  TelegramEventData,
  TelegramMessageData,
  BullishCampaignEvent,
} from '../../types';
import { z } from 'zod';
import {
  createMockMetadata,
  createMockProcessingMetadata,
  mockTelegramEvent,
  mockTelegramMessage,
  mockBullishEvent,
} from '../helpers/test-fixtures';

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
      expect(() => DataCloudWriteModeSchema.parse(null)).toThrow();
      expect(() => DataCloudWriteModeSchema.parse(undefined)).toThrow();
    });

    it('should provide clear error messages for invalid modes', () => {
      try {
        DataCloudWriteModeSchema.parse('wrongmode');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
      }
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
      expect(() => IndexWriteModeSchema.parse('')).toThrow();
    });

    it('should be case sensitive', () => {
      expect(() => IndexWriteModeSchema.parse('Realtime')).toThrow();
      expect(() => IndexWriteModeSchema.parse('SKIP')).toThrow();
    });
  });

  describe('ProcessingMetadataSchema', () => {
    it('should validate minimal valid metadata', () => {
      const metadata = createMockProcessingMetadata({
        dataCloudWriteMode: 'direct',
        indexWriteMode: 'realtime',
      });

      const result = ProcessingMetadataSchema.parse(metadata);
      expect(result.dataCloudWriteMode).toBe('direct');
      expect(result.indexWriteMode).toBe('realtime');
    });

    it('should validate metadata with all optional fields', () => {
      const metadata = createMockProcessingMetadata({
        dataCloudWriteMode: 'batch',
        indexWriteMode: 'realtime',
        priority: 'high',
        ttl: 3600,
        encryption: true,
        batchOptions: {
          maxSize: 100,
          maxWaitTime: 5000,
        },
      });

      const result = ProcessingMetadataSchema.parse(metadata);
      expect(result.priority).toBe('high');
      expect(result.ttl).toBe(3600);
      expect(result.encryption).toBe(true);
      expect(result.batchOptions?.maxSize).toBe(100);
      expect(result.batchOptions?.maxWaitTime).toBe(5000);
    });

    it('should reject both skip modes', () => {
      const metadata = createMockProcessingMetadata({
        dataCloudWriteMode: 'skip',
        indexWriteMode: 'skip',
      });

      expect(() => ProcessingMetadataSchema.parse(metadata)).toThrow(
        /Both dataCloudWriteMode and indexWriteMode cannot be 'skip'/,
      );
    });

    it('should reject invalid priority values', () => {
      const metadata = createMockProcessingMetadata({
        dataCloudWriteMode: 'direct',
        indexWriteMode: 'realtime',
        priority: 'invalid' as any,
      });

      expect(() => ProcessingMetadataSchema.parse(metadata)).toThrow();
    });

    it('should reject negative TTL', () => {
      const metadata = createMockProcessingMetadata({
        dataCloudWriteMode: 'direct',
        indexWriteMode: 'realtime',
        ttl: -100,
      });

      expect(() => ProcessingMetadataSchema.parse(metadata)).toThrow();
    });

    it('should reject invalid batch options', () => {
      const metadata = createMockProcessingMetadata({
        dataCloudWriteMode: 'batch',
        indexWriteMode: 'realtime',
        batchOptions: {
          maxSize: 0, // Invalid - must be >= 1
          maxWaitTime: -1000, // Invalid - must be >= 0
        },
      });

      expect(() => ProcessingMetadataSchema.parse(metadata)).toThrow();
    });

    it('should validate priority enum values', () => {
      const validPriorities = ['low', 'normal', 'high'];

      validPriorities.forEach((priority) => {
        const metadata = createMockProcessingMetadata({
          dataCloudWriteMode: 'direct',
          indexWriteMode: 'realtime',
          priority: priority as any,
        });

        expect(() => ProcessingMetadataSchema.parse(metadata)).not.toThrow();
      });
    });

    it('should handle edge case TTL values', () => {
      const metadata1 = createMockProcessingMetadata({
        dataCloudWriteMode: 'direct',
        indexWriteMode: 'realtime',
        ttl: 0, // Zero should be valid
      });

      const metadata2 = createMockProcessingMetadata({
        dataCloudWriteMode: 'direct',
        indexWriteMode: 'realtime',
        ttl: Number.MAX_SAFE_INTEGER, // Very large number
      });

      expect(() => ProcessingMetadataSchema.parse(metadata1)).not.toThrow();
      expect(() => ProcessingMetadataSchema.parse(metadata2)).not.toThrow();
    });
  });

  describe('MetadataSchema', () => {
    it('should validate complete metadata', () => {
      const metadata = createMockMetadata({
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
      });

      const result = MetadataSchema.parse(metadata);
      expect(result.processing.dataCloudWriteMode).toBe('viaIndex');
      expect(result.userContext?.source).toBe('telegram');
      expect(result.traceId).toBe('trace_abc123');
    });

    it('should validate metadata with minimal processing only', () => {
      const metadata = createMockMetadata({
        processing: {
          dataCloudWriteMode: 'direct',
          indexWriteMode: 'realtime',
        },
        userContext: undefined,
        traceId: undefined,
      });

      const result = MetadataSchema.parse(metadata);
      expect(result.processing).toBeDefined();
      expect(result.userContext).toBeUndefined();
      expect(result.traceId).toBeUndefined();
    });

    it('should allow arbitrary user context data', () => {
      const metadata = createMockMetadata({
        processing: {
          dataCloudWriteMode: 'direct',
          indexWriteMode: 'realtime',
        },
        userContext: {
          customField: 'value',
          nestedObject: { deep: true },
          array: [1, 2, 3],
          source: 'custom',
          userId: 'user456',
        },
      });

      const result = MetadataSchema.parse(metadata);
      expect(result.userContext?.customField).toBe('value');
      expect((result.userContext as any)?.nestedObject.deep).toBe(true);
      expect((result.userContext as any)?.array).toEqual([1, 2, 3]);
    });

    it('should validate nested processing metadata constraints', () => {
      const invalidMetadata = {
        processing: {
          dataCloudWriteMode: 'skip',
          indexWriteMode: 'skip', // Both skip - should fail
        },
      };

      expect(() => MetadataSchema.parse(invalidMetadata)).toThrow();
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

    it('should preserve stack trace', () => {
      const error = new UnifiedSDKError('Test', 'CODE', 'Component');
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('UnifiedSDKError');
    });

    it('should handle nested errors correctly', () => {
      const originalError = new Error('Original error');
      originalError.stack = 'Original stack trace';

      const wrappedError = new UnifiedSDKError('Wrapped error', 'WRAP_CODE', 'WrapComponent', true, originalError);

      expect(wrappedError.originalError).toBe(originalError);
      expect(wrappedError.originalError?.message).toBe('Original error');
      expect(wrappedError.originalError?.stack).toBe('Original stack trace');
    });
  });

  describe('ValidationError', () => {
    it('should create validation error with ZodError', () => {
      try {
        ProcessingMetadataSchema.parse({ invalid: 'data' });
      } catch (zodError) {
        const validationError = new ValidationError('Validation failed', zodError as z.ZodError);

        expect(validationError.message).toBe('Validation failed');
        expect(validationError.code).toBe('VALIDATION_ERROR');
        expect(validationError.component).toBe('Schema');
        expect(validationError.validationErrors).toBe(zodError);
        expect(validationError).toBeInstanceOf(UnifiedSDKError);
      }
    });

    it('should contain validation details', () => {
      try {
        const invalidData = {
          dataCloudWriteMode: 'invalid',
          indexWriteMode: 'also_invalid',
          priority: 'wrong_priority',
          ttl: -1,
        };
        ProcessingMetadataSchema.parse(invalidData);
      } catch (zodError) {
        const validationError = new ValidationError('Multiple validation errors', zodError as z.ZodError);

        expect(validationError.validationErrors.errors.length).toBeGreaterThan(0);
        expect(validationError.validationErrors.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: expect.any(Array),
              message: expect.any(String),
            }),
          ]),
        );
      }
    });

    it('should provide useful error messages for debugging', () => {
      try {
        ProcessingMetadataSchema.parse({
          dataCloudWriteMode: 'skip',
          indexWriteMode: 'skip',
        });
      } catch (zodError) {
        const validationError = new ValidationError('Both modes cannot be skip', zodError as z.ZodError);

        expect(validationError.toString()).toContain('Validation failed');
        expect(validationError.toString()).toContain('Both modes cannot be skip');
      }
    });
  });

  describe('Event Type Definitions', () => {
    describe('TelegramEventData type', () => {
      it('should validate with test fixtures', () => {
        const eventData = mockTelegramEvent();

        // Type checking - these should compile without errors
        const typedEvent: TelegramEventData = eventData;
        expect(typedEvent.eventType).toBe('quest_completed');
        expect(typedEvent.userId).toBe('user123');
        expect(typedEvent.chatId).toBe('chat456');
        expect(typedEvent.eventData).toEqual({ questId: 'daily', points: 100 });
        expect(typedEvent.timestamp).toBeInstanceOf(Date);
      });

      it('should compile with valid Telegram event types', () => {
        const validEventTypes: TelegramEventData['eventType'][] = [
          'quest_completed',
          'user_action',
          'mini_app_interaction',
        ];

        validEventTypes.forEach((eventType) => {
          const event: TelegramEventData = {
            eventType,
            userId: 'user123',
            chatId: 'chat456',
            eventData: { test: 'data' },
            timestamp: new Date(),
          };

          expect(event.eventType).toBe(eventType);
        });
      });

      it('should handle optional chatId', () => {
        const eventWithoutChat: TelegramEventData = {
          eventType: 'user_action',
          userId: 'user123',
          eventData: { action: 'click' },
          timestamp: new Date(),
        };

        expect(eventWithoutChat.chatId).toBeUndefined();
      });
    });

    describe('TelegramMessageData type', () => {
      it('should validate with test fixtures', () => {
        const messageData = mockTelegramMessage();

        const typedMessage: TelegramMessageData = messageData;
        expect(typedMessage.messageId).toBe('msg_123');
        expect(typedMessage.userId).toBe('user123');
        expect(typedMessage.chatId).toBe('chat456');
        expect(typedMessage.messageText).toBe('Test message');
        expect(typedMessage.messageType).toBe('text');
        expect(typedMessage.timestamp).toBeInstanceOf(Date);
      });

      it('should compile with valid message types', () => {
        const validMessageTypes: TelegramMessageData['messageType'][] = [
          'text',
          'photo',
          'video',
          'document',
          'sticker',
        ];

        validMessageTypes.forEach((messageType) => {
          const message: TelegramMessageData = {
            messageId: 'msg_123',
            chatId: 'chat456',
            userId: 'user123',
            messageType,
            timestamp: new Date(),
          };

          expect(message.messageType).toBe(messageType);
        });
      });

      it('should handle optional messageText and metadata', () => {
        const minimalMessage: TelegramMessageData = {
          messageId: 'msg_123',
          chatId: 'chat456',
          userId: 'user123',
          messageType: 'photo',
          timestamp: new Date(),
        };

        expect(minimalMessage.messageText).toBeUndefined();
        expect(minimalMessage.metadata).toBeUndefined();
      });
    });

    describe('BullishCampaignEvent type', () => {
      it('should validate with test fixtures', () => {
        const campaignEvent = mockBullishEvent();

        const typedEvent: BullishCampaignEvent = campaignEvent;
        expect(typedEvent.eventType).toBe('SEGMENT_WATCHED');
        expect(typedEvent.accountId).toBe('user123');
        expect(typedEvent.campaignId).toBe('campaign_456');
        expect(typedEvent.payload).toEqual({
          symbol: 'BTC',
          prediction: 'bullish',
          confidence: 0.85,
        });
        expect(typedEvent.timestamp).toBeInstanceOf(Date);
      });

      it('should compile with valid campaign event types', () => {
        const validEventTypes: BullishCampaignEvent['eventType'][] = [
          'SEGMENT_WATCHED',
          'QUESTION_ANSWERED',
          'JOIN_CAMPAIGN',
          'CUSTOM_EVENTS',
        ];

        validEventTypes.forEach((eventType) => {
          const event: BullishCampaignEvent = {
            eventType,
            accountId: 'account123',
            campaignId: 'campaign456',
            payload: { data: 'test' },
            timestamp: new Date(),
          };

          expect(event.eventType).toBe(eventType);
        });
      });

      it('should allow flexible payload structure', () => {
        const event: BullishCampaignEvent = {
          eventType: 'CUSTOM_EVENTS',
          accountId: 'account123',
          campaignId: 'campaign456',
          payload: {
            customField: 'value',
            nestedData: { deep: { nested: 'value' } },
            arrayData: [1, 2, 3],
            booleanFlag: true,
            numericValue: 42,
          },
          timestamp: new Date(),
        };

        expect(event.payload.customField).toBe('value');
        expect(event.payload.nestedData.deep.nested).toBe('value');
        expect(event.payload.arrayData).toEqual([1, 2, 3]);
      });
    });
  });

  describe('Schema Integration Tests', () => {
    it('should validate complex nested scenarios using fixtures', () => {
      const complexMetadata = createMockMetadata({
        processing: {
          dataCloudWriteMode: 'batch',
          indexWriteMode: 'realtime',
          priority: 'high',
          encryption: true,
          ttl: 7200,
          batchOptions: {
            maxSize: 250,
            maxWaitTime: 3000,
          },
        },
        userContext: {
          source: 'telegram',
          userId: 'user123',
          chatId: 'chat456',
          sessionId: 'session789',
          customData: {
            level: 'premium',
            features: ['encryption', 'priority'],
          },
        },
        traceId: 'trace_complex_123',
      });

      expect(() => MetadataSchema.parse(complexMetadata)).not.toThrow();

      const validated = MetadataSchema.parse(complexMetadata);
      expect(validated.processing.batchOptions?.maxSize).toBe(250);
      expect(validated.userContext?.customData?.level).toBe('premium');
    });

    it('should enforce business logic constraints across schemas', () => {
      // Test that batch mode requires batch options
      const batchWithoutOptions = createMockMetadata({
        processing: {
          dataCloudWriteMode: 'batch',
          indexWriteMode: 'realtime',
          // Missing batchOptions
        },
      });

      // Should still validate at schema level, business logic validation happens elsewhere
      expect(() => MetadataSchema.parse(batchWithoutOptions)).not.toThrow();
    });
  });
});
