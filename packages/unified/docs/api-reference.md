# API Reference

## UnifiedSDK

The main entry point for the Unified Data Ingestion SDK.

### Constructor

```typescript
constructor(config: UnifiedSDKConfig)
```

Creates a new instance of the UnifiedSDK.

**Parameters:**

- `config` - Configuration object (see [Configuration](#configuration))

**Example:**

```typescript
const sdk = new UnifiedSDK({
  ddcConfig: {
    signer: '//Alice',
    bucketId: BigInt(12345),
    network: 'testnet',
  },
  activityConfig: {
    keyringUri: '//Alice',
    appId: 'my-telegram-bot',
    endpoint: 'https://api.stats.cere.network',
    appPubKey: 'your-app-key',
    dataServicePubKey: 'service-key',
  },
});
```

### Methods

#### initialize()

```typescript
async initialize(): Promise<void>
```

Initializes the SDK and its dependencies. Must be called before using other methods.

**Throws:**

- `UnifiedSDKError` - If initialization fails

**Example:**

```typescript
await sdk.initialize();
```

#### writeTelegramEvent()

```typescript
async writeTelegramEvent(
  eventData: TelegramEventData,
  options?: TelegramOptions
): Promise<UnifiedResponse>
```

Writes a Telegram event to the appropriate storage and indexing systems.

**Parameters:**

- `eventData` - Telegram event data (see [TelegramEventData](#telegrameventdata))
- `options` - Optional routing and processing options (see [TelegramOptions](#telegramoptions))

**Returns:**

- `Promise<UnifiedResponse>` - Unified response with results from all targets

**Example:**

```typescript
const response = await sdk.writeTelegramEvent({
  eventType: 'quest_completed',
  userId: 'user123',
  chatId: 'chat456',
  eventData: { questId: 'daily_checkin', points: 100 },
  timestamp: new Date(),
});
```

#### writeTelegramMessage()

```typescript
async writeTelegramMessage(
  messageData: TelegramMessageData,
  options?: TelegramOptions
): Promise<UnifiedResponse>
```

Writes a Telegram message to the appropriate storage and indexing systems.

**Parameters:**

- `messageData` - Telegram message data (see [TelegramMessageData](#telegrammessagedata))
- `options` - Optional routing and processing options (see [TelegramOptions](#telegramoptions))

**Returns:**

- `Promise<UnifiedResponse>` - Unified response with results from all targets

**Example:**

```typescript
const response = await sdk.writeTelegramMessage({
  messageId: 'msg123',
  chatId: 'chat456',
  userId: 'user789',
  messageText: 'Hello from mini-app!',
  messageType: 'text',
  timestamp: new Date(),
});
```

#### writeData()

```typescript
async writeData(payload: any, metadata: Metadata): Promise<UnifiedResponse>
```

Generic method for writing any data with custom metadata.

**Parameters:**

- `payload` - Data to be stored/indexed
- `metadata` - Processing metadata (see [Metadata](#metadata))

**Returns:**

- `Promise<UnifiedResponse>` - Unified response with results from all targets

**Example:**

```typescript
const response = await sdk.writeData(
  { customData: 'value' },
  {
    processing: {
      dataCloudWriteMode: 'direct',
      indexWriteMode: 'realtime',
      priority: 'high',
    },
  },
);
```

#### getStatus()

```typescript
getStatus(): SDKStatus
```

Returns the current status of the SDK and its components.

**Returns:**

- `SDKStatus` - Current SDK status (see [SDKStatus](#sdkstatus))

**Example:**

```typescript
const status = sdk.getStatus();
console.log('SDK initialized:', status.initialized);
console.log('DDC available:', status.ddcAvailable);
console.log('Activity SDK available:', status.activitySdkAvailable);
```

#### cleanup()

```typescript
async cleanup(): Promise<void>
```

Cleans up resources and connections. Should be called when the SDK is no longer needed.

**Example:**

```typescript
await sdk.cleanup();
```

---

## Types and Interfaces

### UnifiedSDKConfig

Configuration object for initializing the SDK.

```typescript
interface UnifiedSDKConfig {
  ddcConfig: DDCConfig;
  activityConfig?: ActivityConfig;
  processing?: ProcessingConfig;
  logging?: LoggingConfig;
}
```

#### DDCConfig

```typescript
interface DDCConfig {
  signer: string; // Substrate signer (//Alice or mnemonic)
  bucketId: bigint; // DDC bucket ID
  network: 'mainnet' | 'testnet'; // Network to connect to
  clusterId?: string; // Optional cluster ID
}
```

#### ActivityConfig

```typescript
interface ActivityConfig {
  keyringUri: string; // Substrate URI for signing
  appId: string; // Application identifier
  endpoint: string; // Activity SDK endpoint
  appPubKey: string; // Application public key
  dataServicePubKey: string; // Data service public key
  connectionId?: string; // Optional connection ID
  sessionId?: string; // Optional session ID
}
```

#### ProcessingConfig

```typescript
interface ProcessingConfig {
  enableBatching: boolean; // Enable automatic batching
  defaultBatchSize: number; // Default batch size
  defaultBatchTimeout: number; // Batch timeout in milliseconds
  maxRetries: number; // Maximum retry attempts
  retryDelay: number; // Delay between retries in milliseconds
}
```

#### LoggingConfig

```typescript
interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error'; // Logging level
  enableMetrics: boolean; // Enable metrics collection
}
```

### TelegramEventData

Represents a Telegram event (user action, interaction, etc.).

```typescript
interface TelegramEventData {
  eventType: string; // Type of event
  userId: string; // Telegram user ID
  chatId?: string; // Optional chat ID
  eventData: any; // Event-specific data
  timestamp: Date; // Event timestamp
  messageId?: string; // Optional related message ID
  botId?: string; // Optional bot identifier
  miniAppId?: string; // Optional mini-app identifier
}
```

### TelegramMessageData

Represents a Telegram message.

```typescript
interface TelegramMessageData {
  messageId: string; // Unique message identifier
  chatId: string; // Chat ID
  userId: string; // User ID who sent the message
  messageText?: string; // Text content (for text messages)
  messageType: TelegramMessageType; // Type of message
  timestamp: Date; // Message timestamp
  replyToMessageId?: string; // ID of message being replied to
  metadata?: any; // Additional metadata
}

type TelegramMessageType = 'text' | 'photo' | 'video' | 'document' | 'sticker' | 'voice' | 'location' | 'contact';
```

### TelegramOptions

Optional configuration for Telegram-specific operations.

```typescript
interface TelegramOptions {
  writeMode?: 'direct' | 'batch' | 'viaIndex'; // How to write data
  priority?: 'low' | 'normal' | 'high'; // Processing priority
  encryption?: boolean; // Whether to encrypt data
  ttl?: number; // Time-to-live in seconds
}
```

### Metadata

Generic metadata for controlling data processing.

```typescript
interface Metadata {
  processing: ProcessingMetadata;
}

interface ProcessingMetadata {
  dataCloudWriteMode: DataCloudWriteMode;
  indexWriteMode: IndexWriteMode;
  priority?: Priority;
  encryption?: boolean;
  ttl?: number;
  batchOptions?: BatchOptions;
}

type DataCloudWriteMode = 'direct' | 'batch' | 'viaIndex' | 'skip';
type IndexWriteMode = 'realtime' | 'skip';
type Priority = 'low' | 'normal' | 'high';
```

### UnifiedResponse

Response object returned by all write operations.

```typescript
interface UnifiedResponse {
  success: boolean; // Overall success status
  transactionId: string; // Unique transaction identifier
  results: ActionResult[]; // Results from individual actions
  metadata: ResponseMetadata; // Response metadata

  /**
   * DDC Content Identifier (CID) - returned when data is stored in DDC
   * This CID can be used to:
   * - Reference original data sources in conversation streams
   * - Link data across different systems and databases
   * - Verify data integrity and immutability
   * - Build audit trails and data provenance systems
   */
  dataCloudHash?: string;

  activityEventId?: string; // Activity SDK event ID (if indexed)
}

interface ActionResult {
  target: string; // Target system ('ddc-client', 'activity-sdk', etc.)
  success: boolean; // Whether this action succeeded
  response?: any; // Response data from the target
  error?: string; // Error message if failed
  executionTime: number; // Execution time in milliseconds
}

interface ResponseMetadata {
  processingTime: number; // Total processing time
  routingDecisions: string[]; // Routing decisions made
  fallbacksUsed: string[]; // Any fallbacks that were used
}
```

**CID Usage Examples:**

```typescript
// Store data and get CID for future reference
const response = await sdk.writeTelegramMessage(messageData, {
  writeMode: 'direct', // Ensures DDC storage and CID return
});

if (response.dataCloudHash) {
  // Use CID in conversation streams
  await conversationDB.addMessage({
    messageId: messageData.messageId,
    originalDataCID: response.dataCloudHash, // Link to immutable data
    timestamp: new Date(),
  });

  // Reference in external systems
  await notifyOtherSystem({
    dataReference: response.dataCloudHash,
    network: 'cere-ddc',
  });
}
```

### SDKStatus

Current status of the SDK and its components.

```typescript
interface SDKStatus {
  initialized: boolean; // Whether SDK is initialized
  ddcAvailable: boolean; // Whether DDC client is available
  activitySdkAvailable: boolean; // Whether Activity SDK is available
  version: string; // SDK version
  lastHealthCheck: Date; // Last health check timestamp
  errors: string[]; // Any current errors
}
```

---

## Error Types

### UnifiedSDKError

Base error class for all SDK errors.

```typescript
class UnifiedSDKError extends Error {
  constructor(
    message: string,
    public code: string,
    public component: string,
    public cause?: Error
  );
}
```

**Error Codes:**

- `CONFIG_INVALID` - Invalid configuration
- `INIT_FAILED` - Initialization failed
- `VALIDATION_FAILED` - Data validation failed
- `NETWORK_ERROR` - Network connectivity issue
- `SERVICE_UNAVAILABLE` - External service unavailable
- `PROCESSING_FAILED` - Data processing failed

### ValidationError

Specific error for validation failures.

```typescript
class ValidationError extends UnifiedSDKError {
  constructor(
    message: string,
    public field: string,
    public value: any
  );
}
```

---

## Constants

### Default Values

```typescript
const DEFAULT_CONFIG = {
  processing: {
    enableBatching: true,
    defaultBatchSize: 50,
    defaultBatchTimeout: 5000,
    maxRetries: 3,
    retryDelay: 1000,
  },
  logging: {
    level: 'info',
    enableMetrics: true,
  },
};
```

### Network Endpoints

```typescript
const NETWORKS = {
  mainnet: {
    blockchain: 'wss://rpc.mainnet.cere.network/ws',
    activityEndpoint: 'https://api.stats.cere.network',
  },
  testnet: {
    blockchain: 'wss://rpc.testnet.cere.network/ws',
    activityEndpoint: 'https://api.stats.testnet.cere.network',
  },
};
```

---

## Usage Patterns

### Basic Telegram Bot

```typescript
import { UnifiedSDK } from '@cere-ddc-sdk/unified';

const sdk = new UnifiedSDK({
  ddcConfig: {
    signer: process.env.SIGNER_KEY!,
    bucketId: BigInt(process.env.BUCKET_ID!),
    network: 'testnet',
  },
  activityConfig: {
    keyringUri: process.env.ACTIVITY_SIGNER!,
    appId: 'telegram-bot',
    endpoint: 'https://api.stats.testnet.cere.network',
    appPubKey: process.env.APP_PUB_KEY!,
    dataServicePubKey: process.env.SERVICE_PUB_KEY!,
  },
});

await sdk.initialize();

// Track user events
bot.on('callback_query', async (query) => {
  await sdk.writeTelegramEvent({
    eventType: 'button_click',
    userId: query.from.id.toString(),
    chatId: query.message?.chat.id.toString(),
    eventData: {
      buttonData: query.data,
      messageId: query.message?.message_id,
    },
    timestamp: new Date(),
  });
});

// Track messages
bot.on('message', async (msg) => {
  await sdk.writeTelegramMessage({
    messageId: msg.message_id.toString(),
    chatId: msg.chat.id.toString(),
    userId: msg.from?.id.toString() || 'unknown',
    messageText: msg.text,
    messageType: 'text',
    timestamp: new Date(msg.date * 1000),
  });
});
```

### High-Volume Processing

```typescript
// Configure for high-volume scenarios
const sdk = new UnifiedSDK({
  ddcConfig: {
    /* ... */
  },
  activityConfig: {
    /* ... */
  },
  processing: {
    enableBatching: true,
    defaultBatchSize: 100, // Larger batches
    defaultBatchTimeout: 2000, // Shorter timeout
    maxRetries: 5,
    retryDelay: 500,
  },
});

// Process multiple events efficiently
const events = await getEventsFromQueue();
for (const event of events) {
  // These will be automatically batched
  sdk.writeTelegramEvent(event, { writeMode: 'batch' });
}
```

### Custom Data Processing

```typescript
// Use generic writeData for custom scenarios
await sdk.writeData(
  {
    type: 'custom_analytics',
    data: analyticsData,
  },
  {
    processing: {
      dataCloudWriteMode: 'skip', // Don't store in DDC
      indexWriteMode: 'realtime', // Only index for analytics
      priority: 'low',
      encryption: false,
    },
  },
);
```

This API reference provides comprehensive documentation for all public methods, types, and usage patterns of the Unified Data Ingestion SDK.
