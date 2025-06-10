# Telegram Use Cases Guide

## Overview

The Unified SDK is specifically designed and optimized for Telegram bot and mini-app development. It provides **automatic detection** of Telegram-specific data types, intelligent routing for different interaction patterns, and seamless integration with Telegram's ecosystem.

## 🚀 Unified API for Telegram

**The key advantage**: You only need to learn **ONE method** - `writeData()`. The SDK automatically detects whether your data is a Telegram event, message, or any other type and routes it appropriately.

### Automatic Detection

The SDK automatically detects Telegram data types based on payload structure:

- **Telegram Events**: Automatically detected by `eventType`, `userId`, and `timestamp` fields
- **Telegram Messages**: Automatically detected by `messageId`, `chatId`, `userId`, and `messageType` fields
- **No method confusion**: Just call `writeData()` with your data structure

## Telegram Data Types

### TelegramEventData (Auto-detected)

**Detected when payload contains:**
- `eventType` (string)
- `userId` (string)
- `timestamp` (Date) or `createdAt` (Date)

```typescript
interface TelegramEventData {
  eventType: 'quest_completed' | 'user_action' | 'mini_app_interaction';
  userId: string;
  chatId?: string; // Optional chat ID for group events
  eventData: Record<string, any>; // Event-specific data
  timestamp: Date; // When the event occurred
}
```

### TelegramMessageData (Auto-detected)

**Detected when payload contains:**
- `messageId` (string)
- `chatId` (string)
- `userId` (string)
- `messageType` (string)

```typescript
interface TelegramMessageData {
  messageId: string; // Unique message identifier
  chatId: string; // Chat where message was sent
  userId: string; // User who sent the message
  messageText?: string; // Text content (for text messages)
  messageType: 'text' | 'photo' | 'video' | 'document' | 'sticker';
  timestamp: Date; // Message timestamp
  metadata?: Record<string, any>; // Additional message metadata
}
```

## Common Telegram Use Cases

### 1. Quest and Gamification Systems

```typescript
// ✨ Quest completion tracking - Auto-detected as Telegram Event
const result = await sdk.writeData({
  eventType: 'quest_completed',
  userId: 'user123',
  chatId: 'private_chat',
  eventData: {
    questId: 'daily_checkin',
    questType: 'daily',
    points: 100,
    streak: 7,
    completion_time: 45000, // milliseconds
  },
  timestamp: new Date(),
});

// ✨ Achievement unlocked - Auto-detected as Telegram Event
const achievementResult = await sdk.writeData({
  eventType: 'user_action', // Using available eventType
  userId: 'user123',
  eventData: {
    action: 'achievement_unlocked',
    achievementId: 'first_quest',
    achievementTier: 'bronze',
    totalPoints: 500,
    unlockedAt: new Date(),
  },
  timestamp: new Date(),
});

// ✨ Leaderboard interaction - Auto-detected as Telegram Event
const leaderboardResult = await sdk.writeData({
  eventType: 'user_action',
  userId: 'user123',
  chatId: 'group_chat_456',
  eventData: {
    action: 'leaderboard_view',
    leaderboardType: 'weekly',
    userRank: 15,
    topUsers: ['user001', 'user002', 'user003'],
  },
  timestamp: new Date(),
});

console.log('Quest completion stored:', result.transactionId);
console.log('DDC CID:', result.dataCloudHash);
```

### 2. Mini-App Interactions

```typescript
// ✨ Mini-app launch - Auto-detected as Telegram Event
const launchResult = await sdk.writeData({
  eventType: 'mini_app_interaction',
  userId: 'user789',
  eventData: {
    action: 'app_launch',
    appName: 'CereWallet',
    launchSource: 'inline_button',
    sessionId: 'session_abc123',
  },
  timestamp: new Date(),
});

// ✨ In-app purchase - Auto-detected as Telegram Event
const purchaseResult = await sdk.writeData({
  eventType: 'user_action',
  userId: 'user789',
  eventData: {
    action: 'in_app_purchase',
    itemId: 'premium_features',
    itemType: 'subscription',
    price: 9.99,
    currency: 'USD',
    transactionId: 'txn_xyz789',
  },
  timestamp: new Date(),
});

// ✨ Mini-app sharing - Auto-detected as Telegram Event
const shareResult = await sdk.writeData({
  eventType: 'user_action',
  userId: 'user789',
  eventData: {
    action: 'content_shared',
    contentType: 'achievement',
    contentId: 'level_10_reached',
    shareTarget: 'group_chat',
    shareMethod: 'inline_button',
  },
  timestamp: new Date(),
});

console.log('Mini-app interaction stored:', launchResult.transactionId);
```

