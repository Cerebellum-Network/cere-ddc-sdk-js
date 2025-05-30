# Migration Guide

## Overview

This guide helps you migrate from using individual DDC Client and Activity SDK packages to the Unified Data Ingestion SDK. The migration provides significant benefits including simplified integration, intelligent routing, better error handling, and optimized performance.

## Migration Benefits

### Before: Multiple SDKs

```typescript
// Old approach - managing multiple SDKs
import { DdcClient, DagNode, File } from '@cere-ddc-sdk/ddc-client';
import { EventDispatcher, ActivityEvent } from '@cere-activity-sdk/events';
import { UriSigner } from '@cere-activity-sdk/signers';
import { NoOpCipher } from '@cere-activity-sdk/ciphers';

// Complex initialization
const ddcClient = await DdcClient.create(signer, config);
const activitySigner = new UriSigner(keyringUri);
const cipher = new NoOpCipher();
const eventDispatcher = new EventDispatcher(activitySigner, cipher, activityConfig);

// Manual coordination between systems
try {
  // Store in DDC
  const dagNode = new DagNode('event_data', eventData);
  const cid = await ddcClient.store(bucketId, dagNode);

  // Index in Activity SDK
  const event = new ActivityEvent('telegram.event', eventData);
  await eventDispatcher.dispatchEvent(event);
} catch (error) {
  // Complex error handling across multiple systems
  // Manual fallback logic
}
```

### After: Unified SDK

```typescript
// New approach - single SDK
import { UnifiedSDK } from '@cere-ddc-sdk/unified';

// Simple initialization
const sdk = new UnifiedSDK({
  ddcConfig: {
    /* ... */
  },
  activityConfig: {
    /* ... */
  },
});

await sdk.initialize();

// Intelligent routing and error handling
const response = await sdk.writeTelegramEvent({
  eventType: 'quest_completed',
  userId: 'user123',
  eventData: { questId: 'daily', points: 100 },
  timestamp: new Date(),
});
```

## Migration Strategies

### 1. Gradual Migration (Recommended)

Migrate incrementally while maintaining existing functionality:

**Phase 1: Install and Initialize**

```typescript
// Add Unified SDK alongside existing SDKs
npm install @cere-ddc-sdk/unified

// Initialize both systems temporarily
const sdk = new UnifiedSDK(config);
await sdk.initialize();

// Keep existing DDC and Activity SDK instances
// const ddcClient = await DdcClient.create(...);
// const eventDispatcher = new EventDispatcher(...);
```

**Phase 2: Migrate New Features**

```typescript
// Use Unified SDK for all new features
async function handleNewTelegramEvent(eventData) {
  return sdk.writeTelegramEvent(eventData);
}

// Keep existing code unchanged
async function handleLegacyOperation(data) {
  // Continue using old SDKs
  return ddcClient.store(bucketId, new DagNode('data', data));
}
```

**Phase 3: Migrate Existing Features**

```typescript
// Replace old implementations one by one
async function handleExistingFeature(data) {
  // Old implementation
  // const dagNode = new DagNode('data', data);
  // const cid = await ddcClient.store(bucketId, dagNode);

  // New implementation
  return sdk.writeData(data, {
    processing: {
      dataCloudWriteMode: 'direct',
      indexWriteMode: 'skip',
    },
  });
}
```

**Phase 4: Remove Legacy Dependencies**

```typescript
// Remove old SDK imports and dependencies
// npm uninstall @cere-ddc-sdk/ddc-client @cere-activity-sdk/events
```

### 2. Complete Migration

For new projects or major refactoring:

```typescript
// Replace all SDK usage at once
class DataService {
  private sdk: UnifiedSDK;

  constructor(config: UnifiedSDKConfig) {
    this.sdk = new UnifiedSDK(config);
  }

  async initialize() {
    await this.sdk.initialize();
  }

  // Unified methods replace multiple SDK calls
  async handleTelegramEvent(eventData: TelegramEventData) {
    return this.sdk.writeTelegramEvent(eventData);
  }

  async handleTelegramMessage(messageData: TelegramMessageData) {
    return this.sdk.writeTelegramMessage(messageData);
  }

  async handleCustomData(data: any, metadata: Metadata) {
    return this.sdk.writeData(data, metadata);
  }
}
```

