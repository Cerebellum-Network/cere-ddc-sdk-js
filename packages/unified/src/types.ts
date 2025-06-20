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

// Use case specific types for Bullish Campaigns
export interface BullishCampaignEvent {
  eventType: 'SEGMENT_WATCHED' | 'QUESTION_ANSWERED' | 'JOIN_CAMPAIGN' | 'CUSTOM_EVENTS';
  accountId: string;
  campaignId: string;
  timestamp: Date;
  payload: Record<string, any>;
}

// Schema validation for Bullish campaigns
export const BullishCampaignEventSchema = z.object({
  eventType: z.enum(['SEGMENT_WATCHED', 'QUESTION_ANSWERED', 'JOIN_CAMPAIGN', 'CUSTOM_EVENTS']),
  accountId: z.string(),
  campaignId: z.string(),
  timestamp: z.date(),
  payload: z.record(z.any()),
});

export type BullishCampaignEventType = z.infer<typeof BullishCampaignEventSchema>;

// Use case specific types for Nightingale Drone Data
export interface NightingaleVideoStream {
  droneId: string;
  streamId: string;
  timestamp: Date;
  videoMetadata: {
    duration: number;
    fps: number;
    resolution: string;
    codec: string;
    streamType?: 'thermal' | 'rgb';
  };
  chunks: Array<{
    chunkId: string;
    startTime: number;
    endTime: number;
    data: Buffer | string;
    offset?: number;
    size?: number;
  }>;
}

export interface NightingaleKLVData {
  droneId: string;
  streamId: string;
  chunkCid?: string;
  timestamp: Date;
  pts: number; // Presentation timestamp
  klvMetadata: {
    type: string; // e.g., "ST 0601"
    missionId?: string;
    platform: {
      headingAngle: number;
      pitchAngle: number;
      rollAngle: number;
    };
    sensor: {
      latitude: number;
      longitude: number;
      trueAltitude: number;
      horizontalFieldOfView: number;
      verticalFieldOfView: number;
      relativeAzimuth: number;
      relativeElevation: number;
      relativeRoll: number;
    };
    frameCenter: {
      latitude: number;
      longitude: number;
      elevation: number;
    };
    offsetCorners?: Array<{
      latitude: number;
      longitude: number;
    }>;
    fields: Record<string, any>; // Additional KLV fields
  };
}

export interface NightingaleTelemetry {
  droneId: string;
  timestamp: Date;
  telemetryData: {
    gps: { lat: number; lng: number; alt: number };
    orientation: { pitch: number; roll: number; yaw: number };
    velocity: { x: number; y: number; z: number };
    battery: number;
    signalStrength: number;
  };
  coordinates: {
    latitude: number;
    longitude: number;
    altitude: number;
  };
  missionId?: string;
  platformData?: Record<string, any>;
}

export interface NightingaleFrameAnalysis {
  droneId: string;
  streamId: string;
  frameId: string;
  chunkCid?: string;
  timestamp: Date;
  pts: number; // Presentation timestamp
  frameData: {
    base64EncodedData: string;
    metadata: {
      width: number;
      height: number;
      format: string;
    };
  };
  analysisResults: {
    objects: Array<{
      type: string;
      confidence: number;
      boundingBox: [number, number, number, number];
    }>;
    features: Record<string, any>;
  };
}

// Schema validation for Nightingale data types
export const NightingaleVideoStreamSchema = z.object({
  droneId: z.string(),
  streamId: z.string(),
  timestamp: z.date(),
  videoMetadata: z.object({
    duration: z.number(),
    fps: z.number(),
    resolution: z.string(),
    codec: z.string(),
    streamType: z.enum(['thermal', 'rgb']).optional(),
  }),
  chunks: z.array(
    z.object({
      chunkId: z.string(),
      startTime: z.number(),
      endTime: z.number(),
      data: z.union([z.instanceof(Buffer), z.string()]),
      offset: z.number().optional(),
      size: z.number().optional(),
    }),
  ),
});

export const NightingaleKLVDataSchema = z.object({
  droneId: z.string(),
  streamId: z.string(),
  chunkCid: z.string().optional(),
  timestamp: z.date(),
  pts: z.number(),
  klvMetadata: z.object({
    type: z.string(),
    missionId: z.string().optional(),
    platform: z.object({
      headingAngle: z.number(),
      pitchAngle: z.number(),
      rollAngle: z.number(),
    }),
    sensor: z.object({
      latitude: z.number(),
      longitude: z.number(),
      trueAltitude: z.number(),
      horizontalFieldOfView: z.number(),
      verticalFieldOfView: z.number(),
      relativeAzimuth: z.number(),
      relativeElevation: z.number(),
      relativeRoll: z.number(),
    }),
    frameCenter: z.object({
      latitude: z.number(),
      longitude: z.number(),
      elevation: z.number(),
    }),
    offsetCorners: z
      .array(
        z.object({
          latitude: z.number(),
          longitude: z.number(),
        }),
      )
      .optional(),
    fields: z.record(z.any()),
  }),
});

export const NightingaleTelemetrySchema = z.object({
  droneId: z.string(),
  timestamp: z.date(),
  telemetryData: z.object({
    gps: z.object({ lat: z.number(), lng: z.number(), alt: z.number() }),
    orientation: z.object({ pitch: z.number(), roll: z.number(), yaw: z.number() }),
    velocity: z.object({ x: z.number(), y: z.number(), z: z.number() }),
    battery: z.number(),
    signalStrength: z.number(),
  }),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
    altitude: z.number(),
  }),
  missionId: z.string().optional(),
  platformData: z.record(z.any()).optional(),
});

export const NightingaleFrameAnalysisSchema = z.object({
  droneId: z.string(),
  streamId: z.string(),
  frameId: z.string(),
  chunkCid: z.string().optional(),
  timestamp: z.date(),
  pts: z.number(),
  frameData: z.object({
    base64EncodedData: z.string(),
    metadata: z.object({
      width: z.number(),
      height: z.number(),
      format: z.string(),
    }),
  }),
  analysisResults: z.object({
    objects: z.array(
      z.object({
        type: z.string(),
        confidence: z.number(),
        boundingBox: z.tuple([z.number(), z.number(), z.number(), z.number()]),
      }),
    ),
    features: z.record(z.any()),
  }),
});

export type NightingaleVideoStreamType = z.infer<typeof NightingaleVideoStreamSchema>;
export type NightingaleKLVDataType = z.infer<typeof NightingaleKLVDataSchema>;
export type NightingaleTelemetryType = z.infer<typeof NightingaleTelemetrySchema>;
export type NightingaleFrameAnalysisType = z.infer<typeof NightingaleFrameAnalysisSchema>;

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

  // Nightingale-specific configuration
  nightingaleConfig?: {
    videoProcessing?: {
      chunkSize?: number; // Default chunk size for video processing
      timelinePreservation?: boolean;
      compression?: boolean;
    };
    klvProcessing?: {
      coordinateIndexing?: boolean;
      metadataValidation?: boolean;
    };
    telemetryProcessing?: {
      timeSeries?: boolean;
      coordinateTracking?: boolean;
    };
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
