import { z } from 'zod';

/**
 * Metadata schema for processing instructions
 * Based on the architecture document diagrams/2_metadata_schema.md
 */

// Data Cloud Write Mode - Controls how/if data goes to Data Cloud storage
export const DataCloudWriteModeSchema = z.enum([
  'direct', // Write immediately to Data Cloud (bypassing Indexing Layer)
  'batch', // Buffer data and write to Data Cloud in batches
  'viaIndex', // Let the Indexing Layer handle Data Cloud storage
  'skip', // Don't store in Data Cloud at all
]);

// Index Write Mode - Controls how/if data goes to Indexing Layer
export const IndexWriteModeSchema = z.enum([
  'realtime', // Write to Indexing Layer immediately
  'skip', // Don't index this data
]);

// Core processing metadata schema
export const ProcessingMetadataSchema = z
  .object({
    dataCloudWriteMode: DataCloudWriteModeSchema,
    indexWriteMode: IndexWriteModeSchema,
    // Optional fields for advanced use cases
    priority: z.enum(['low', 'normal', 'high']).optional(),
    ttl: z.number().min(0).optional(), // Time to live in seconds
    encryption: z.boolean().optional(),
    batchOptions: z
      .object({
        maxSize: z.number().min(1).optional(),
        maxWaitTime: z.number().min(0).optional(), // in milliseconds
      })
      .optional(),
  })
  .refine(
    (data: { dataCloudWriteMode: string; indexWriteMode: string }) =>
      !(data.dataCloudWriteMode === 'skip' && data.indexWriteMode === 'skip'),
    {
      message: "Both dataCloudWriteMode and indexWriteMode cannot be 'skip' - data must go somewhere",
      path: ['dataCloudWriteMode', 'indexWriteMode'],
    },
  );

// Main metadata wrapper
export const MetadataSchema = z.object({
  processing: ProcessingMetadataSchema,
  // Additional metadata fields can be added here
  userContext: z.record(z.any()).optional(),
  traceId: z.string().optional(),
});

// Type exports
export type DataCloudWriteMode = z.infer<typeof DataCloudWriteModeSchema>;
export type IndexWriteMode = z.infer<typeof IndexWriteModeSchema>;
export type ProcessingMetadata = z.infer<typeof ProcessingMetadataSchema>;
export type UnifiedMetadata = z.infer<typeof MetadataSchema>;

// Response types
export interface UnifiedResponse {
  transactionId: string;
  status: 'success' | 'partial' | 'failed';

  /**
   * DDC Content Identifier (CID) for data stored in Data Cloud
   * This CID can be used to reference the original data source in conversation streams
   * or other systems that need to link back to the stored content
   */
  dataCloudHash?: string;

  /**
   * Activity SDK event identifier for indexed data
   * Useful for tracking and querying analytics events
   */
  indexId?: string;

  errors?: Array<{
    component: string;
    error: string;
    recoverable: boolean;
  }>;
  metadata: {
    processedAt: Date;
    processingTime: number; // in milliseconds
    actionsExecuted: string[];
  };
}

// Error types
export class UnifiedSDKError extends Error {
  constructor(
    message: string,
    public code: string,
    public component: string,
    public recoverable: boolean = false,
    public originalError?: Error,
  ) {
    super(message);
    this.name = 'UnifiedSDKError';
  }
}

export class ValidationError extends UnifiedSDKError {
  constructor(
    message: string,
    public validationErrors: z.ZodError,
  ) {
    super(message, 'VALIDATION_ERROR', 'RulesInterpreter', false);
  }
}

// Use case specific types for Telegram
export interface TelegramEventData {
  eventType: 'quest_completed' | 'user_action' | 'mini_app_interaction';
  userId: string;
  chatId?: string;
  eventData: Record<string, any>;
  timestamp: Date;
}

export interface TelegramMessageData {
  messageId: string;
  chatId: string;
  userId: string;
  messageText?: string;
  messageType: 'text' | 'photo' | 'video' | 'document' | 'sticker';
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Configuration types
export interface UnifiedSDKConfig {
  // DDC Client configuration
  ddcConfig: {
    signer: string; // Substrate URI or signer instance
    bucketId: bigint;
    clusterId?: bigint;
    network?: 'testnet' | 'devnet' | 'mainnet';
  };

  // Activity SDK configuration (if using as dependency)
  activityConfig?: {
    endpoint?: string;
    keyringUri?: string; // Substrate URI for signing (e.g., '//Alice' or mnemonic)
    appId?: string;
    connectionId?: string;
    sessionId?: string;
    appPubKey?: string;
    dataServicePubKey?: string;
  };

  // Processing options
  processing: {
    enableBatching: boolean;
    defaultBatchSize: number;
    defaultBatchTimeout: number; // in milliseconds
    maxRetries: number;
    retryDelay: number; // in milliseconds
  };

  // Logging and monitoring
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    enableMetrics: boolean;
  };
}