## Common Migration Patterns

### 1. DDC Storage Migration

**Before:**

```typescript
import { DdcClient, DagNode, File } from '@cere-ddc-sdk/ddc-client';

// Manual DDC operations
const ddcClient = await DdcClient.create(signer, config);

// Store file
const file = new File(buffer, { mimeType: 'application/json' });
const fileCid = await ddcClient.store(bucketId, file);

// Store DAG node
const dagNode = new DagNode('user_data', userData);
const dagCid = await ddcClient.store(bucketId, dagNode);
```

**After:**

```typescript
import { UnifiedSDK } from '@cere-ddc-sdk/unified';

const sdk = new UnifiedSDK({ ddcConfig, activityConfig });

// Store with intelligent routing
const response = await sdk.writeData(userData, {
  processing: {
    dataCloudWriteMode: 'direct', // Direct DDC storage
    indexWriteMode: 'skip', // Skip Activity SDK
  },
});

// Access DDC hash from response
const ddcHash = response.dataCloudHash;
```

### 2. Activity SDK Migration

**Before:**

```typescript
import { EventDispatcher, ActivityEvent } from '@cere-activity-sdk/events';
import { UriSigner } from '@cere-activity-sdk/signers';
import { NoOpCipher } from '@cere-activity-sdk/ciphers';

// Manual Activity SDK setup
const signer = new UriSigner(keyringUri);
const cipher = new NoOpCipher();
const dispatcher = new EventDispatcher(signer, cipher, config);

// Send event
const event = new ActivityEvent('user.action', eventData, { time: new Date() });
const success = await dispatcher.dispatchEvent(event);
```

**After:**

```typescript
// Automatic Activity SDK integration
const response = await sdk.writeData(eventData, {
  processing: {
    dataCloudWriteMode: 'skip', // Skip DDC storage
    indexWriteMode: 'realtime', // Real-time indexing
  },
});

// Access Activity SDK result
const activityEventId = response.activityEventId;
```

### 3. Combined Operations Migration

**Before:**

```typescript
// Complex coordination between multiple systems
async function storeAndIndex(data: any) {
  try {
    // Store in DDC
    const dagNode = new DagNode('combined_data', data);
    const cid = await ddcClient.store(bucketId, dagNode);

    // Index in Activity SDK
    const event = new ActivityEvent('data.stored', {
      ...data,
      ddcCid: cid,
    });
    const indexed = await eventDispatcher.dispatchEvent(event);

    return { cid, indexed };
  } catch (error) {
    // Manual error handling and cleanup
    console.error('Operation failed:', error);
    throw error;
  }
}
```

**After:**

```typescript
// Automatic coordination with fallback handling
async function storeAndIndex(data: any) {
  const response = await sdk.writeData(data, {
    processing: {
      dataCloudWriteMode: 'direct', // Store in DDC
      indexWriteMode: 'realtime', // Index in Activity SDK
    },
  });

  // Unified response with all results
  return {
    success: response.success,
    ddcHash: response.dataCloudHash,
    activityEventId: response.activityEventId,
    metadata: response.metadata,
  };
}
```

## Configuration Migration

### DDC Client Configuration

**Before:**

```typescript
// Old DDC Client configuration
const ddcClient = await DdcClient.create(signer, {
  blockchain: 'wss://rpc.testnet.cere.network/ws',
  logLevel: 'info',
});
```

**After:**

```typescript
// Unified SDK DDC configuration
const sdk = new UnifiedSDK({
  ddcConfig: {
    signer: signer, // Same signer
    bucketId: BigInt(bucketId), // Add bucket ID
    network: 'testnet', // Simplified network config
    clusterId: 'optional-cluster-id', // Optional cluster
  },
});
```

### Activity SDK Configuration

**Before:**

```typescript
// Old Activity SDK configuration
const signer = new UriSigner(keyringUri);
const cipher = new NoOpCipher();
const dispatcher = new EventDispatcher(signer, cipher, {
  appId: 'my-app',
  endpoint: 'https://api.stats.testnet.cere.network',
  appPubKey: 'app-public-key',
  dataServicePubKey: 'service-public-key',
});
```

**After:**

