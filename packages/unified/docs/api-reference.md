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
- [Error Classes](#error-classes)
  - [UnifiedSDKError](#unifiedsdkerror)
  - [ValidationError](#validationerror)
- [Schema Validators](#schema-validators)

## Classes

### UnifiedSDK

The main entry point for all data ingestion operations. **Provides a single `writeData()` method** that automatically detects data types and routes appropriately.

#### Constructor

```typescript
constructor(config: UnifiedSDKConfig)
```

Creates a new instance of the Unified SDK with the provided configuration.

**Parameters:**
- `config`: Configuration object containing DDC, Activity SDK, processing, and logging settings

**Example:**
```typescript
const sdk = new UnifiedSDK({
  ddcConfig: {
    signer: 'your mnemonic phrase here',
    bucketId: BigInt(573409),
    network: 'testnet',
  },
  activityConfig: {
    endpoint: 'https://api.stats.cere.network',
    keyringUri: '//Alice',
    appId: 'my-app',
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

Initializes the SDK and all its backend components (DDC Client, Activity SDK).

**Returns:** Promise that resolves when initialization is complete

**Throws:**
- `UnifiedSDKError` if initialization fails

**Example:**
```typescript
await sdk.initialize();
```

##### `writeData(payload: any, options?: WriteOptions): Promise<UnifiedResponse>`

**🎯 THE SINGLE ENTRY POINT** - The only data ingestion method that automatically detects data types and routes appropriately.

**This is the ONLY method you need** - it replaces all individual methods by automatically detecting:
- Telegram Events (by `eventType` + `userId` + `timestamp` fields)
- Telegram Messages (by `messageId` + `chatId` + `userId` + `messageType` fields)  
- Bullish Campaign Events (by `eventType` + `campaignId` + `accountId` fields)
- Drone Telemetry (by `droneId` + `telemetry` + location fields)
- Generic data (fallback for any other structure)

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

**Example:**
```typescript
// ✨ Automatic detection for Telegram event
const result1 = await sdk.writeData({
  eventType: 'quest_completed',
  userId: 'user123',
  eventData: { questId: 'daily', points: 100 },
  timestamp: new Date(),
});

// ✨ Automatic detection for Telegram message
const result2 = await sdk.writeData({
  messageId: 'msg123',
  chatId: 'chat456',
  userId: 'user789',
  messageText: 'Hello world!',
  messageType: 'text',
  timestamp: new Date(),
});

// ✨ Automatic detection for Bullish campaign event
const result3 = await sdk.writeData({
  eventType: 'SEGMENT_WATCHED',
  campaignId: 'bullish_education_2024',
  accountId: 'user_12345',
  eventData: {
    segmentId: 'trading_basics_001',
    completionPercentage: 100,
  },
  questId: 'education_quest_001',
  timestamp: new Date(),
});

// ✨ Custom options
const result4 = await sdk.writeData(
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
  config: any; // Sanitized configuration
  components: {
    rulesInterpreter: boolean;
    dispatcher: boolean;
    orchestrator: boolean;
  };
}
```

**Example:**
```typescript
const status = sdk.getStatus();
console.log('SDK initialized:', status.initialized);
console.log('Components ready:', status.components);
```

##### `cleanup(): Promise<void>`

Cleans up resources and disconnects from backend services.

**Returns:** Promise that resolves when cleanup is complete

**Example:**
```typescript
await sdk.cleanup();
```

### RulesInterpreter

Handles metadata validation and processing rule extraction. Typically used internally by UnifiedSDK.

#### Constructor

```typescript
constructor(logger?: (level: string, message: string, ...args: any[]) => void)
```

#### Methods

##### `validateMetadata(metadata: any): UnifiedMetadata`

Validates metadata against the schema using Zod validation.

**Parameters:**
- `metadata`: Raw metadata object to validate

**Returns:** Validated UnifiedMetadata object

**Throws:**
- `ValidationError` if metadata is invalid
- `UnifiedSDKError` for unexpected validation errors

##### `extractProcessingRules(metadata: UnifiedMetadata): ProcessingRules`

Extracts processing rules from validated metadata.

**Returns:** ProcessingRules object with routing decisions

##### `optimizeProcessingRules(rules: ProcessingRules, context?: any): ProcessingRules`

Optimizes processing rules based on context (e.g., payload size).

### Dispatcher

Creates execution plans from processing rules. Typically used internally by UnifiedSDK.

#### Constructor

```typescript
constructor(logger?: (level: string, message: string, ...args: any[]) => void)
```

#### Methods

##### `routeRequest(payload: any, rules: ProcessingRules): DispatchPlan`

Routes request based on processing rules and creates execution plan.

**Returns:** DispatchPlan with actions to execute

### Orchestrator

Executes actions and manages backend integrations. Typically used internally by UnifiedSDK.

#### Constructor

```typescript
constructor(config: UnifiedSDKConfig, logger?: (level: string, message: string, ...args: any[]) => void)
```

#### Methods

##### `initialize(): Promise<void>`

Initializes backend clients (DDC Client, Activity SDK).

##### `execute(plan: DispatchPlan): Promise<OrchestrationResult>`

Executes actions according to the dispatch plan.

##### `cleanup(): Promise<void>`

Cleans up resources and disconnects from backends.

## Interfaces

### UnifiedSDKConfig

Main configuration interface for the SDK.

```typescript
interface UnifiedSDKConfig {
  // DDC Client configuration
  ddcConfig: {
    signer: string; // Substrate URI or mnemonic phrase
    bucketId: bigint;
    clusterId?: bigint;
    network?: 'testnet' | 'devnet' | 'mainnet';
  };

  // Activity SDK configuration (optional)
  activityConfig?: {
    endpoint?: string;
    keyringUri?: string; // Substrate URI for signing
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
```

### UnifiedResponse

Response format returned by `writeData()`.

```typescript
interface UnifiedResponse {
  transactionId: string;
  status: 'success' | 'partial' | 'failed';

  /**
   * DDC Content Identifier (CID) for data stored in Data Cloud
   * This CID can be used to reference the original data source
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
```

### ProcessingMetadata

Controls how data is processed and routed.

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

**Data Cloud Write Modes:**
- `direct`: Write immediately to DDC (bypassing indexing)
- `batch`: Buffer and write to DDC in batches
- `viaIndex`: Let Activity SDK handle DDC storage
- `skip`: Don't store in DDC

**Index Write Modes:**
- `realtime`: Write to Activity SDK immediately
- `skip`: Don't index this data

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
  eventData: Record<string, any>;
  questId?: string; // Optional quest identifier
  metadata?: Record<string, any>; // Additional campaign metadata
}
```

**Automatic Detection:** The SDK detects Bullish campaign events when payload contains `eventType`, `campaignId`, and `accountId` fields.

**Supported Event Types:**
- `SEGMENT_WATCHED`: Video segment completion tracking
- `QUESTION_ANSWERED`: Quiz and question answering
- `JOIN_CAMPAIGN`: Campaign participation events
- `CUSTOM_EVENTS`: Custom campaign-specific events

**Example Usage:**
```typescript
// ✨ Automatically detected as Bullish Campaign Event
const result = await sdk.writeData({
  eventType: 'SEGMENT_WATCHED',
  campaignId: 'bullish_education_2024',
  accountId: 'user_12345',
  eventData: {
    segmentId: 'trading_basics_001',
    completionPercentage: 100,
    watchDuration: 300000,
  },
  questId: 'education_quest_001',
  timestamp: new Date(),
});
```

## Error Classes

### UnifiedSDKError

Base error class for all SDK errors.

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

**Common Error Codes:**
- `NOT_INITIALIZED`: SDK not initialized before use
- `INGESTION_ERROR`: Data ingestion failed
- `INITIALIZATION_ERROR`: SDK initialization failed
- `EXECUTION_ERROR`: Action execution failed
- `UNKNOWN_TARGET`: Unknown action target
- `UNKNOWN_METHOD`: Unknown method for target

**Example:**
```typescript
try {
  await sdk.writeData(data);
} catch (error) {
  if (error instanceof UnifiedSDKError) {
    console.log('Error code:', error.code);
    console.log('Component:', error.component);
    console.log('Recoverable:', error.recoverable);
  }
}
```

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

The SDK exports Zod schemas for validation:

### DataCloudWriteModeSchema

```typescript
const DataCloudWriteModeSchema = z.enum(['direct', 'batch', 'viaIndex', 'skip']);
```

### IndexWriteModeSchema

```typescript
const IndexWriteModeSchema = z.enum(['realtime', 'skip']);
```

### ProcessingMetadataSchema

```typescript
const ProcessingMetadataSchema = z.object({
  dataCloudWriteMode: DataCloudWriteModeSchema,
  indexWriteMode: IndexWriteModeSchema,
  priority: z.enum(['low', 'normal', 'high']).optional(),
  ttl: z.number().min(0).optional(),
  encryption: z.boolean().optional(),
  batchOptions: z.object({
    maxSize: z.number().min(1).optional(),
    maxWaitTime: z.number().min(0).optional(),
  }).optional(),
});
```

### MetadataSchema

```typescript
const MetadataSchema = z.object({
  processing: ProcessingMetadataSchema,
  userContext: z.record(z.any()).optional(),
  traceId: z.string().optional(),
});
```

## Usage Examples

### Basic Usage

```typescript
import { UnifiedSDK } from '@cere-ddc-sdk/unified';

const sdk = new UnifiedSDK(config);
await sdk.initialize();

// Simple data ingestion
const result = await sdk.writeData({
  eventType: 'user_action',
  userId: 'user123',
  eventData: { action: 'click', target: 'button' },
  timestamp: new Date(),
});

console.log('Transaction ID:', result.transactionId);
console.log('Status:', result.status);
```

### Error Handling

```typescript
try {
  const result = await sdk.writeData(payload);
  
  if (result.status === 'partial') {
    console.warn('Partial success:', result.errors);
  }
  
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Invalid metadata:', error.validationErrors);
  } else if (error instanceof UnifiedSDKError) {
    console.error('SDK error:', error.code, error.message);
    
    if (error.recoverable) {
      // Retry logic here
    }
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### Advanced Configuration

```typescript
const result = await sdk.writeData(
  { 
    complexData: { nested: 'structure' },
    important: true 
  },
  {
    priority: 'high',
    encryption: true,
    metadata: {
      processing: {
        dataCloudWriteMode: 'direct',
        indexWriteMode: 'realtime',
        ttl: 3600, // 1 hour
      },
      userContext: {
        source: 'admin-panel',
        userId: 'admin123',
      },
      traceId: 'trace-abc-123',
    },
  }
);
```

## Type Exports

All types and interfaces are exported from the main module:

```typescript
import type {
  UnifiedSDKConfig,
  UnifiedResponse,
  ProcessingMetadata,
  TelegramEventData,
  TelegramMessageData,
  ProcessingRules,
  Action,
  DispatchPlan,
  ExecutionResult,
  OrchestrationResult,
} from '@cere-ddc-sdk/unified';
```

## Migration from Individual SDKs

If migrating from direct DDC Client or Activity SDK usage:

```typescript
// Before (DDC Client)
const { cid } = await ddcClient.store(bucketId, data);

// After (Unified SDK)
const result = await sdk.writeData(data);
const cid = result.dataCloudHash;

// Before (Activity SDK)
await eventDispatcher.dispatchEvent(event);

// After (Unified SDK) 
const result = await sdk.writeData({
  eventType: 'user_action',
  userId: 'user123',
  eventData: event.payload,
  timestamp: new Date(),
});
```

The Unified SDK provides a simpler interface while maintaining all the functionality of the individual SDKs with added benefits like automatic routing, fallback mechanisms, and unified error handling.
