# Usage and Setup Guide: Unified Data Ingestion SDK

## Table of Contents

1. [Quick Start](#quick-start)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Basic Usage](#basic-usage)
5. [API Reference](#api-reference)
6. [Advanced Features](#advanced-features)
7. [Telegram Integration](#telegram-integration)
8. [Error Handling](#error-handling)
9. [Performance Optimization](#performance-optimization)
10. [Best Practices](#best-practices)
11. [Migration Guide](#migration-guide)
12. [Troubleshooting](#troubleshooting)

## Quick Start

Get up and running with the Unified SDK in 5 minutes:

```bash
# Install the package
npm install @cere-ddc-sdk/unified

# Create your first script
touch my-first-unified-app.js
```

```javascript
import { UnifiedSDK } from '@cere-ddc-sdk/unified';

// Initialize with your credentials
const sdk = new UnifiedSDK({
  ddcConfig: {
    signer: 'your twelve word mnemonic phrase here',
    bucketId: BigInt(573409),
    clusterId: BigInt('0x825c4b2352850de9986d9d28568db6f0c023a1e3'),
    network: 'testnet',
  },
  activityConfig: {
    endpoint: 'https://ai-event.stage.cere.io',
    keyringUri: 'your twelve word mnemonic phrase here',
    appId: '2621',
    appPubKey: '0x367bd16b9fa69acc8d769add1652799683d68273eae126d2d4bae4d7b8e75bb6',
    dataServicePubKey: '0x8225bda7fc68c17407e933ba8a44a3cbb31ce933ef002fb60337ff63c952b932',
  },
});

// Initialize and use
await sdk.initialize();

// ✨ ONE method for all data types - automatically detects and routes
// Telegram Event (auto-detected by eventType, userId, timestamp)
const result1 = await sdk.writeData({
  eventType: 'quest_completed',
  userId: 'user123',
  chatId: 'chat456',
  eventData: { questId: 'daily_checkin', points: 100 },
  timestamp: new Date(),
});

// Telegram Message (auto-detected by messageId, chatId, messageType)
const result2 = await sdk.writeData({
  messageId: 'msg123',
  chatId: 'chat456',
  userId: 'user789',
  messageText: 'Hello from mini-app!',
  messageType: 'text',
  timestamp: new Date(),
});

// Custom data with options
const result3 = await sdk.writeData(
  { analytics: true, userId: 'user123', action: 'click' },
  {
    priority: 'high',
    writeMode: 'direct',
    metadata: {
      processing: {
        dataCloudWriteMode: 'direct',
        indexWriteMode: 'realtime',
      },
    },
  },
);

console.log('Data stored:', result1.transactionId);

// Cleanup
await sdk.cleanup();
```

## Installation

### Prerequisites

- **Node.js:** Version 16 or higher
- **TypeScript:** Version 4.5 or higher (if using TypeScript)
- **Network Access:** Connection to Cere testnet/mainnet

### Package Installation

```bash
# Using npm
npm install @cere-ddc-sdk/unified

# Using yarn
yarn add @cere-ddc-sdk/unified

# Using pnpm
pnpm add @cere-ddc-sdk/unified
```

### Development Installation

For contributing or development:

```bash
# Clone the repository
git clone <repository-url>
cd cere-ddc-sdk-js

# Install dependencies
npm install

# Build all packages
npm run build

# Navigate to unified package
cd packages/unified

# Run tests
npm test
```

### Peer Dependencies

The package requires these peer dependencies:

```json
{
  "@cere-ddc-sdk/ddc-client": "^2.14.1",
  "@cere-activity-sdk/events": "^0.1.7",
  "@cere-activity-sdk/signers": "^0.1.7",
  "@cere-activity-sdk/ciphers": "^0.1.7"
}
```

## Configuration

### Basic Configuration

```javascript
const config = {
  ddcConfig: {
    signer: string, // Mnemonic phrase or private key
    bucketId: bigint, // Your bucket ID
    clusterId: bigint, // Your cluster ID
    network: 'testnet' | 'mainnet',
  },
  activityConfig: {
    endpoint: string, // Activity service endpoint
    keyringUri: string, // Keyring for signing
    appId: string, // Your application ID
    appPubKey: string, // Application public key
    dataServicePubKey: string, // Data service public key
  },
};
```

### Advanced Configuration

```javascript
const advancedConfig = {
  // Core configurations
  ddcConfig: {
    /* ... */
  },
  activityConfig: {
    /* ... */
  },

  // Processing options
  processing: {
    enableBatching: true, // Enable batch processing
    defaultBatchSize: 10, // Default batch size
    defaultBatchTimeout: 5000, // Batch timeout in ms
    maxRetries: 3, // Maximum retry attempts
    retryDelay: 1000, // Delay between retries
  },

  // Logging configuration
  logging: {
    level: 'info' | 'debug' | 'warn' | 'error',
    enableMetrics: true, // Enable performance metrics
    logRequests: false, // Log all requests (debug only)
  },

  // Performance tuning
  performance: {
    connectionTimeout: 30000, // Connection timeout
    requestTimeout: 60000, // Request timeout
    maxConcurrentRequests: 10, // Max parallel requests
  },

  // Error handling
  errorHandling: {
    enableFallbacks: true, // Enable fallback mechanisms
    circuitBreakerThreshold: 5, // Circuit breaker failure threshold
    fallbackToDataCloud: true, // Fallback to DDC when Activity SDK fails
  },
};
```

### Environment-Based Configuration

```javascript
// config/development.js
export const developmentConfig = {
  ddcConfig: {
    network: 'testnet',
    // ... other testnet settings
  },
  logging: {
    level: 'debug',
    enableMetrics: true,
  },
};

// config/production.js
export const productionConfig = {
  ddcConfig: {
    network: 'mainnet',
    // ... other mainnet settings
  },
  logging: {
    level: 'warn',
    enableMetrics: false,
  },
};

// Usage
const config = process.env.NODE_ENV === 'production' ? productionConfig : developmentConfig;
```

### Configuration Validation

The SDK automatically validates configuration using Zod schemas:

```javascript
import { configSchema } from '@cere-ddc-sdk/unified';

try {
  const validatedConfig = configSchema.parse(yourConfig);
  const sdk = new UnifiedSDK(validatedConfig);
} catch (error) {
  console.error('Configuration validation failed:', error.errors);
}
```

## Basic Usage

### Initialize the SDK

```javascript
import { UnifiedSDK } from '@cere-ddc-sdk/unified';

const sdk = new UnifiedSDK(config);

// Initialize (connects to services)
await sdk.initialize();

// Check initialization status
const status = sdk.getStatus();
console.log('SDK ready:', status.initialized);
```

### Store Data with Automatic Detection ⭐

The **core feature** of the Unified SDK is the single `writeData()` method that automatically detects your data type and routes it appropriately:

```javascript
// ✨ Telegram Event - Auto-detected by structure
const eventResult = await sdk.writeData({
  eventType: 'button_click',
  userId: 'user123',
  chatId: 'chat456',
  eventData: { buttonId: 'quest_start', section: 'main_menu' },
  timestamp: new Date(),
});

// ✨ Telegram Message - Auto-detected by structure
const messageResult = await sdk.writeData({
  messageId: 'msg789',
  chatId: 'chat456',
  userId: 'user123',
  messageText: 'Started new quest!',
  messageType: 'text',
  timestamp: new Date(),
});

// ✨ Custom Data - You control the routing
const customResult = await sdk.writeData(
  {
    analytics: { pageView: '/dashboard', duration: 45000 },
    userId: 'user123',
    sessionId: 'session456',
  },
  {
    priority: 'low',
    writeMode: 'batch',
    encryption: false,
  },
);

// ✨ Drone Telemetry - Auto-detected by structure
const droneResult = await sdk.writeData({
  droneId: 'drone_001',
  telemetry: {
    latitude: 37.7749,
    longitude: -122.4194,
    altitude: 150,
    speed: 12.5,
  },
  timestamp: new Date(),
});
```

### Auto-Detection Logic

The SDK automatically detects data types based on structure:

| Data Type            | Detection Criteria                      | Example Fields                                                               |
| -------------------- | --------------------------------------- | ---------------------------------------------------------------------------- |
| **Telegram Event**   | `eventType` + `userId` + `timestamp`    | `{ eventType: 'quest_completed', userId: 'user123', timestamp: new Date() }` |
| **Telegram Message** | `messageId` + `chatId` + `messageType`  | `{ messageId: 'msg123', chatId: 'chat456', messageType: 'text' }`            |
| **Drone Telemetry**  | `droneId` + `telemetry` + location data | `{ droneId: 'drone_001', telemetry: {...}, timestamp: new Date() }`          |
| **Drone Video**      | `droneId` + video-related fields        | `{ droneId: 'drone_001', videoData: {...} }`                                 |
| **Generic Data**     | Any other structure                     | `{ customField: 'value', data: {...} }`                                      |

### Simple vs Advanced Usage

**Simple Usage (Recommended for 80% of cases):**

```javascript
// Just pass your data - the SDK handles everything
await sdk.writeData(yourTelegramEventData);
await sdk.writeData(yourTelegramMessageData);
await sdk.writeData(yourCustomData);
```

**Advanced Usage (For fine control):**

```javascript
// Override routing with explicit options
await sdk.writeData(yourData, {
  priority: 'high',
  writeMode: 'direct',
  encryption: true,
  ttl: 3600,
  metadata: {
    processing: {
      dataCloudWriteMode: 'viaIndex',
      indexWriteMode: 'realtime',
    },
    user_context: { source: 'mobile_app' },
    trace_id: 'req_12345',
  },
});
```

### Query Status

```javascript
// Get SDK status
const status = sdk.getStatus();
console.log('SDK Status:', {
  initialized: status.initialized,
  ddcConnected: status.ddcConnected,
  activitySDKConnected: status.activitySDKConnected,
  lastError: status.lastError,
  metrics: status.metrics,
});

// Get detailed metrics
const metrics = sdk.getMetrics();
console.log('Performance Metrics:', {
  totalRequests: metrics.totalRequests,
  successRate: metrics.successRate,
  averageLatency: metrics.averageLatency,
  errorRate: metrics.errorRate,
});
```

### Cleanup

```javascript
// Always cleanup when done
await sdk.cleanup();
```

## API Reference

### UnifiedSDK Class

#### Constructor

```typescript
new UnifiedSDK(config: UnifiedSDKConfig)
```

#### Methods

##### `initialize(): Promise<void>`

Initializes the SDK and establishes connections to DDC and Activity SDK.

```javascript
await sdk.initialize();
```

##### `writeData(data: any, metadata?: DataMetadata): Promise<IngestionResult>`

Stores arbitrary data with optional metadata.

```javascript
const result = await sdk.writeData(
  { key: 'value' },
  { processing: { dataCloudWriteMode: 'direct', indexWriteMode: 'realtime' } },
);
```

##### `writeTelegramEvent(event: TelegramEvent, options?: TelegramOptions): Promise<IngestionResult>`

Stores Telegram-specific events with optimized handling.

```javascript
const result = await sdk.writeTelegramEvent({
  eventType: 'quest_completed',
  userId: 'telegram_user_123',
  chatId: 'chat_456',
  eventData: { questId: 'daily-login', points: 100 },
  timestamp: new Date(),
});
```

##### `writeTelegramMessage(message: TelegramMessage, options?: TelegramOptions): Promise<IngestionResult>`

Stores Telegram messages with metadata.

```javascript
const result = await sdk.writeTelegramMessage({
  messageId: 'msg_123',
  chatId: 'chat_456',
  userId: 'user_789',
  messageText: 'Hello, world!',
  messageType: 'text',
  timestamp: new Date(),
});
```

##### `getStatus(): SDKStatus`

Returns current SDK status and connection information.

```javascript
const status = sdk.getStatus();
```

##### `getMetrics(): PerformanceMetrics`

Returns performance metrics and statistics.

```javascript
const metrics = sdk.getMetrics();
```

##### `cleanup(): Promise<void>`

Cleans up resources and closes connections.

```javascript
await sdk.cleanup();
```

### Data Types

#### DataMetadata

```typescript
interface DataMetadata {
  processing: {
    dataCloudWriteMode: 'direct' | 'batch' | 'viaIndex' | 'skip';
    indexWriteMode: 'realtime' | 'skip';
    priority?: 'low' | 'normal' | 'high';
    ttl?: number; // Time to live in seconds
    encryption?: boolean; // Enable encryption
    batchOptions?: {
      maxSize?: number; // Maximum batch size
      maxWaitTime?: number; // Maximum wait time in ms
    };
  };
  classification?: {
    dataType?: string; // Data classification
    sensitivity?: 'public' | 'private' | 'confidential';
    retention?: number; // Retention period in days
  };
  routing?: {
    preferredNode?: string; // Preferred storage node
    region?: string; // Preferred region
    replicationFactor?: number; // Number of replicas
  };
}
```

#### TelegramEvent

```typescript
interface TelegramEvent {
  eventType: 'quest_completed' | 'user_action' | 'mini_app_interaction' | string;
  userId: string;
  chatId: string;
  eventData: Record<string, any>;
  timestamp: Date;
  metadata?: Record<string, any>;
}
```

#### IngestionResult

```typescript
interface IngestionResult {
  transactionId: string;
  status: 'success' | 'partial_success' | 'failed';
  dataCloudHash?: string; // DDC content hash
  indexId?: string; // Activity SDK event ID
  errors?: Array<{
    code: string;
    message: string;
    component: 'ddc' | 'activity' | 'validation';
  }>;
  metadata: {
    processingTime: number; // Processing time in ms
    retryCount: number; // Number of retries
    fallbackUsed: boolean; // Whether fallback was used
  };
}
```

## Advanced Features

### Custom Processing Rules

```javascript
const customMetadata = {
  processing: {
    dataCloudWriteMode: 'direct',
    indexWriteMode: 'realtime',
    priority: 'high',
    ttl: 86400, // 24 hours
    encryption: true,
  },
  classification: {
    dataType: 'user_interaction',
    sensitivity: 'private',
    retention: 365, // 1 year
  },
  routing: {
    preferredNode: 'node-eu-west-1',
    region: 'europe',
    replicationFactor: 3,
  },
};

await sdk.writeData(sensitiveData, { ...customMetadata });
```

### Conditional Processing

```javascript
const processUserData = async (userData) => {
  const isHighValue = userData.transactionAmount > 1000;

  const metadata = {
    processing: {
      dataCloudWriteMode: isHighValue ? 'direct' : 'batch',
      indexWriteMode: isHighValue ? 'realtime' : 'skip',
      priority: isHighValue ? 'high' : 'normal',
    },
  };

  return await sdk.writeData(userData, metadata);
};
```

### Bulk Operations

```javascript
const bulkInsert = async (dataArray) => {
  const batchSize = 50;
  const results = [];

  for (let i = 0; i < dataArray.length; i += batchSize) {
    const batch = dataArray.slice(i, i + batchSize);

    const batchResults = await Promise.allSettled(
      batch.map((data) =>
        sdk.writeData(data, {
          processing: {
            dataCloudWriteMode: 'batch',
            indexWriteMode: 'realtime',
          },
        }),
      ),
    );

    results.push(...batchResults);
  }

  return results;
};
```

### Streaming Data

```javascript
import { Readable } from 'stream';

const dataStream = new Readable({
  objectMode: true,
  read() {
    // Generate data
    this.push({ timestamp: Date.now(), value: Math.random() });
  },
});

dataStream.on('data', async (chunk) => {
  try {
    await sdk.writeData(chunk, {
      processing: {
        dataCloudWriteMode: 'batch',
        indexWriteMode: 'skip', // Skip indexing for high-volume streams
      },
    });
  } catch (error) {
    console.error('Stream processing error:', error);
  }
});
```

## Telegram Integration

### Telegram Bot Integration

```javascript
import TelegramBot from 'node-telegram-bot-api';

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Handle messages
bot.on('message', async (msg) => {
  const telegramMessage = {
    messageId: msg.message_id.toString(),
    chatId: msg.chat.id.toString(),
    userId: msg.from.id.toString(),
    messageText: msg.text,
    messageType: 'text',
    timestamp: new Date(msg.date * 1000),
  };

  try {
    const result = await sdk.writeTelegramMessage(telegramMessage, {
      priority: 'normal',
      writeMode: 'realtime',
    });

    console.log('Message stored:', result.transactionId);
  } catch (error) {
    console.error('Failed to store message:', error);
  }
});

// Handle callback queries (inline buttons)
bot.on('callback_query', async (query) => {
  const telegramEvent = {
    eventType: 'button_click',
    userId: query.from.id.toString(),
    chatId: query.message.chat.id.toString(),
    eventData: {
      buttonData: query.data,
      messageId: query.message.message_id,
    },
    timestamp: new Date(),
  };

  await sdk.writeTelegramEvent(telegramEvent, {
    priority: 'high',
    writeMode: 'realtime',
  });
});
```

### Mini App Integration

```javascript
// Handle Mini App events
const handleMiniAppEvent = async (eventData) => {
  const telegramEvent = {
    eventType: 'mini_app_interaction',
    userId: eventData.userId,
    chatId: eventData.chatId,
    eventData: {
      appName: eventData.appName,
      action: eventData.action,
      payload: eventData.payload,
    },
    timestamp: new Date(),
  };

  return await sdk.writeTelegramEvent(telegramEvent, {
    priority: 'normal',
    writeMode: 'realtime',
  });
};

// Quest completion
const handleQuestCompletion = async (questData) => {
  const telegramEvent = {
    eventType: 'quest_completed',
    userId: questData.userId,
    chatId: questData.chatId,
    eventData: {
      questId: questData.questId,
      points: questData.points,
      level: questData.level,
      completionTime: questData.completionTime,
    },
    timestamp: new Date(),
  };

  return await sdk.writeTelegramEvent(telegramEvent, {
    priority: 'high',
    writeMode: 'realtime',
  });
};
```

## Error Handling

### Error Types

The SDK provides structured error handling with specific error codes:

```javascript
try {
  await sdk.writeData(data, metadata);
} catch (error) {
  switch (error.code) {
    case 'INVALID_CONFIG':
      console.error('Configuration error:', error.message);
      break;
    case 'DDC_CONNECTION_FAILED':
      console.error('DDC connection failed:', error.message);
      break;
    case 'ACTIVITY_SDK_UNAVAILABLE':
      console.warn('Activity SDK unavailable, using fallback');
      break;
    case 'VALIDATION_ERROR':
      console.error('Data validation failed:', error.details);
      break;
    case 'NETWORK_ERROR':
      console.error('Network error:', error.message);
      break;
    default:
      console.error('Unexpected error:', error);
  }
}
```

### Retry Logic

```javascript
const writeDataWithRetry = async (data, metadata, maxRetries = 3) => {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await sdk.writeData(data, metadata);
    } catch (error) {
      lastError = error;

      // Don't retry validation errors
      if (error.code === 'VALIDATION_ERROR') {
        throw error;
      }

      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay));
        console.log(`Retry attempt ${attempt + 1} after ${delay}ms`);
      }
    }
  }

  throw lastError;
};
```

### Graceful Fallbacks

```javascript
const writeDataWithFallback = async (data, metadata) => {
  try {
    // Try with full metadata
    return await sdk.writeData(data, metadata);
  } catch (error) {
    if (error.code === 'ACTIVITY_SDK_UNAVAILABLE') {
      // Fallback to DDC only
      console.warn('Activity SDK unavailable, falling back to DDC only');

      const fallbackMetadata = {
        ...metadata,
        processing: {
          ...metadata.processing,
          indexWriteMode: 'skip', // Skip indexing
        },
      };

      return await sdk.writeData(data, fallbackMetadata);
    }

    throw error;
  }
};
```

## Performance Optimization

### Connection Pooling

```javascript
const sdk = new UnifiedSDK({
  ...config,
  performance: {
    connectionTimeout: 30000,
    requestTimeout: 60000,
    maxConcurrentRequests: 20,
    keepAliveTimeout: 300000,
  },
});
```

### Batch Processing

```javascript
class BatchProcessor {
  constructor(sdk, options = {}) {
    this.sdk = sdk;
    this.batchSize = options.batchSize || 100;
    this.flushInterval = options.flushInterval || 5000;
    this.batch = [];
    this.timer = null;
  }

  async add(data, metadata) {
    this.batch.push({ data, metadata });

    if (this.batch.length >= this.batchSize) {
      await this.flush();
    } else if (!this.timer) {
      this.timer = setTimeout(() => this.flush(), this.flushInterval);
    }
  }

  async flush() {
    if (this.batch.length === 0) return;

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    const currentBatch = this.batch.splice(0);

    const results = await Promise.allSettled(
      currentBatch.map(({ data, metadata }) => this.sdk.writeData(data, metadata)),
    );

    return results;
  }
}

// Usage
const processor = new BatchProcessor(sdk, {
  batchSize: 50,
  flushInterval: 3000,
});

// Add data
await processor.add(userData, metadata);

// Ensure all data is flushed
await processor.flush();
```

### Memory Management

```javascript
const monitorMemory = () => {
  const usage = process.memoryUsage();

  if (usage.heapUsed > 500 * 1024 * 1024) {
    // 500MB
    console.warn('High memory usage detected:', {
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024) + 'MB',
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024) + 'MB',
    });

    // Force garbage collection if possible
    if (global.gc) {
      global.gc();
    }
  }
};

// Monitor every 30 seconds
setInterval(monitorMemory, 30000);
```

## Best Practices

### 1. Configuration Management

```javascript
// ✅ Good: Environment-based configuration
const config = {
  ddcConfig: {
    signer: process.env.DDC_SIGNER,
    bucketId: BigInt(process.env.DDC_BUCKET_ID),
    clusterId: BigInt(process.env.DDC_CLUSTER_ID),
    network: process.env.NODE_ENV === 'production' ? 'mainnet' : 'testnet',
  },
  // ... other config
};

// ❌ Bad: Hardcoded credentials
const config = {
  ddcConfig: {
    signer: 'hybrid label reunion only dawn maze...',
    // Never hardcode credentials!
  },
};
```

### 2. Error Handling

```javascript
// ✅ Good: Comprehensive error handling
try {
  const result = await sdk.writeData(data, metadata);
  return result;
} catch (error) {
  // Log error with context
  console.error('Data ingestion failed:', {
    errorCode: error.code,
    message: error.message,
    dataSize: JSON.stringify(data).length,
    metadata: metadata,
  });

  // Handle specific error types
  if (error.code === 'VALIDATION_ERROR') {
    throw new Error(`Invalid data format: ${error.message}`);
  }

  // Re-throw for upstream handling
  throw error;
}

// ❌ Bad: Silently catching errors
try {
  await sdk.writeData(data, metadata);
} catch (error) {
  // Silently ignore - very bad!
}
```

### 3. Resource Management

```javascript
// ✅ Good: Proper cleanup
class DataService {
  constructor(config) {
    this.sdk = new UnifiedSDK(config);
  }

  async initialize() {
    await this.sdk.initialize();
  }

  async processData(data) {
    return await this.sdk.writeData(data, this.getMetadata());
  }

  async shutdown() {
    await this.sdk.cleanup();
  }
}

// Usage with proper cleanup
const service = new DataService(config);
await service.initialize();

process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await service.shutdown();
  process.exit(0);
});
```

### 4. Data Validation

```javascript
// ✅ Good: Validate data before sending
const validateUserData = (data) => {
  if (!data.userId) throw new Error('userId is required');
  if (!data.timestamp) data.timestamp = new Date().toISOString();
  if (typeof data.userId !== 'string') throw new Error('userId must be string');

  return data;
};

const processUserAction = async (rawData) => {
  const validatedData = validateUserData(rawData);
  return await sdk.writeData(validatedData, metadata);
};
```

### 5. Monitoring and Metrics

```javascript
// ✅ Good: Monitor SDK performance
const monitorSDK = () => {
  const status = sdk.getStatus();
  const metrics = sdk.getMetrics();

  console.log('SDK Health Check:', {
    connected: status.initialized,
    successRate: metrics.successRate,
    averageLatency: metrics.averageLatency,
    errorRate: metrics.errorRate,
  });

  // Alert if performance degrades
  if (metrics.successRate < 0.95) {
    console.warn('Low success rate detected:', metrics.successRate);
  }

  if (metrics.averageLatency > 5000) {
    console.warn('High latency detected:', metrics.averageLatency);
  }
};

// Monitor every minute
setInterval(monitorSDK, 60000);
```

## Migration Guide

### From DDC Client v1.x

```javascript
// Old DDC Client usage
import { DdcClient } from '@cere-ddc-sdk/ddc-client';

const ddcClient = new DdcClient(config);
await ddcClient.connect();
const cid = await ddcClient.store(bucketId, data);

// New Unified SDK usage
import { UnifiedSDK } from '@cere-ddc-sdk/unified';

const sdk = new UnifiedSDK({
  ddcConfig: config,
  // Add Activity SDK config for indexing
});

await sdk.initialize();
const result = await sdk.writeData(data, {
  processing: { dataCloudWriteMode: 'direct', indexWriteMode: 'realtime' },
});
```

### From Activity SDK Direct Usage

```javascript
// Old Activity SDK usage
import { ActivityEventsClient } from '@cere-activity-sdk/events';

const client = new ActivityEventsClient(config);
const event = await client.dispatchEvent(eventData);

// New Unified SDK usage
const result = await sdk.writeData(eventData, {
  processing: { dataCloudWriteMode: 'viaIndex', indexWriteMode: 'realtime' },
});
```

## Troubleshooting

### Common Issues

#### 1. Connection Timeout

```javascript
// Problem: Connection timeouts
// Solution: Increase timeout values
const config = {
  ...baseConfig,
  performance: {
    connectionTimeout: 60000, // Increase to 60 seconds
    requestTimeout: 120000, // Increase to 120 seconds
  },
};
```

#### 2. Memory Leaks

```javascript
// Problem: Memory usage keeps growing
// Solution: Ensure proper cleanup
const processData = async (dataArray) => {
  const sdk = new UnifiedSDK(config);

  try {
    await sdk.initialize();

    for (const data of dataArray) {
      await sdk.writeData(data, metadata);
    }
  } finally {
    // Always cleanup
    await sdk.cleanup();
  }
};
```

#### 3. Activity SDK Connection Issues

```javascript
// Problem: Activity SDK connection fails
// Solution: Enable fallback mode
const config = {
  ...baseConfig,
  errorHandling: {
    enableFallbacks: true,
    fallbackToDataCloud: true,
  },
};
```

### Debug Mode

Enable detailed logging:

```javascript
const config = {
  ...baseConfig,
  logging: {
    level: 'debug',
    enableMetrics: true,
    logRequests: true,
  },
};
```

### Health Checks

```javascript
const healthCheck = async () => {
  try {
    const status = sdk.getStatus();

    if (!status.initialized) {
      throw new Error('SDK not initialized');
    }

    if (!status.ddcConnected) {
      throw new Error('DDC connection lost');
    }

    // Test with a small data write
    await sdk.writeData(
      { healthCheck: true, timestamp: Date.now() },
      { processing: { dataCloudWriteMode: 'direct', indexWriteMode: 'skip' } },
    );

    return { healthy: true, status };
  } catch (error) {
    return { healthy: false, error: error.message };
  }
};
```

### Performance Debugging

```javascript
const performanceTest = async () => {
  const testData = { test: 'performance', data: 'x'.repeat(1000) };
  const iterations = 100;

  const startTime = Date.now();
  const results = [];

  for (let i = 0; i < iterations; i++) {
    const opStart = Date.now();

    try {
      await sdk.writeData(testData, {
        processing: { dataCloudWriteMode: 'direct', indexWriteMode: 'skip' },
      });
      results.push({ success: true, duration: Date.now() - opStart });
    } catch (error) {
      results.push({ success: false, duration: Date.now() - opStart, error });
    }
  }

  const totalTime = Date.now() - startTime;
  const successCount = results.filter((r) => r.success).length;
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;

  console.log('Performance Test Results:', {
    iterations,
    totalTime,
    successRate: (successCount / iterations) * 100,
    averageDuration: avgDuration,
    throughput: (iterations / totalTime) * 1000, // ops per second
  });
};
```

## Conclusion

This guide covers the essential aspects of using the Unified Data Ingestion SDK. For additional help:

- Check the [Comprehensive Analysis Report](./comprehensive-analysis-report.md)
- Review the [Testing Guide](./testing-guide.md)
- Consult the [Troubleshooting Guide](./troubleshooting.md)
- Check the API documentation in the `docs/` directory

For issues or feature requests, please refer to the project repository or contact the Cere development team.
