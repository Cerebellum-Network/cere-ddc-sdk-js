# Unified Data Ingestion SDK Documentation

## Overview

The Unified Data Ingestion SDK is a comprehensive solution that provides a **single entry point** for data ingestion across multiple Cere ecosystem backends. It intelligently routes data to the appropriate storage and indexing systems based on configurable metadata, with automatic data type detection for Telegram and drone telemetry use cases.

## Key Features

- **🎯 Single Entry Point**: One `writeData()` method handles all data types automatically
- **🤖 Automatic Data Detection**: Intelligently detects data types (Telegram events, messages, drone telemetry) and routes appropriately
- **🧠 Intelligent Routing**: Metadata-driven routing to DDC Client and Activity SDK
- **📱 Telegram Optimized**: Built-in support for Telegram events, messages, and mini-app interactions
- **🔄 Fallback Mechanisms**: Graceful degradation when Activity SDK is unavailable (fallback to DDC storage)
- **⚡ Performance Optimized**: Batching, parallel execution, and resource management
- **🧪 Production Ready**: Comprehensive test coverage with real DDC integration
- **📊 Analytics Integration**: Built-in Activity SDK integration with UriSigner approach

## Quick Start

```typescript
import { UnifiedSDK } from '@cere-ddc-sdk/unified';

// Initialize the SDK
const sdk = new UnifiedSDK({
  ddcConfig: {
    signer: 'your twelve word mnemonic phrase here',
    bucketId: BigInt(573409),
    clusterId: BigInt('0x825c4b2352850de9986d9d28568db6f0c023a1e3'),
    network: 'testnet',
  },
  activityConfig: {
    endpoint: 'https://api.stats.cere.network',
    keyringUri: 'your twelve word mnemonic phrase here',
    appId: '2621',
    connectionId: 'conn_' + Date.now(),
    sessionId: 'sess_' + Date.now(),
    appPubKey: '0x367bd16b9fa69acc8d769add1652799683d68273eae126d2d4bae4d7b8e75bb6',
    dataServicePubKey: '0x8225bda7fc68c17407e933ba8a44a3cbb31ce933ef002fb60337ff63c952b932',
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

await sdk.initialize();

// ✨ One method for all data types - automatically detects and routes:

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

// Custom data with explicit options
const result3 = await sdk.writeData(
  { customData: 'value', analytics: true },
  {
    priority: 'high',
    writeMode: 'realtime',
    metadata: {
      processing: {
        dataCloudWriteMode: 'direct',
        indexWriteMode: 'realtime',
      },
    },
  },
);

console.log('Data stored:', result1.transactionId);
console.log('DDC CID:', result1.dataCloudHash); // Available if stored in DDC
console.log('Activity Event ID:', result1.indexId); // Available if indexed

// Cleanup
await sdk.cleanup();
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              UnifiedSDK (Single Entry Point)               │
├─────────────────────────────────────────────────────────────┤
│  🎯 writeData() - One method for all data types            │
│  • Automatic type detection (Telegram, Drone, Generic)     │
│  • Intelligent routing based on data structure             │
│  • getStatus(), initialize(), cleanup()                    │
└─────────────────┬───────────────────────────┬───────────────┘
                  │                           │
        ┌─────────▼──────────┐      ┌─────────▼──────────┐
        │  RulesInterpreter  │      │    Dispatcher      │
        │                    │      │                    │
        │ • Data Type        │      │ • Route Planning   │
        │   Detection        │      │ • Action Creation  │
        │ • Metadata         │      │ • Priority Mgmt    │
        │   Validation       │      │ • DDC/Activity     │
        │ • Rules Extraction │      │ • Optimization     │
        │ • Optimization     │      │                    │
        └─────────┬──────────┘      └─────────┬──────────┘
                  │                           │
                  └─────────┬─────────────────┘
                            │
                  ┌─────────▼──────────┐
                  │    Orchestrator    │
                  │                    │
                  │ • Execution Engine │
                  │ • Resource Mgmt    │
                  │ • Error Handling   │
                  │ • Fallback Logic   │
                  │ • DDC Client Init  │
                  │ • Activity SDK     │
                  └─────────┬──────────┘
                            │
           ┌────────────────┼────────────────┐
           │                │                │
    ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
    │ DDC Client  │  │Activity SDK │  │ HTTP APIs   │
    │             │  │             │  │ (Future)    │
    │ • Data      │  │ • Events    │  │             │
    │   Storage   │  │ • Analytics │  │ • Webhooks  │
    │ • Files     │  │ • Indexing  │  │ • External  │
    │ • DagNodes  │  │ • Fallback  │  │   Services  │
    └─────────────┘  └─────────────┘  └─────────────┘
```