```typescript
// Unified SDK Activity configuration
const sdk = new UnifiedSDK({
  ddcConfig: {
    /* ... */
  },
  activityConfig: {
    keyringUri: keyringUri, // Same URI
    appId: 'my-app', // Same app ID
    endpoint: 'https://api.stats.testnet.cere.network',
    appPubKey: 'app-public-key', // Same keys
    dataServicePubKey: 'service-public-key',
  },
});
```

## Error Handling Migration

### Before: Manual Error Handling

```typescript
async function complexOperation(data: any) {
  let ddcResult, activityResult;

  try {
    // DDC operation
    ddcResult = await ddcClient.store(bucketId, new DagNode('data', data));
  } catch (ddcError) {
    console.error('DDC failed:', ddcError);
    throw new Error(`DDC storage failed: ${ddcError.message}`);
  }

  try {
    // Activity SDK operation
    const event = new ActivityEvent('data.stored', data);
    activityResult = await eventDispatcher.dispatchEvent(event);
  } catch (activityError) {
    console.error('Activity SDK failed:', activityError);
    // Manual cleanup needed
    // Should we remove from DDC? Complex decision...
    throw new Error(`Activity indexing failed: ${activityError.message}`);
  }

  return { ddcResult, activityResult };
}
```

### After: Unified Error Handling

```typescript
async function complexOperation(data: any) {
  try {
    // Unified operation with automatic error handling
    const response = await sdk.writeData(data, {
      processing: {
        dataCloudWriteMode: 'direct',
        indexWriteMode: 'realtime',
      },
    });

    // Check results
    if (!response.success) {
      console.warn('Partial failure:', response.metadata.fallbacksUsed);
    }

    return response;
  } catch (error) {
    // Unified error with context
    if (error instanceof UnifiedSDKError) {
      console.error(`${error.component} failed: ${error.message}`, {
        code: error.code,
        cause: error.cause,
      });
    }
    throw error;
  }
}
```

## Performance Migration

### Before: Manual Batching

```typescript
// Manual batching logic
class DataProcessor {
  private batch: any[] = [];
  private batchTimer?: NodeJS.Timeout;

  async processBatch() {
    if (this.batch.length === 0) return;

    const currentBatch = [...this.batch];
    this.batch = [];

    // Manual parallel processing
    const promises = currentBatch.map(async (item) => {
      try {
        const dagNode = new DagNode('batch_item', item);
        const cid = await ddcClient.store(bucketId, dagNode);

        const event = new ActivityEvent('batch.item', item);
        await eventDispatcher.dispatchEvent(event);

        return { success: true, cid };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    return Promise.all(promises);
  }

  addToBatch(data: any) {
    this.batch.push(data);

    if (this.batch.length >= 50) {
      this.processBatch();
    } else {
      clearTimeout(this.batchTimer);
      this.batchTimer = setTimeout(() => this.processBatch(), 5000);
    }
  }
}
```

### After: Automatic Batching

```typescript
// Automatic intelligent batching
const sdk = new UnifiedSDK({
  ddcConfig: {
    /* ... */
  },
  activityConfig: {
    /* ... */
  },
  processing: {
    enableBatching: true,
    defaultBatchSize: 50,
    defaultBatchTimeout: 5000,
  },
});

class DataProcessor {
  async processItem(data: any) {
    // Automatic batching handled by SDK
    return sdk.writeData(data, {
      processing: {
        dataCloudWriteMode: 'batch', // SDK handles batching
        indexWriteMode: 'realtime',
      },
    });
  }
}
```

## Testing Migration

### Before: Complex Test Setup

```typescript
// Complex mocking for multiple SDKs
jest.mock('@cere-ddc-sdk/ddc-client');
jest.mock('@cere-activity-sdk/events');
jest.mock('@cere-activity-sdk/signers');
jest.mock('@cere-activity-sdk/ciphers');

describe('DataService', () => {
  let mockDdcClient: jest.Mocked<DdcClient>;
  let mockEventDispatcher: jest.Mocked<EventDispatcher>;

  beforeEach(() => {
    // Complex mock setup
    mockDdcClient = {
      store: jest.fn(),
      // ... other methods
    } as any;

    mockEventDispatcher = {
      dispatchEvent: jest.fn(),
      // ... other methods
    } as any;

    (DdcClient.create as jest.Mock).mockResolvedValue(mockDdcClient);
    (EventDispatcher as jest.Mock).mockImplementation(() => mockEventDispatcher);
  });

  it('should store and index data', async () => {
    mockDdcClient.store.mockResolvedValue('test-cid');
    mockEventDispatcher.dispatchEvent.mockResolvedValue(true);

    // Test implementation
  });
});
```

