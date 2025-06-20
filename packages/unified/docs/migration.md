# Migration Guide

## Overview

This guide helps you migrate from using individual DDC Client and Activity SDK packages to the Unified Data Ingestion SDK. The migration provides significant benefits including **one unified method**, automatic data type detection, intelligent routing, better error handling, and optimized performance.

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

### After: Unified SDK ⭐

```typescript
// New approach - single SDK with ONE method
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

// ✨ ONE method for everything - automatic detection and routing
const response = await sdk.writeData({
  eventType: 'quest_completed',
  userId: 'user123',
  eventData: { questId: 'daily', points: 100 },
  timestamp: new Date(),
});

// The SDK automatically:
// 1. Detects this is a Telegram event
// 2. Routes to both DDC and Activity SDK
// 3. Handles all errors and fallbacks
// 4. Returns unified response
```

## Key Migration Principles

### 🎯 From Multiple Methods to ONE Method

**Before (Complex):**

- `ddcClient.store()` for DDC storage
- `eventDispatcher.dispatchEvent()` for Activity SDK
- Different methods for different data types
- Manual coordination between systems

**After (Simple):**

```typescript
// ✨ ONE method for EVERYTHING
await sdk.writeData(anyData);
```

### 🤖 Automatic Data Type Detection

**Before:** You had to know which method to call
**After:** Just pass your data structure - the SDK detects the type automatically

```typescript
// All these are detected automatically:

// Telegram Event (detected by eventType + userId + timestamp)
await sdk.writeData({
  eventType: 'quest_completed',
  userId: 'user123',
  timestamp: new Date(),
  eventData: {
    /* ... */
  },
});

// Telegram Message (detected by messageId + chatId + messageType)
await sdk.writeData({
  messageId: 'msg123',
  chatId: 'chat456',
  messageType: 'text',
  messageText: 'Hello!',
  timestamp: new Date(),
});

// Custom data (falls back to generic handling)
await sdk.writeData({
  analytics: { page: '/dashboard' },
  userId: 'user123',
});
```

## Migration Strategies

### 1. Gradual Migration (Recommended)

Migrate incrementally while maintaining existing functionality:

**Phase 1: Install and Test**

```typescript
// Add Unified SDK alongside existing SDKs
npm install @cere-ddc-sdk/unified

// Initialize and test with one data type
const sdk = new UnifiedSDK(config);
await sdk.initialize();

// Test with simple data first
const testResult = await sdk.writeData({
  eventType: 'test_migration',
  userId: 'test_user',
  timestamp: new Date(),
  eventData: { migration: 'phase1' }
});

console.log('Migration test successful:', testResult);
```

**Phase 2: Replace Individual Operations**

```typescript
// Replace DDC operations
// OLD:
// const dagNode = new DagNode('data', data);
// const cid = await ddcClient.store(bucketId, dagNode);

// NEW:
const result = await sdk.writeData(data, {
  writeMode: 'direct', // Forces DDC storage
  metadata: {
    processing: {
      dataCloudWriteMode: 'direct',
      indexWriteMode: 'skip', // Skip Activity SDK if not needed
    },
  },
});
```

**Phase 3: Migrate Complex Workflows**

```typescript
// Replace complex multi-SDK operations
// OLD:
// try {
//   const cid = await ddcClient.store(bucketId, dagNode);
//   const event = new ActivityEvent('data.stored', { cid, ...data });
//   await dispatcher.dispatchEvent(event);
// } catch (error) { /* complex error handling */ }

// NEW:
const result = await sdk.writeData(data); // Handles everything automatically
```

**Phase 4: Remove Legacy Dependencies**

```typescript
// Remove old SDK imports and dependencies
// npm uninstall @cere-ddc-sdk/ddc-client @cere-activity-sdk/events
```

### 2. Complete Migration

For new projects or major refactoring:

