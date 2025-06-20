# Unified SDK API Reference

## Table of Contents

- [Classes](#classes)
  - [UnifiedSDK](#unifiedsdk)
  - [RulesInterpreter](#rulesinterpreter)
  - [Dispatcher](#dispatcher)
  - [Orchestrator](#orchestrator)
- [Interfaces](#interfaces)
  - [UnifiedSDKConfig](#unifiedsdkconfig)
  - [UnifiedResponse](#unifiedresponse)
  - [ProcessingMetadata](#processingmetadata)
  - [TelegramEventData](#telegrameventdata)
  - [TelegramMessageData](#telegrammessagedata)
  - [BullishCampaignEvent](#bullishcampaignevent)
  - [NightingaleVideoStream](#nightingalevideostream)
  - [NightingaleKLVData](#nightingaleklvdata)
  - [NightingaleTelemetry](#nightingaletelemetry)
  - [NightingaleFrameAnalysis](#nightingaleframeanalysis)
- [Error Classes](#error-classes)
  - [UnifiedSDKError](#unifiedsdkerror)
  - [ValidationError](#validationerror)
- [Schema Validators](#schema-validators)

## Classes

### UnifiedSDK

The main entry point for all data ingestion operations. **Provides a single `writeData()` method** that automatically detects data types and routes appropriately across **7 different data types**.

#### Constructor

```typescript
constructor(config: UnifiedSDKConfig)
```

Creates a new instance of the Unified SDK with the provided configuration.

**Parameters:**
- `config`: Configuration object containing DDC, Activity SDK, Nightingale, processing, and logging settings

**Example:**
```typescript
const sdk = new UnifiedSDK({
  ddcConfig: {
    signer: 'your mnemonic phrase here',
    bucketId: BigInt(573409),
    clusterId: BigInt('0x825c4b2352850de9986d9d28568db6f0c023a1e3'),
    network: 'testnet',
  },
  activityConfig: {
    endpoint: 'https://api.stats.cere.network',
    keyringUri: 'your mnemonic phrase here', // UriSigner compatible
    appId: 'my-app',
    connectionId: 'conn_' + Date.now(),
    sessionId: 'sess_' + Date.now(),
    appPubKey: 'your-app-public-key',
    dataServicePubKey: 'your-data-service-public-key',
  },
  nightingaleConfig: {
    videoProcessing: {
      chunkSize: 1024 * 1024, // 1MB chunks
      timelinePreservation: true,
      compression: true,
    },
    klvProcessing: {
      coordinateIndexing: true,
      metadataValidation: true,
    },
    telemetryProcessing: {
      timeSeries: true,
      coordinateTracking: true,
    },
  },
  processing: {
    enableBatching: true,
    defaultBatchSize: 100,
    defaultBatchTimeout: 5000,
    maxRetries: 3,
    retryDelay: 1000,
  },
  logging: {
    level: 'info',
    enableMetrics: true,
  },
});
```

#### Methods

##### `initialize(): Promise<void>`

Initializes the SDK and all its backend components (DDC Client, Activity SDK with UriSigner).

**Returns:** Promise that resolves when initialization is complete

**Throws:**
- `UnifiedSDKError` if initialization fails

**Implementation Details:**
- Initializes DDC Client with network-specific endpoints
- Sets up Activity SDK with UriSigner and ed25519 signatures for Event Service compatibility
- Includes intelligent fallback if Activity SDK initialization fails

**Example:**
```typescript
await sdk.initialize();
```

##### `writeData(payload: any, options?: WriteOptions): Promise<UnifiedResponse>`

**🎯 THE SINGLE ENTRY POINT** - The only data ingestion method that automatically detects **7 different data types** and routes appropriately.

**This is the ONLY method you need** - it automatically detects and processes:

1. **Telegram Events** (by `eventType` + `userId` + `timestamp` fields)
2. **Telegram Messages** (by `messageId` + `chatId` + `userId` + `messageType` fields)  
3. **Bullish Campaign Events** (by `eventType` + `campaignId` + `accountId` fields with specific event types)
4. **Nightingale Video Streams** (by `droneId` + `streamId` + `chunks` + `videoMetadata` fields)
5. **Nightingale KLV Data** (by `droneId` + `streamId` + `klvMetadata` fields)
6. **Nightingale Telemetry** (by `droneId` + `telemetryData` + `coordinates` fields)
7. **Nightingale Frame Analysis** (by `droneId` + `streamId` + `frameId` + `analysisResults` fields)
8. **Generic data** (fallback for any other structure)

**Parameters:**
- `payload`: The data to ingest (any structure - automatically detected)
- `options`: Optional configuration for this specific write operation

**Returns:** `UnifiedResponse` with transaction details and storage references

**WriteOptions Interface:**
```typescript
interface WriteOptions {
  priority?: 'low' | 'normal' | 'high';
  encryption?: boolean;
  writeMode?: 'realtime' | 'batch';
  metadata?: Partial<UnifiedMetadata>;
}
```

**Example - Automatic Detection:**
```typescript
// ✨ Telegram Event - Auto-detected
const result1 = await sdk.writeData({
  eventType: 'quest_completed',
  userId: 'user123',
  eventData: { questId: 'daily', points: 100 },
  timestamp: new Date(),
});

// ✨ Bullish Campaign Event - Auto-detected
const result2 = await sdk.writeData({
  eventType: 'SEGMENT_WATCHED',
  campaignId: 'bullish_education_2024',
  accountId: 'user_12345',
  payload: {
    segmentId: 'trading_basics_001',
    completionPercentage: 100,
  },
  timestamp: new Date(),
});

// ✨ Nightingale Video Stream - Auto-detected
const result3 = await sdk.writeData({
  droneId: 'drone_001',
  streamId: 'stream_123',
  timestamp: new Date(),
  videoMetadata: {
    duration: 30000,
    fps: 30,
    resolution: '1920x1080',
    codec: 'h264',
    streamType: 'rgb',
  },
  chunks: [
    {
      chunkId: 'chunk_001',
      startTime: 0,
      endTime: 5000,
      data: videoBuffer,
      size: 1024000,
    },
  ],
});

// ✨ Nightingale Telemetry - Auto-detected
const result4 = await sdk.writeData({
  droneId: 'drone_001',
  timestamp: new Date(),
  telemetryData: {
    gps: { lat: 37.7749, lng: -122.4194, alt: 100 },
    orientation: { pitch: 0, roll: 0, yaw: 45 },
    velocity: { x: 10, y: 0, z: 0 },
    battery: 85,
    signalStrength: 90,
  },
  coordinates: {
    latitude: 37.7749,
    longitude: -122.4194,
    altitude: 100,
  },
  missionId: 'mission_001',
});

// ✨ Custom options for high-priority data
const result5 = await sdk.writeData(
  { customData: 'important info' },
  {
    priority: 'high',
    encryption: true,
    metadata: {
      processing: {
        dataCloudWriteMode: 'direct',
        indexWriteMode: 'realtime',
      },
    },
  }
);
```

##### `getStatus(): object`

Returns the current status of the SDK and its components.

**Returns:** Status object with component states

**Response Format:**
```typescript
{
  initialized: boolean;
  config: any; // Sanitized configuration (sensitive data removed)
  components: {
    rulesInterpreter: boolean;
    dispatcher: boolean;
    orchestrator: boolean;
  };
}
```

##### `cleanup(): Promise<void>`

Cleans up resources and disconnects from backend services.

**Returns:** Promise that resolves when cleanup is complete

### RulesInterpreter

Handles metadata validation and processing rule extraction using Zod schemas.

#### Constructor

```typescript
constructor(logger?: (level: string, message: string, ...args: any[]) => void)
```

#### Methods

##### `validateMetadata(metadata: any): UnifiedMetadata`

Validates metadata against the schema using Zod validation with business rule enforcement.

**Parameters:**
- `metadata`: Raw metadata object to validate

**Returns:** Validated UnifiedMetadata object

**Throws:**
- `ValidationError` if metadata is invalid
- `UnifiedSDKError` for unexpected validation errors

**Business Rules Enforced:**
- At least one action must be enabled (cannot skip both data cloud and index)
- Validates rule consistency for batching and encryption
- Provides optimization warnings for suboptimal configurations

##### `extractProcessingRules(metadata: UnifiedMetadata): ProcessingRules`

Extracts processing rules from validated metadata.

**Returns:** ProcessingRules object with routing decisions

##### `optimizeProcessingRules(rules: ProcessingRules, context?: any): ProcessingRules`

Optimizes processing rules based on context (e.g., payload size, priority).

**Context-Based Optimizations:**
- Adjusts batch sizes for large payloads (>1MB)
- Reduces timeout for high-priority operations by 50%
- Optimizes execution mode based on data type

### Dispatcher

Creates execution plans from processing rules with enhanced support for campaign and drone data.

#### Constructor

```typescript
constructor(logger?: (level: string, message: string, ...args: any[]) => void)
```

#### Methods

##### `routeRequest(payload: any, rules: ProcessingRules): DispatchPlan`

Routes request based on processing rules and creates execution plan with data-type-specific optimizations.

**Enhanced Features:**
- **Campaign Tracking**: Automatic campaign and quest tracking for Bullish events
- **Drone Data Optimization**: Specialized handling for video streams and telemetry
- **Intelligent Execution**: Chooses parallel vs sequential based on data dependencies

**Returns:** DispatchPlan with actions to execute

### Orchestrator

Executes actions and manages backend integrations with enhanced error handling and fallback mechanisms.

#### Constructor

```typescript
constructor(config: UnifiedSDKConfig, logger?: (level: string, message: string, ...args: any[]) => void)
```

#### Methods

##### `initialize(): Promise<void>`

Initializes backend clients with network-specific configurations:
- **DDC Client**: Network-aware endpoint selection (devnet/testnet/mainnet)
- **Activity SDK**: UriSigner with ed25519 signatures for Event Service compatibility
- **Intelligent Fallback**: Graceful degradation if Activity SDK initialization fails

##### `execute(plan: DispatchPlan): Promise<OrchestrationResult>`

Executes actions with enhanced features:
- **Parallel/Sequential Execution**: Based on data dependencies and processing rules
- **Campaign-Specific Logic**: Automatic quest updates and campaign metrics
- **Error Recovery**: Intelligent retry and fallback mechanisms

##### `cleanup(): Promise<void>`

Cleans up resources and disconnects from backends.

## Interfaces

### UnifiedSDKConfig

Enhanced configuration interface supporting multiple use cases.

```typescript
interface UnifiedSDKConfig {
  // DDC Client configuration (required)
  ddcConfig: {
    signer: string; // Substrate URI or mnemonic phrase
    bucketId: bigint;
    clusterId?: bigint;
    network?: 'testnet' | 'devnet' | 'mainnet';
  };

  // Activity SDK configuration (optional)
  activityConfig?: {
    endpoint?: string;
    keyringUri?: string; // Substrate URI for UriSigner
    appId?: string;
    connectionId?: string;
    sessionId?: string;
    appPubKey?: string;
    dataServicePubKey?: string;
  };

  // Nightingale-specific configuration (optional)
  nightingaleConfig?: {
    videoProcessing?: {
      chunkSize?: number; // Default chunk size for video processing
      timelinePreservation?: boolean; // Maintain temporal relationships
      compression?: boolean; // Enable video compression
    };
    klvProcessing?: {
      coordinateIndexing?: boolean; // Index coordinate data
      metadataValidation?: boolean; // Validate KLV metadata
    };
    telemetryProcessing?: {
      timeSeries?: boolean; // Enable time series processing
      coordinateTracking?: boolean; // Track coordinate changes
    };
  };

  // Processing options (required)
  processing: {
    enableBatching: boolean;
    defaultBatchSize: number;
    defaultBatchTimeout: number; // in milliseconds
    maxRetries: number;
    retryDelay: number; // in milliseconds
  };

  // Logging and monitoring (required)
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    enableMetrics: boolean;
  };
}
```

### UnifiedResponse

Enhanced response format with comprehensive metadata.

```typescript
interface UnifiedResponse {
  transactionId: string;
  status: 'success' | 'partial' | 'failed';

  /**
   * DDC Content Identifier (CID) for data stored in Data Cloud
   * Available for all data types when stored in DDC
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
    actionsExecuted: string[]; // Which services were used
  };
}
```

### ProcessingMetadata

Controls how data is processed and routed with enhanced options.

```typescript
interface ProcessingMetadata {
  dataCloudWriteMode: 'direct' | 'batch' | 'viaIndex' | 'skip';
  indexWriteMode: 'realtime' | 'skip';
  priority?: 'low' | 'normal' | 'high';
  ttl?: number; // Time to live in seconds
  encryption?: boolean;
  batchOptions?: {
    maxSize?: number;
    maxWaitTime?: number; // in milliseconds
  };
}
```

### TelegramEventData

Structure for Telegram events (automatically detected).

```typescript
interface TelegramEventData {
  eventType: 'quest_completed' | 'user_action' | 'mini_app_interaction';
  userId: string;
  chatId?: string;
  eventData: Record<string, any>;
  timestamp: Date;
}
```

### TelegramMessageData

Structure for Telegram messages (automatically detected).

```typescript
interface TelegramMessageData {
  messageId: string;
  chatId: string;
  userId: string;
  messageText?: string;
  messageType: 'text' | 'photo' | 'video' | 'document' | 'sticker';
  timestamp: Date;
  metadata?: Record<string, any>;
}
```

### BullishCampaignEvent

Structure for Bullish campaign events (automatically detected).

```typescript
interface BullishCampaignEvent {
  eventType: 'SEGMENT_WATCHED' | 'QUESTION_ANSWERED' | 'JOIN_CAMPAIGN' | 'CUSTOM_EVENTS';
  campaignId: string;
  accountId: string;
  timestamp: Date;
  payload: Record<string, any>; // Campaign-specific data
}
```

**Auto-Detection:** Detected when payload contains `eventType` (with valid campaign event type), `campaignId`, and `accountId` fields.

### NightingaleVideoStream

Structure for Nightingale video stream data (automatically detected).

```typescript
interface NightingaleVideoStream {
  droneId: string;
  streamId: string;
  timestamp: Date;
  videoMetadata: {
    duration: number; // Duration in milliseconds
    fps: number;
    resolution: string; // e.g., "1920x1080"
    codec: string; // e.g., "h264"
    streamType?: 'thermal' | 'rgb';
  };
  chunks: Array<{
    chunkId: string;
    startTime: number; // Start time in milliseconds
    endTime: number; // End time in milliseconds
    data: Buffer | string; // Video chunk data
    offset?: number; // Byte offset in stream
    size?: number; // Chunk size in bytes
  }>;
}
```

**Auto-Detection:** Detected when payload contains `droneId`, `streamId`, `chunks`, and `videoMetadata` fields.

### NightingaleKLVData

Structure for Nightingale Key-Length-Value metadata (automatically detected).

```typescript
interface NightingaleKLVData {
  droneId: string;
  streamId: string;
  chunkCid?: string; // Reference to associated video chunk
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
```

**Auto-Detection:** Detected when payload contains `droneId`, `streamId`, and `klvMetadata` fields.

### NightingaleTelemetry

Structure for Nightingale telemetry data (automatically detected).

```typescript
interface NightingaleTelemetry {
  droneId: string;
  timestamp: Date;
  telemetryData: {
    gps: { lat: number; lng: number; alt: number };
    orientation: { pitch: number; roll: number; yaw: number };
    velocity: { x: number; y: number; z: number };
    battery: number; // Battery percentage (0-100)
    signalStrength: number; // Signal strength percentage (0-100)
  };
  coordinates: {
    latitude: number;
    longitude: number;
    altitude: number;
  };
  missionId?: string;
  platformData?: Record<string, any>;
}
```

**Auto-Detection:** Detected when payload contains `droneId`, `telemetryData`, and `coordinates` fields.

### NightingaleFrameAnalysis

Structure for Nightingale frame analysis results (automatically detected).

```typescript
interface NightingaleFrameAnalysis {
  droneId: string;
  streamId: string;
  frameId: string;
  chunkCid?: string; // Reference to source video chunk
  timestamp: Date;
  pts: number; // Presentation timestamp
  frameData: {
    base64EncodedData: string; // Base64 encoded frame image
    metadata: {
      width: number;
      height: number;
      format: string; // e.g., "jpeg", "png"
    };
  };
  analysisResults: {
    objects: Array<{
      type: string; // Object type (e.g., "person", "vehicle")
      confidence: number; // Confidence score (0-1)
      boundingBox: [number, number, number, number]; // [x, y, width, height]
    }>;
    features: Record<string, any>; // Additional analysis features
  };
}
```

**Auto-Detection:** Detected when payload contains `droneId`, `streamId`, `frameId`, and `analysisResults` fields.

## Error Classes

### UnifiedSDKError

Base error class for all SDK errors with enhanced error categorization.

```typescript
class UnifiedSDKError extends Error {
  constructor(
    message: string,
    public code: string,
    public component: string,
    public recoverable: boolean = false,
    public originalError?: Error
  );
}
```

**Enhanced Error Codes:**
- `NOT_INITIALIZED`: SDK not initialized before use
- `INGESTION_ERROR`: Data ingestion failed
- `INITIALIZATION_ERROR`: SDK initialization failed
- `EXECUTION_ERROR`: Action execution failed
- `VALIDATION_UNEXPECTED`: Unexpected validation error
- `INVALID_DATA_CLOUD_MODE`: Invalid data cloud write mode
- `INVALID_INDEX_MODE`: Invalid index write mode
- `INVALID_RULE_COMBINATION`: Invalid processing rule combination
- `UNKNOWN_DATA_CLOUD_ACTION`: Unknown data cloud action
- `UNKNOWN_INDEX_ACTION`: Unknown index action
- `UNKNOWN_TARGET`: Unknown action target

### ValidationError

Specialized error for metadata validation failures.

```typescript
class ValidationError extends UnifiedSDKError {
  constructor(
    message: string,
    public validationErrors: z.ZodError
  );
}
```

## Schema Validators

Enhanced Zod schemas for all data types:

### Core Schemas

```typescript
const DataCloudWriteModeSchema = z.enum(['direct', 'batch', 'viaIndex', 'skip']);
const IndexWriteModeSchema = z.enum(['realtime', 'skip']);
const ProcessingMetadataSchema = z.object({...});
const MetadataSchema = z.object({...});
```

### Bullish Campaign Schemas

```typescript
const BullishCampaignEventSchema = z.object({
  eventType: z.enum(['SEGMENT_WATCHED', 'QUESTION_ANSWERED', 'JOIN_CAMPAIGN', 'CUSTOM_EVENTS']),
  campaignId: z.string(),
  accountId: z.string(),
  timestamp: z.date(),
  payload: z.record(z.any()),
});
```

### Nightingale Schemas

```typescript
const NightingaleVideoStreamSchema = z.object({...});
const NightingaleKLVDataSchema = z.object({...});
const NightingaleTelemetrySchema = z.object({...});
const NightingaleFrameAnalysisSchema = z.object({...});
```

## Usage Examples

### Auto-Detection Examples

```typescript
// ✨ All examples use writeData() with automatic detection

// Telegram Quest
await sdk.writeData({
  eventType: 'quest_completed',
  userId: 'user123',
  eventData: { questId: 'daily', points: 100 },
  timestamp: new Date(),
});

// Bullish Campaign
await sdk.writeData({
  eventType: 'SEGMENT_WATCHED',
  campaignId: 'education_2024',
  accountId: 'user_456',
  payload: { segmentId: 'basics_001', completion: 100 },
  timestamp: new Date(),
});

// Nightingale Telemetry
await sdk.writeData({
  droneId: 'drone_001',
  telemetryData: {
    gps: { lat: 37.7749, lng: -122.4194, alt: 100 },
    orientation: { pitch: 0, roll: 0, yaw: 45 },
    velocity: { x: 10, y: 0, z: 0 },
    battery: 85,
    signalStrength: 90,
  },
  coordinates: { latitude: 37.7749, longitude: -122.4194, altitude: 100 },
  timestamp: new Date(),
});
```

## Migration Guide

### From Previous Versions

The enhanced SDK maintains backward compatibility while adding powerful new features:

```typescript
// ❌ Old: Multiple methods
await sdk.writeTelegramEvent(telegramData);
await sdk.writeBullishCampaign(campaignData);

// ✅ New: Single method with auto-detection
await sdk.writeData(telegramData); // Auto-detected
await sdk.writeData(campaignData); // Auto-detected
await sdk.writeData(droneData); // Auto-detected - NEW!
```

## Type Exports

All types are exported for TypeScript development:

```typescript
import type {
  UnifiedSDKConfig,
  UnifiedResponse,
  ProcessingMetadata,
  TelegramEventData,
  TelegramMessageData,
  BullishCampaignEvent,
  NightingaleVideoStream,
  NightingaleKLVData,
  NightingaleTelemetry,
  NightingaleFrameAnalysis,
  ProcessingRules,
  Action,
  DispatchPlan,
  ExecutionResult,
  OrchestrationResult,
} from '@cere-ddc-sdk/unified';
```

The enhanced Unified SDK provides comprehensive support for multiple data ecosystems while maintaining the simplicity of a single `writeData()` method. All complexity is handled internally through intelligent auto-detection and optimized routing.