### 3. Social Features

```typescript
// ✨ User joins group - Auto-detected as Telegram Event
const joinResult = await sdk.writeData({
  eventType: 'user_action',
  userId: 'user456',
  chatId: 'group_789',
  eventData: {
    action: 'user_joined_group',
    invitedBy: 'user123',
    groupType: 'public',
    memberCount: 1250,
  },
  timestamp: new Date(),
});

// ✨ Message reactions - Auto-detected as Telegram Event
const reactionResult = await sdk.writeData({
  eventType: 'user_action',
  userId: 'user456',
  chatId: 'group_789',
  eventData: {
    action: 'message_reaction',
    messageId: 'msg_12345',
    reactionType: 'like',
    emoji: '👍',
    isAddition: true,
  },
  timestamp: new Date(),
});

// ✨ Referral tracking - Auto-detected as Telegram Event
const referralResult = await sdk.writeData({
  eventType: 'user_action',
  userId: 'user123', // referrer
  eventData: {
    action: 'referral_successful',
    referredUserId: 'user999',
    referralCode: 'REF123',
    reward: {
      type: 'points',
      amount: 500,
    },
  },
  timestamp: new Date(),
});
```

### 4. Message Analytics

```typescript
// ✨ Important announcements - Auto-detected as Telegram Message
const messageResult = await sdk.writeData({
  messageId: 'announce_001',
  chatId: 'announcement_channel',
  userId: 'bot_admin',
  messageText: 'New feature released! Check out the latest updates.',
  messageType: 'text',
  timestamp: new Date(),
  metadata: {
    importance: 'high',
    category: 'announcement',
    tags: ['feature', 'update'],
  },
});

// ✨ User feedback messages - Auto-detected as Telegram Message
const feedbackResult = await sdk.writeData({
  messageId: 'feedback_msg_456',
  chatId: 'support_chat',
  userId: 'user123',
  messageText: 'Great bot! Love the new quest system.',
  messageType: 'text',
  timestamp: new Date(),
  metadata: {
    category: 'feedback',
    sentiment: 'positive',
    rating: 5,
  },
});

// ✨ Media messages - Auto-detected as Telegram Message
const mediaResult = await sdk.writeData({
  messageId: 'media_msg_789',
  chatId: 'media_channel',
  userId: 'content_creator',
  messageType: 'photo',
  timestamp: new Date(),
  metadata: {
    fileId: 'photo_xyz123',
    caption: 'Check out this achievement!',
    mediaType: 'achievement_screenshot',
  },
});

console.log('Message stored:', messageResult.transactionId);
console.log('Available in DDC:', messageResult.dataCloudHash);
console.log('Indexed for search:', messageResult.indexId);
```

## Advanced Configuration for Telegram

### High-Priority Events

```typescript
// Quest completions with high priority
const urgentResult = await sdk.writeData(
  {
    eventType: 'quest_completed',
    userId: 'vip_user_123',
    eventData: {
      questId: 'premium_quest',
      points: 1000,
      tier: 'premium',
    },
    timestamp: new Date(),
  },
  {
    priority: 'high',
    encryption: true, // Encrypt sensitive data
    metadata: {
      processing: {
        dataCloudWriteMode: 'direct', // Skip batch for immediate storage
        indexWriteMode: 'realtime',
      },
    },
  }
);
```

### Batch Processing for High Volume