```typescript
// Replace entire data service with unified approach
class UnifiedDataService {
  private sdk: UnifiedSDK;

  constructor(config: UnifiedSDKConfig) {
    this.sdk = new UnifiedSDK(config);
  }

  async initialize() {
    await this.sdk.initialize();
  }

  // ✨ ONE method replaces all previous data operations
  async storeData(data: any, options?: WriteOptions) {
    return this.sdk.writeData(data, options);
  }

  // Convenience wrappers if needed (but not required)
  async storeTelegramEvent(eventData: any) {
    return this.sdk.writeData(eventData); // Auto-detected
  }

  async storeTelegramMessage(messageData: any) {
    return this.sdk.writeData(messageData); // Auto-detected
  }

  async storeCustomData(data: any, priority: 'low' | 'normal' | 'high' = 'normal') {
    return this.sdk.writeData(data, { priority });
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
// ✨ One method for all storage types
const fileResult = await sdk.writeData(bufferData, {
  writeMode: 'direct',
  metadata: {
    processing: {
      dataCloudWriteMode: 'direct',
      indexWriteMode: 'skip',
    },
  },
});

const dataResult = await sdk.writeData(userData); // Auto-routes based on structure
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
// ✨ Automatic Activity SDK integration
const response = await sdk.writeData({
  eventType: 'user_action', // Auto-detected as Telegram event
  userId: 'user123',
  eventData: eventData,
  timestamp: new Date(),
});

// Or for index-only operations:
const indexOnlyResult = await sdk.writeData(eventData, {
  metadata: {
    processing: {
      dataCloudWriteMode: 'skip', // Skip DDC storage
      indexWriteMode: 'realtime', // Real-time indexing
    },
  },
});
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
    await dispatcher.dispatchEvent(event);

    return { success: true, cid, indexed: true };
  } catch (error) {
    // Complex error handling and rollback logic
    if (cid) {
      // Try to clean up partial state
    }
    throw error;
  }
}
```

**After:**

```typescript
// ✨ Unified operation with automatic coordination
async function storeAndIndex(data: any) {
  return sdk.writeData(data); // Handles both DDC and Activity SDK automatically
}

// Or with explicit control:
async function storeAndIndexWithControl(data: any) {
  return sdk.writeData(data, {
    writeMode: 'direct',
    metadata: {
      processing: {
        dataCloudWriteMode: 'direct', // Store in DDC
        indexWriteMode: 'realtime', // Index in Activity SDK
      },
    },
  });
}
```

### 4. Telegram Bot Migration

**Before:**

```typescript
// Multiple methods for different Telegram data types
import { UnifiedSDK } from '@cere-ddc-sdk/unified';

bot.on('callback_query', async (query) => {
  await sdk.writeTelegramEvent({
    eventType: 'button_click',
    userId: query.from.id.toString(),
    // ...
  });
});

bot.on('message', async (msg) => {
  await sdk.writeTelegramMessage({
    messageId: msg.message_id.toString(),
    // ...
  });
});
```

**After:**

```typescript
// ✨ ONE method for all Telegram data - auto-detected
bot.on('callback_query', async (query) => {
  await sdk.writeData({
    eventType: 'button_click', // Auto-detected as Telegram Event
    userId: query.from.id.toString(),
    chatId: query.message?.chat.id.toString(),
    eventData: { buttonData: query.data },
    timestamp: new Date(),
  });
});

bot.on('message', async (msg) => {
  await sdk.writeData({
    messageId: msg.message_id.toString(), // Auto-detected as Telegram Message
    chatId: msg.chat.id.toString(),
    userId: msg.from?.id.toString(),
    messageText: msg.text,
    messageType: 'text',
    timestamp: new Date(msg.date * 1000),
  });
});
```

## Migration Benefits Summary

| Aspect                  | Before (Multiple SDKs)  | After (Unified SDK)            |
| ----------------------- | ----------------------- | ------------------------------ |
| **Methods to Learn**    | 10+ different methods   | ✨ **1 method**: `writeData()` |
| **Data Type Detection** | Manual method selection | 🤖 **Automatic detection**     |
| **Error Handling**      | Complex, per-SDK        | 🛡️ **Unified, graceful**       |
| **Fallback Logic**      | Manual implementation   | 🔄 **Automatic fallbacks**     |
| **Configuration**       | Multiple configurations | ⚙️ **Single configuration**    |
| **Learning Curve**      | Steep (multiple APIs)   | 📈 **Minimal (one method)**    |
| **Maintenance**         | High (multiple SDKs)    | 🔧 **Low (single SDK)**        |
| **Type Safety**         | Partial                 | 💯 **Complete TypeScript**     |

## Migration Checklist

- [ ] Install `@cere-ddc-sdk/unified`
- [ ] Create unified configuration
- [ ] Initialize UnifiedSDK
- [ ] Test with simple `writeData()` call
- [ ] Replace DDC operations with `writeData()`
- [ ] Replace Activity SDK operations with `writeData()`
- [ ] Migrate Telegram-specific operations to use `writeData()`
- [ ] Update error handling to use unified responses
- [ ] Remove old SDK dependencies
- [ ] Update tests to use unified API
- [ ] Deploy and monitor

## Migration Support

If you need help with migration:

1. **Start Simple**: Begin with one data type and the basic `writeData()` call
2. **Use Auto-Detection**: Structure your data properly and let the SDK handle routing
3. **Gradual Replacement**: Replace old methods one by one
4. **Test Thoroughly**: Verify that auto-detection works for your data structures
5. **Leverage Types**: Use TypeScript for better migration safety

The key principle: **Replace complexity with simplicity** - one method (`writeData()`) instead of many.
