# @cere-ddc-sdk/unified

Unified Data Ingestion SDK - Single entry point for all data ingestion operations in the Cere ecosystem.

## Overview

The Unified SDK provides a simplified, high-level interface for ingesting data into the Cere ecosystem. It automatically routes data to appropriate backend systems (Data Cloud, Activity SDK) based on configurable metadata, hiding the complexity of managing multiple SDKs and their interactions.

## Key Features

- **Single Entry Point**: One SDK to handle all data ingestion needs
- **Intelligent Routing**: Automatically routes data based on processing rules
- **Flexible Metadata**: Rich metadata schema for controlling data processing
- **Error Handling**: Comprehensive error handling and recovery mechanisms
- **Telegram Optimized**: Built-in support for Telegram use cases
- **Extensible**: Modular architecture for easy extension

## Architecture

The Unified SDK follows a modular architecture with four main components:

1. **Rules Interpreter**: Validates metadata and extracts processing rules
2. **Dispatcher**: Translates rules into concrete actions for backend systems
3. **Orchestrator**: Manages execution of actions with error handling
4. **Unified SDK**: Main entry point that coordinates all components

## Installation

```bash
npm install @cere-ddc-sdk/unified
```

## Activity SDK Integration

The Unified SDK integrates with the real Activity SDK for event processing using the UriSigner approach for simplified setup.

### Configuration

```typescript
const config = {
  ddcConfig: {
    signer: 'bottom drive obey lake curtain smoke basket hold race lonely fit walk//Alice',
    bucketId: BigInt(12345),
    network: 'testnet',
  },
  activityConfig: {
    endpoint: 'https://api.stats.cere.network',
    keyringUri: '//Alice', // Substrate URI or mnemonic phrase
    appId: 'your-app-id',
    connectionId: 'conn_' + Date.now(),
    sessionId: 'sess_' + Date.now(),
    appPubKey: 'your_app_public_key',
    dataServicePubKey: 'data_service_public_key',
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
};
```

### Keyring URI Options

The `keyringUri` field accepts:

1. **Substrate URI format** (for testing):

   ```typescript
   keyringUri: '//Alice';
   keyringUri: '//Bob';
   ```

2. **Mnemonic phrase**:

   ```typescript
   keyringUri: 'your twelve word mnemonic phrase here';
   ```

3. **Derivation paths**:
   ```typescript
   keyringUri: 'mnemonic phrase//hard/soft';
   ```

## Quick Start

### Basic Usage

```typescript
import { UnifiedSDK } from '@cere-ddc-sdk/unified';

const sdk = new UnifiedSDK(config);
await sdk.initialize();

// Ingest data with custom metadata
const response = await sdk.writeData(
  { type: 'user_action', userId: 'user123', action: 'click' },
  {
    processing: {
      dataCloudWriteMode: 'viaIndex',
      indexWriteMode: 'realtime',
      priority: 'normal',
    },
  },
);

console.log('Data ingested:', response.transactionId);
```

### Metadata-Driven Processing

The SDK uses metadata to intelligently route data:

```typescript
import { ProcessingMetadata } from '@cere-ddc-sdk/unified';

const metadata: ProcessingMetadata = {
  dataCloudWriteMode: 'direct', // direct, batch, viaIndex, skip
  indexWriteMode: 'realtime', // realtime, skip
  priority: 'high', // low, normal, high
  encryption: true,
  ttl: 86400, // 24 hours
};
```

### Telegram Use Cases

The SDK provides specialized methods for Telegram data ingestion:

```typescript
// Quest completion event
const questEvent = {
  eventType: 'quest_completed' as const,
  userId: 'user123',
  chatId: 'chat456',
  eventData: {
    questId: 'daily-check-in',
    points: 100,
    level: 5,
  },
  timestamp: new Date(),
};

const result = await sdk.writeTelegramEvent(questEvent, {
  dataCloudWriteMode: 'direct',
  indexWriteMode: 'realtime',
  priority: 'high',
});
```