## Core API

### UnifiedSDK Class

The main entry point for all data ingestion operations.

#### Constructor

```typescript
constructor(config: UnifiedSDKConfig)
```

#### Methods

##### `initialize(): Promise<void>`
Initializes the SDK and all backend clients (DDC Client, Activity SDK).

##### `writeData(payload: any, options?: WriteOptions): Promise<UnifiedResponse>`
**🎯 THE SINGLE ENTRY POINT** - The only data ingestion method that automatically detects data types and routes appropriately.

**This is the ONLY method you need** - it replaces all individual methods by automatically detecting:
- Telegram Events (by `eventType` + `userId` + `timestamp` fields)
- Telegram Messages (by `messageId` + `chatId` + `userId` + `messageType` fields)  
- Drone Telemetry (by `droneId` + `telemetry` + location fields)
- Generic data (fallback for any other structure)

**Parameters:**
- `payload`: The data to ingest (automatically detected type)
- `options`: Optional configuration for this specific write operation

**Returns:** `UnifiedResponse` with transaction details and storage references

##### `getStatus(): object`
Returns the current status of the SDK and its components.

##### `cleanup(): Promise<void>`
Cleans up resources and disconnects from backends.

### Response Format

```typescript
interface UnifiedResponse {
  transactionId: string;
  status: 'success' | 'partial' | 'failed';
  
  // DDC Content Identifier - reference to stored data
  dataCloudHash?: string;
  
  // Activity SDK event identifier for indexed data  
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

## Configuration

### UnifiedSDKConfig

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

### Write Options

```typescript
interface WriteOptions {
  priority?: 'low' | 'normal' | 'high';
  encryption?: boolean;
  writeMode?: 'realtime' | 'batch';
  metadata?: Partial<UnifiedMetadata>;
}
```

### Processing Metadata

Controls how data is processed and routed:

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

## Automatic Data Type Detection

The SDK automatically detects data types based on payload structure:

### Telegram Event Detection
Detected when payload contains:
- `eventType` (string)
- `userId` (string)  
- `timestamp` (Date)

```typescript
{
  eventType: 'quest_completed',
  userId: 'user123',
  chatId: 'chat456', // optional
  eventData: { questId: 'daily', points: 100 },
  timestamp: new Date()
}
```

### Telegram Message Detection
Detected when payload contains:
- `messageId` (string)
- `chatId` (string)
- `userId` (string)
- `messageType` (string)

```typescript
{
  messageId: 'msg123',
  chatId: 'chat456',
  userId: 'user789',
  messageText: 'Hello!',
  messageType: 'text',
  timestamp: new Date()
}
```

### Drone Telemetry Detection
Detected when payload contains:
- `droneId` (string)
- `telemetry` (object)
- `latitude` or `longitude` (number)

### Generic Data
Any data that doesn't match the above patterns is treated as generic data.

## Error Handling & Fallbacks

The SDK implements comprehensive error handling:

### Structured Errors

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

### Fallback Mechanisms

1. **Activity SDK Unavailable**: Falls back to DDC storage only
2. **DDC Storage Failure**: Returns error but preserves Activity SDK indexing
3. **Partial Success**: Returns partial status with successful operations noted

## Integration Examples

### Basic Telegram Bot Integration

```typescript
import { UnifiedSDK } from '@cere-ddc-sdk/unified';
import { Telegraf } from 'telegraf';

const sdk = new UnifiedSDK(config);
await sdk.initialize();

const bot = new Telegraf(process.env.BOT_TOKEN);

// Quest completion
bot.command('quest', async (ctx) => {
  const result = await sdk.writeData({
    eventType: 'quest_completed',
    userId: ctx.from.id.toString(),
    chatId: ctx.chat.id.toString(),
    eventData: { questType: 'daily', points: 100 },
    timestamp: new Date(),
  });
  
  ctx.reply(`Quest completed! Transaction: ${result.transactionId}`);
});

// Message storage
bot.on('text', async (ctx) => {
  await sdk.writeData({
    messageId: ctx.message.message_id.toString(),
    chatId: ctx.chat.id.toString(),
    userId: ctx.from.id.toString(),
    messageText: ctx.message.text,
    messageType: 'text',
    timestamp: new Date(ctx.message.date * 1000),
  });
});
```

### Custom Metadata Example

```typescript
// High priority encrypted data
await sdk.writeData(
  { sensitiveData: 'important info' },
  {
    priority: 'high',
    encryption: true,
    metadata: {
      processing: {
        dataCloudWriteMode: 'direct',
        indexWriteMode: 'realtime',
        ttl: 86400, // 24 hours
      },
    },
  }
);