```typescript
// Configure for high-volume message processing
const batchResult = await sdk.writeData(
  {
    messageId: 'bulk_msg_' + Date.now(),
    chatId: 'high_volume_chat',
    userId: 'user123',
    messageText: 'One of many messages',
    messageType: 'text',
    timestamp: new Date(),
  },
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

### Custom Metadata for Analytics

```typescript
// Add custom analytics context
const analyticsResult = await sdk.writeData(
  {
    eventType: 'user_action',
    userId: 'user123',
    eventData: {
      action: 'button_click',
      buttonId: 'start_quest_btn',
      sessionDuration: 120000, // 2 minutes
    },
    timestamp: new Date(),
  },
  {
    metadata: {
      processing: {
        dataCloudWriteMode: 'viaIndex',
        indexWriteMode: 'realtime',
      },
      userContext: {
        source: 'telegram',
        bot: 'quest_bot_v2',
        userTier: 'premium',
        experimentGroup: 'control',
      },
      traceId: 'user_session_abc123',
    },
  }
);
```

## Real-World Telegram Bot Example

```typescript
import { UnifiedSDK } from '@cere-ddc-sdk/unified';
import { Telegraf } from 'telegraf';

// Initialize SDK
const sdk = new UnifiedSDK({
  ddcConfig: {
    signer: process.env.DDC_SIGNER!,
    bucketId: BigInt(process.env.DDC_BUCKET_ID!),
    network: 'testnet',
  },
  activityConfig: {
    endpoint: 'https://api.stats.cere.network',
    keyringUri: process.env.ACTIVITY_KEYRING_URI!,
    appId: process.env.APP_ID!,
    appPubKey: process.env.APP_PUBLIC_KEY!,
    dataServicePubKey: process.env.DATA_SERVICE_PUBLIC_KEY!,
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

// Initialize Telegram bot
const bot = new Telegraf(process.env.BOT_TOKEN!);

// Quest system commands
bot.command('quest', async (ctx) => {
  const questId = ctx.message.text.split(' ')[1] || 'daily_checkin';
  
  // ✨ Auto-detected as Telegram Event
  const result = await sdk.writeData({
    eventType: 'quest_completed',
    userId: ctx.from.id.toString(),
    chatId: ctx.chat.id.toString(),
    eventData: {
      questId,
      completedAt: new Date(),
      points: 100,
      source: 'command',
    },
    timestamp: new Date(),
  });

  ctx.reply(`🎉 Quest "${questId}" completed! Transaction: ${result.transactionId}`);
});

// Message analytics
bot.on('text', async (ctx) => {
  // ✨ Auto-detected as Telegram Message
  await sdk.writeData({
    messageId: ctx.message.message_id.toString(),
    chatId: ctx.chat.id.toString(),
    userId: ctx.from.id.toString(),
    messageText: ctx.message.text,
    messageType: 'text',
    timestamp: new Date(ctx.message.date * 1000),
    metadata: {
      chatType: ctx.chat.type,
      messageLength: ctx.message.text.length,
    },
  });
});

// Callback query handling (button clicks)
bot.on('callback_query', async (ctx) => {
  // ✨ Auto-detected as Telegram Event
  await sdk.writeData({
    eventType: 'user_action',
    userId: ctx.from.id.toString(),
    chatId: ctx.callbackQuery.message?.chat.id.toString(),
    eventData: {
      action: 'button_click',
      buttonData: ctx.callbackQuery.data,
      messageId: ctx.callbackQuery.message?.message_id.toString(),
    },
    timestamp: new Date(),
  });

  ctx.answerCbQuery('Action recorded!');
});

// Photo uploads
bot.on('photo', async (ctx) => {
  // ✨ Auto-detected as Telegram Message
  await sdk.writeData({
    messageId: ctx.message.message_id.toString(),
    chatId: ctx.chat.id.toString(),
    userId: ctx.from.id.toString(),
    messageType: 'photo',
    timestamp: new Date(ctx.message.date * 1000),
    metadata: {
      fileId: ctx.message.photo[0].file_id,
      caption: ctx.message.caption,
      fileSize: ctx.message.photo[0].file_size,
    },
  });
});

// Error handling
bot.catch(async (err, ctx) => {
  console.error('Bot error:', err);
  
  // Log error as Telegram event
  await sdk.writeData({
    eventType: 'user_action',
    userId: ctx.from?.id.toString() || 'unknown',
    eventData: {
      action: 'bot_error',
      error: err.message,
      updateType: ctx.updateType,
    },
    timestamp: new Date(),
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  bot.stop();
  await sdk.cleanup();
  process.exit(0);
});

bot.launch();
console.log('Telegram bot with Unified SDK started!');
```

## Benefits for Telegram Developers

### 🎯 **Ultimate Simplicity**
- **One method**: `writeData()` for all Telegram data
- **Auto-detection**: No need to choose between event/message methods
- **Zero configuration**: Automatic routing based on data structure

### 🤖 **Intelligent Processing**
- **Context awareness**: Understands Telegram-specific patterns
- **Optimal routing**: Automatically chooses best storage/indexing strategy
- **Performance optimization**: Batching for high-volume scenarios

### 📊 **Analytics Ready**
- **Automatic indexing**: Events are automatically indexed for analytics
- **Search capabilities**: Messages are searchable via Activity SDK
- **Data relationships**: CIDs link related data across systems

### 🔧 **Production Features**
- **Error handling**: Graceful fallbacks when services unavailable
- **Monitoring**: Built-in metrics and health checks
- **Scalability**: Handles high-volume bot scenarios efficiently

## Response Format

All `writeData()` calls return a `UnifiedResponse`:

```typescript
interface UnifiedResponse {
  transactionId: string; // Unique transaction identifier
  status: 'success' | 'partial' | 'failed';
  
  // DDC storage reference (when stored)
  dataCloudHash?: string; // CID for DDC-stored data
  
  // Activity SDK reference (when indexed)
  indexId?: string; // Event ID for analytics queries
  
  errors?: Array<{
    component: string;
    error: string;
    recoverable: boolean;
  }>;
  
  metadata: {
    processedAt: Date;
    processingTime: number;
    actionsExecuted: string[]; // Which services were used
  };
}
```

## Error Handling for Telegram Bots

```typescript
async function handleTelegramData(data: any) {
  try {
    const result = await sdk.writeData(data);
    
    if (result.status === 'partial') {
      console.warn('Some services failed:', result.errors);
      // Bot still works, just some features might be limited
    }
    
    return result.transactionId;
    
  } catch (error) {
    if (error instanceof UnifiedSDKError) {
      console.error('SDK error:', error.code, error.message);
      
      // Handle recoverable errors
      if (error.recoverable) {
        // Retry logic or fallback behavior
        setTimeout(() => handleTelegramData(data), 5000);
      }
    }
    
    // Log error but keep bot running
    console.error('Failed to store Telegram data:', error);
    return null;
  }
}
```

## Migration from Direct SDK Usage

If you're currently using DDC Client or Activity SDK directly:

```typescript
// ❌ Before: Multiple SDK calls
await ddcClient.store(bucketId, eventData);
await activitySDK.sendEvent(telegramEvent);

// ✅ After: Single unified call
await sdk.writeData({
  eventType: 'quest_completed',
  userId: 'user123',
  eventData: { questId: 'daily', points: 100 },
  timestamp: new Date(),
});
```

## Configuration Tips for Telegram

### For High-Volume Bots

```typescript
const config = {
  // ... other config
  processing: {
    enableBatching: true,
    defaultBatchSize: 200, // Larger batches
    defaultBatchTimeout: 1000, // Faster processing
    maxRetries: 5,
    retryDelay: 500,
  },
  logging: {
    level: 'warn', // Reduce log noise
    enableMetrics: true,
  },
};
```

### For Analytics-Heavy Bots

```typescript
const config = {
  // ... other config
  processing: {
    enableBatching: false, // Real-time processing
    maxRetries: 3,
    retryDelay: 1000,
  },
  logging: {
    level: 'info',
    enableMetrics: true, // Important for analytics
  },
};
```

The Unified SDK makes Telegram development incredibly simple while providing enterprise-grade reliability and performance. Just call `writeData()` with your Telegram data, and the SDK handles all the complexity behind the scenes!

### 4. Telegram Bot Migration

**Before:**

```typescript
// Multiple methods for different Telegram data types
import { DDCClient } from '@cere-ddc-sdk/ddc-client';
import { EventDispatcher } from '@cere-activity-sdk/events';

// Manual coordination
const ddcResult = await ddcClient.store(data);
const activityResult = await eventDispatcher.dispatchEvent(event);
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