```typescript
// Telegram message storage
const message = {
  messageId: 'msg789',
  chatId: 'chat456',
  userId: 'user123',
  messageText: 'Hello from the mini app!',
  messageType: 'text' as const,
  timestamp: new Date(),
};

const result = await sdk.writeTelegramMessage(message, {
  dataCloudWriteMode: 'batch',
  indexWriteMode: 'realtime',
  batchOptions: {
    maxSize: 5,
    maxWaitTime: 3000,
  },
});
```

## Configuration

### UnifiedSDKConfig

```typescript
interface UnifiedSDKConfig {
  ddcConfig: {
    signer: string; // Substrate URI or signer instance
    bucketId: bigint;
    clusterId?: bigint;
    network?: 'testnet' | 'devnet' | 'mainnet';
  };

  activityConfig?: {
    apiKey?: string;
    endpoint?: string;
  };

  processing: {
    enableBatching: boolean;
    defaultBatchSize: number;
    defaultBatchTimeout: number; // in milliseconds
    maxRetries: number;
    retryDelay: number; // in milliseconds
  };

  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    enableMetrics: boolean;
  };
}
```

## Metadata Schema

The SDK uses a rich metadata schema to control data processing:

```typescript
interface UnifiedMetadata {
  processing: {
    dataCloudWriteMode: 'direct' | 'batch' | 'viaIndex' | 'skip';
    indexWriteMode: 'realtime' | 'skip';
    priority?: 'low' | 'normal' | 'high';
    ttl?: number; // Time to live in seconds
    encryption?: boolean;
    batchOptions?: {
      maxSize?: number;
      maxWaitTime?: number; // in milliseconds
    };
  };
  userContext?: Record<string, any>;
  traceId?: string;
}
```

### Data Cloud Write Modes

- **direct**: Write immediately to Data Cloud (bypassing Indexing Layer)
- **batch**: Buffer data and write to Data Cloud in batches
- **viaIndex**: Let the Indexing Layer handle Data Cloud storage
- **skip**: Don't store in Data Cloud at all

### Index Write Modes

- **realtime**: Write to Indexing Layer immediately
- **skip**: Don't index this data

## API Reference

### Main Methods

#### `initialize(): Promise<void>`

Initialize the SDK and all its components.

#### `writeData(payload: any, metadata: UnifiedMetadata): Promise<UnifiedResponse>`

Main data ingestion method that accepts any payload with metadata.

#### `writeTelegramEvent(eventData: TelegramEventData, options?): Promise<UnifiedResponse>`

Convenience method for Telegram events.

#### `writeTelegramMessage(messageData: TelegramMessageData, options?): Promise<UnifiedResponse>`

Convenience method for Telegram messages.

#### `getStatus()`

Get SDK status and health information.

#### `cleanup(): Promise<void>`

Cleanup resources and disconnect.

### Response Format

```typescript
interface UnifiedResponse {
  transactionId: string;
  status: 'success' | 'partial' | 'failed';
  dataCloudHash?: string;
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

## Error Handling

The SDK provides comprehensive error handling:

```typescript
import { UnifiedSDKError, ValidationError } from '@cere-ddc-sdk/unified';

try {
  await sdk.writeTelegramEvent(event, metadata);
} catch (error) {
  if (error instanceof ValidationError) {
    console.log('Validation failed:', error.validationErrors);
  } else if (error instanceof UnifiedSDKError) {
    console.log('SDK error:', error.code, error.component);
    if (error.recoverable) {
      // Implement retry logic
    }
  }
}
```

## Examples

See the [examples](./examples/) directory for complete usage examples:

- [Telegram Example](./examples/telegram-example.ts) - Comprehensive Telegram use case demonstration

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

### Type Checking

```bash
npx tsc --noEmit
```

## Architecture Documents

This implementation is based on the architectural design documents:

- Component Descriptions: `diagrams/0_1_component_descriptions.md`
- Metadata Schema: `diagrams/2_metadata_schema.md`
- Overall Architecture: `diagrams/1_overall_architecture.md`

## License

Apache-2.0

## Contributing

Please read the contributing guidelines before submitting pull requests.