// Batch mode for high volume
await sdk.writeData(
  bulkDataArray,
  {
    writeMode: 'batch',
    metadata: {
      processing: {
        dataCloudWriteMode: 'batch',
        indexWriteMode: 'realtime',
        batchOptions: {
          maxSize: 50,
          maxWaitTime: 2000,
        },
      },
    },
  }
);
```

## Documentation Navigation

### 📖 **Getting Started**
- **[Usage & Setup Guide](./usage-and-setup-guide.md)** - Complete setup and usage guide with examples
- **[Configuration Guide](./configuration.md)** - Configuration options and environment setup

### 🏗️ **Architecture & Design**
- **[Architecture Guide](./architecture.md)** - Detailed system architecture and patterns
- **[Component Guide](./components.md)** - Deep dive into each component
- **[Design Decisions](./design-decisions.md)** - Rationale behind architectural choices

### 🔧 **Development & Integration**  
- **[API Reference](./api-reference.md)** - Complete API documentation
- **[Testing Guide](./testing-guide.md)** - Comprehensive testing guide
- **[Migration Guide](./migration.md)** - Migrating from individual SDKs

### 📱 **Telegram Integration**
- **[Telegram Guide](./telegram-guide.md)** - Telegram-specific implementation

### 🔧 **Operations & Troubleshooting**
- **[Troubleshooting](./troubleshooting.md)** - Common issues and solutions

## Core Components

| Component            | Purpose              | Responsibilities                                         | File                  |
| -------------------- | -------------------- | -------------------------------------------------------- | --------------------- |
| **UnifiedSDK**       | Main entry point    | API surface, initialization, high-level operations      | UnifiedSDK.ts         |
| **RulesInterpreter** | Metadata processor   | Validation, rule extraction, optimization                | RulesInterpreter.ts   |
| **Dispatcher**       | Route planner        | Action creation, priority management, execution planning | Dispatcher.ts         |
| **Orchestrator**     | Execution engine     | Resource management, error handling, fallback logic     | Orchestrator.ts       |

## Test Coverage & Quality

- **✅ Comprehensive Test Suite** with real DDC integration
- **🏗️ 4-layer architecture** with clear separation of concerns
- **🔒 Comprehensive error handling** with structured error codes
- **📊 Performance metrics** built-in monitoring
- **🔄 Graceful fallbacks** for service unavailability
- **📝 TypeScript support** with full type definitions

## Integration Status

### DDC Integration ✅
- **Status**: Fully operational
- **Features**: Store data as DagNodes, Files, or JSON
- **Networks**: Testnet, Devnet, Mainnet support
- **Performance**: Real-time storage with CID references

### Activity SDK Integration ✅
- **Status**: Fully operational with fallback mode
- **Features**: Event dispatching with UriSigner approach
- **Fallback**: Automatic DDC storage when Activity SDK unavailable
- **Authentication**: ed25519 signatures for Event Service compatibility

## Design Philosophy

### 1. **Single Method Simplicity**
The core principle is **extreme simplicity**: one `writeData()` method that automatically:
- **Detects data types** based on structure
- **Routes intelligently** to appropriate backends  
- **Handles complexity** internally without exposing it to developers
- **Provides consistent interface** regardless of data type or destination

### 2. **Metadata-Driven Architecture**
Instead of hardcoded routing logic, the SDK uses flexible metadata to determine:
- Where data should be stored (DDC vs external)
- How data should be indexed (realtime vs skip)
- Processing priorities and encryption requirements
- Batching and performance optimizations

### 3. **Telegram-First Design**
While the SDK is generic, it's optimized for Telegram use cases:
- **Automatic detection** of Telegram events and messages
- **Intelligent routing** for different Telegram data types
- **Built-in support** for mini-app interactions and user analytics
- **No learning curve** - developers just call `writeData()` with their data

### 4. **Graceful Degradation**
The system is designed to handle failures gracefully:
- If Activity SDK fails, fall back to DDC storage
- If DDC is unavailable, queue for later processing
- Partial success scenarios are handled intelligently

## Getting Started

1. **Install**: `npm install @cere-ddc-sdk/unified`
2. **Configure**: Set up DDC and Activity SDK credentials
3. **Initialize**: Call `sdk.initialize()`
4. **Use**: Call `sdk.writeData()` with any data structure
5. **Monitor**: Check response status and handle errors

The Unified SDK provides the simplest possible interface while maintaining maximum flexibility and reliability for production use cases.