### After: Simplified Testing

```typescript
// Simple unified mock
jest.mock('@cere-ddc-sdk/unified');

describe('DataService', () => {
  let mockSdk: jest.Mocked<UnifiedSDK>;

  beforeEach(() => {
    mockSdk = {
      writeData: jest.fn(),
      writeTelegramEvent: jest.fn(),
      writeTelegramMessage: jest.fn(),
      initialize: jest.fn(),
      cleanup: jest.fn(),
      getStatus: jest.fn(),
    } as any;

    (UnifiedSDK as jest.Mock).mockImplementation(() => mockSdk);
  });

  it('should handle data processing', async () => {
    mockSdk.writeData.mockResolvedValue({
      success: true,
      transactionId: 'test-tx',
      results: [],
      metadata: { processingTime: 100, routingDecisions: [], fallbacksUsed: [] },
    });

    // Simplified test implementation
  });
});
```

## Migration Checklist

### Pre-Migration

- [ ] **Audit Current Usage**: Document all DDC Client and Activity SDK usage
- [ ] **Review Dependencies**: Check which features you're using from each SDK
- [ ] **Test Coverage**: Ensure you have tests for existing functionality
- [ ] **Configuration Inventory**: Document current configuration patterns

### Migration Process

- [ ] **Install Unified SDK**: `npm install @cere-ddc-sdk/unified`
- [ ] **Create Migration Plan**: Decide on gradual vs. complete migration
- [ ] **Update Configuration**: Convert to unified configuration format
- [ ] **Migrate Core Functions**: Start with most critical operations
- [ ] **Update Error Handling**: Implement unified error handling patterns
- [ ] **Migrate Tests**: Update test suites for unified approach

### Post-Migration

- [ ] **Remove Old Dependencies**: Uninstall individual SDK packages
- [ ] **Update Documentation**: Document new patterns and configurations
- [ ] **Performance Testing**: Verify performance improvements
- [ ] **Monitor Production**: Watch for any issues in production deployment

## Common Issues and Solutions

### Issue 1: Type Compatibility

**Problem**: TypeScript types don't match between old and new SDKs.

**Solution**:

```typescript
// Create type adapters during migration
function adaptLegacyData(legacyData: OldDataType): UnifiedDataType {
  return {
    // Map old structure to new structure
    ...legacyData,
    timestamp: legacyData.createdAt,
  };
}
```

### Issue 2: Configuration Complexity

**Problem**: Existing configuration doesn't map directly to unified format.

**Solution**:

```typescript
// Create configuration migration utility
function migrateConfig(oldConfig: OldConfig): UnifiedSDKConfig {
  return {
    ddcConfig: {
      signer: oldConfig.ddcSigner,
      bucketId: BigInt(oldConfig.bucketId),
      network: oldConfig.network,
    },
    activityConfig: oldConfig.activityEnabled
      ? {
          keyringUri: oldConfig.activitySigner,
          appId: oldConfig.appId,
          endpoint: oldConfig.activityEndpoint,
          appPubKey: oldConfig.appPublicKey,
          dataServicePubKey: oldConfig.servicePublicKey,
        }
      : undefined,
  };
}
```

### Issue 3: Behavioral Differences

**Problem**: Unified SDK behaves differently than manual coordination.

**Solution**:

```typescript
// Use metadata to control behavior precisely
await sdk.writeData(data, {
  processing: {
    dataCloudWriteMode: 'direct', // Match old DDC behavior
    indexWriteMode: 'realtime', // Match old Activity behavior
    priority: 'high', // Control execution order
  },
});
```

## Migration Support

If you encounter issues during migration:

1. **Check the Documentation**: Review the [API Reference](./api-reference.md) and [Configuration Guide](./configuration.md)
2. **Search Issues**: Look for similar issues in the repository
3. **Create an Issue**: Provide details about your migration scenario
4. **Community Support**: Join the Cere developer community for help

The migration to Unified SDK provides significant benefits in terms of simplicity, performance, and maintainability while maintaining compatibility with existing Cere ecosystem features.
