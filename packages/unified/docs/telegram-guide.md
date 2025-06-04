# Telegram Use Cases Guide

## Overview

The Unified SDK is specifically designed and optimized for Telegram bot and mini-app development. It provides **automatic detection** of Telegram-specific data types, intelligent routing for different interaction patterns, and seamless integration with Telegram's ecosystem.

## 🚀 Unified API for Telegram

**The key advantage**: You only need to learn **ONE method** - `writeData()`. The SDK automatically detects whether your data is a Telegram event, message, or any other type and routes it appropriately.

### Automatic Detection

- **Telegram Events**: Automatically detected by `eventType`, `userId`, `timestamp` fields
- **Telegram Messages**: Automatically detected by `messageId`, `chatId`, `userId`, `messageType` fields
- **No method confusion**: Just call `writeData()` with your data structure

## Telegram Data Types

### TelegramEventData

**Auto-detected structure** for user actions and interactions within Telegram bots or mini-apps:

```typescript
interface TelegramEventData {
  eventType: string; // Type of event (quest_completed, button_click, etc.)
  userId: string; // Telegram user ID
  chatId?: string; // Optional chat ID for group events
  eventData: any; // Event-specific data
  timestamp: Date; // When the event occurred
  messageId?: string; // Optional related message ID
  botId?: string; // Optional bot identifier
  miniAppId?: string; // Optional mini-app identifier
}
```

### TelegramMessageData

**Auto-detected structure** for messages sent within Telegram:

```typescript
interface TelegramMessageData {
  messageId: string; // Unique message identifier
  chatId: string; // Chat where message was sent
  userId: string; // User who sent the message
  messageText?: string; // Text content (for text messages)
  messageType: 'text' | 'photo' | 'video' | 'document' | 'sticker' | 'voice' | 'location' | 'contact';
  timestamp: Date; // Message timestamp
  replyToMessageId?: string; // ID of message being replied to
  metadata?: any; // Additional message metadata
}
```

## Common Telegram Use Cases

### 1. Quest and Gamification Systems

```typescript
// ✨ Quest completion tracking - Auto-detected as Telegram Event
await sdk.writeData({
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
  botId: 'gamification_bot',
});

// ✨ Achievement unlocked - Auto-detected as Telegram Event
await sdk.writeData({
  eventType: 'achievement_unlocked',
  userId: 'user123',
  eventData: {
    achievementId: 'first_quest',
    achievementTier: 'bronze',
    totalPoints: 500,
    unlockedAt: new Date(),
  },
  timestamp: new Date(),
});

// ✨ Leaderboard interaction - Auto-detected as Telegram Event
await sdk.writeData({
  eventType: 'leaderboard_view',
  userId: 'user123',
  chatId: 'group_chat_456',
  eventData: {
    leaderboardType: 'weekly',
    userRank: 15,
    topUsers: ['user001', 'user002', 'user003'],
  },
  timestamp: new Date(),
});
```

### 2. Mini-App Interactions

```typescript
// ✨ Mini-app launch - Auto-detected as Telegram Event
await sdk.writeData({
  eventType: 'miniapp_launch',
  userId: 'user789',
  eventData: {
    appName: 'CereWallet',
    launchSource: 'inline_button',
    sessionId: 'session_abc123',
  },
  timestamp: new Date(),
  miniAppId: 'cere_wallet_v1',
});

// ✨ In-app purchase - Auto-detected as Telegram Event
await sdk.writeData({
  eventType: 'in_app_purchase',
  userId: 'user789',
  eventData: {
    itemId: 'premium_features',
    itemType: 'subscription',
    price: 9.99,
    currency: 'USD',
    transactionId: 'txn_xyz789',
  },
  timestamp: new Date(),
  miniAppId: 'cere_wallet_v1',
});

// ✨ Mini-app sharing - Auto-detected as Telegram Event
await sdk.writeData({
  eventType: 'content_shared',
  userId: 'user789',
  eventData: {
    contentType: 'achievement',
    contentId: 'level_10_reached',
    shareTarget: 'group_chat',
    shareMethod: 'inline_button',
  },
  timestamp: new Date(),
  miniAppId: 'cere_wallet_v1',
});
```

### 3. Social Features

```typescript
// ✨ User joins group - Auto-detected as Telegram Event
await sdk.writeData({
  eventType: 'user_joined_group',
  userId: 'user456',
  chatId: 'group_789',
  eventData: {
    invitedBy: 'user123',
    groupType: 'public',
    memberCount: 1250,
  },
  timestamp: new Date(),
});

// ✨ Message reactions - Auto-detected as Telegram Event
await sdk.writeData({
  eventType: 'message_reaction',
  userId: 'user456',
  chatId: 'group_789',
  messageId: 'msg_12345',
  eventData: {
    reactionType: 'like',
    emoji: '👍',
    isAddition: true,
  },
  timestamp: new Date(),
});

// ✨ Referral tracking - Auto-detected as Telegram Event
await sdk.writeData({
  eventType: 'referral_successful',
  userId: 'user123', // referrer
  eventData: {
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
await sdk.writeData({
  messageId: 'announce_001',
  chatId: 'announcement_channel',
  userId: 'bot_admin',
  messageText: '🎉 New features available in CereWallet!',
  messageType: 'text',
  timestamp: new Date(),
  metadata: {
    messageCategory: 'announcement',
    priority: 'high',
    expectedReach: 10000,
  },
});

// ✨ User feedback - Auto-detected as Telegram Message
await sdk.writeData({
  messageId: 'feedback_456',
  chatId: 'support_chat',
  userId: 'user789',
  messageText: 'The new wallet feature is amazing!',
  messageType: 'text',
  timestamp: new Date(),
  metadata: {
    messageCategory: 'feedback',
    sentiment: 'positive',
    topic: 'wallet_features',
  },
});

// ✨ Media sharing - Auto-detected as Telegram Message
await sdk.writeData({
  messageId: 'media_789',
  chatId: 'community_group',
  userId: 'user456',
  messageType: 'photo',
  timestamp: new Date(),
  metadata: {
    mediaSize: 2048576, // bytes
    mediaFormat: 'jpeg',
    hasCaption: true,
    messageCategory: 'user_content',
  },
});
```

## Advanced Telegram Features

### 1. CID Retrieval for Conversation Streams

The Unified SDK returns Content Identifiers (CIDs) when data is stored in DDC, enabling conversation streams and other systems to reference original data sources.

```typescript
// ✨ Store conversation data and get CID for future reference
const response = await sdk.writeData(
  {
    messageId: 'msg_12345',
    chatId: 'chat_conversations',
    userId: 'user_789',
    messageText: 'This is an important conversation message',
    messageType: 'text',
    timestamp: new Date(),
    metadata: {
      conversationId: 'conv_session_001',
      importance: 'high',
      category: 'support_request',
    },
  },
  {
    // Force storage in DDC to get CID
    writeMode: 'direct', // This ensures direct DDC storage
    priority: 'high',
  },
);

// Extract CID for conversation reference
const conversationCID = response.dataCloudHash;
console.log(`Conversation stored with CID: ${conversationCID}`);

// Store conversation metadata with CID reference
const conversationIndex = {
  conversationId: 'conv_session_001',
  participants: ['user_789', 'support_agent_123'],
  startTime: new Date(),
  originalDataCID: conversationCID, // Reference to original data
  status: 'active',
};

await sdk.writeData(conversationIndex, {
  priority: 'high',
  metadata: {
    processing: {
      dataCloudWriteMode: 'direct',
      indexWriteMode: 'realtime',
    },
  },
});
```

### 2. Building Conversation History with CID References

```typescript
class ConversationStream {
  private sdk: UnifiedSDK;
  private conversationCIDs: Map<string, string> = new Map();

  async addMessage(messageData: TelegramMessageData): Promise<string> {
    // ✨ Store message and get CID - Auto-detects as Telegram Message
    const response = await this.sdk.writeData(messageData, {
      writeMode: 'direct', // Ensure DDC storage for CID
      priority: 'normal',
    });

    if (response.dataCloudHash) {
      // Store CID reference for this message
      this.conversationCIDs.set(messageData.messageId, response.dataCloudHash);

      // Update conversation index with new message reference
      await this.updateConversationIndex(messageData.chatId, {
        messageId: messageData.messageId,
        messageCID: response.dataCloudHash,
        timestamp: messageData.timestamp,
        userId: messageData.userId,
      });

      return response.dataCloudHash;
    }

    throw new Error('Failed to store message in DDC');
  }

  async getMessageCID(messageId: string): Promise<string | undefined> {
    return this.conversationCIDs.get(messageId);
  }

  private async updateConversationIndex(chatId: string, messageRef: any) {
    await this.sdk.writeData(
      {
        type: 'conversation_update',
        chatId,
        messageReference: messageRef,
        updatedAt: new Date(),
      },
      {
        priority: 'low',
        metadata: {
          processing: {
            dataCloudWriteMode: 'skip', // Index only
            indexWriteMode: 'realtime',
          },
        },
      },
    );
  }
}
```

### 3. Cross-System Data References

```typescript
// Use CIDs to reference data across different systems
async function processQuestCompletion(userId: string, questData: any) {
  // ✨ Store quest completion data - Auto-detected as Telegram Event
  const response = await sdk.writeData(
    {
      eventType: 'quest_completed',
      userId,
      eventData: questData,
      timestamp: new Date(),
    },
    {
      writeMode: 'direct', // Get CID for external reference
      priority: 'high',
    },
  );

  // Use CID in external systems (e.g., blockchain, other databases)
  if (response.dataCloudHash) {
    await notifyExternalSystem({
      userId,
      eventType: 'quest_completion',
      dataReference: {
        cid: response.dataCloudHash,
        network: 'cere-ddc',
        bucket: process.env.DDC_BUCKET_ID,
      },
      points: questData.points,
      timestamp: new Date(),
    });

    // Store in local database with CID reference
    await localDB.quests.create({
      userId,
      questId: questData.questId,
      completedAt: new Date(),
      originalDataCID: response.dataCloudHash, // Link to immutable data
      status: 'completed',
    });
  }
}
```

### 4. Data Verification Using CIDs

```typescript
// Verify data integrity using CIDs
async function verifyConversationData(messageId: string, expectedCID: string) {
  try {
    // Could implement DDC retrieval to verify data matches CID
    // This ensures data hasn't been tampered with
    const isValid = await verifyCIDIntegrity(expectedCID);

    if (!isValid) {
      console.warn(`Data integrity check failed for message ${messageId}`);
      // Handle integrity violation
    }

    return isValid;
  } catch (error) {
    console.error('CID verification failed:', error);
    return false;
  }
}

async function verifyCIDIntegrity(cid: string): Promise<boolean> {
  // Implementation would use DDC client to retrieve and verify
  // This is a placeholder for the verification logic
  return true;
}
```

## Telegram Bot Integration Patterns

### 1. Inline Keyboard Analytics

```typescript
// ✨ Button click tracking - Auto-detected as Telegram Event
await sdk.writeData({
  eventType: 'inline_button_click',
  userId: 'user123',
  chatId: 'private_chat',
  messageId: 'msg_with_keyboard',
  eventData: {
    buttonText: 'Start Quest',
    buttonData: 'quest_start_daily',
    keyboardLayout: 'quest_menu',
    clickPosition: { row: 0, column: 1 },
  },
  timestamp: new Date(),
});

// ✨ Callback query handling - Auto-detected as Telegram Event
await sdk.writeData({
  eventType: 'callback_query',
  userId: 'user123',
  eventData: {
    queryId: 'cbq_12345',
    queryData: 'view_profile',
    messageId: 'msg_profile_button',
    responseTime: 250, // milliseconds
  },
  timestamp: new Date(),
});
```

### 2. Bot Command Analytics

```typescript
// ✨ Command usage tracking - Auto-detected as Telegram Event
await sdk.writeData({
  eventType: 'bot_command_used',
  userId: 'user456',
  chatId: 'private_chat',
  eventData: {
    command: '/start',
    parameters: ['ref_user123'],
    isFirstTime: true,
    executionTime: 150,
  },
  timestamp: new Date(),
  botId: 'cere_quest_bot',
});

// ✨ Help system usage - Auto-detected as Telegram Event
await sdk.writeData({
  eventType: 'help_requested',
  userId: 'user789',
  eventData: {
    helpTopic: 'wallet_setup',
    helpMethod: 'command', // or 'button', 'menu'
    previousAction: 'failed_transaction',
  },
  timestamp: new Date(),
});
```

### 3. WebApp Integration

```typescript
// ✨ WebApp launch from Telegram - Auto-detected as Telegram Event
await sdk.writeData({
  eventType: 'webapp_opened',
  userId: 'user123',
  eventData: {
    webAppUrl: 'https://wallet.cere.network',
    launchParams: {
      theme: 'dark',
      lang: 'en',
      platform: 'ios',
    },
    referringMessage: 'msg_webapp_button',
  },
  timestamp: new Date(),
});

// ✨ Data exchange between WebApp and Telegram - Auto-detected as Telegram Event
await sdk.writeData({
  eventType: 'webapp_data_sent',
  userId: 'user123',
  eventData: {
    dataType: 'wallet_balance',
    dataSize: 1024,
    sendMethod: 'telegram_api',
    success: true,
  },
  timestamp: new Date(),
});
```

## Routing Patterns for Telegram Data

### 1. High-Volume Message Processing

```typescript
// For chat rooms with high message volume
await sdk.writeData(messageData, {
  writeMode: 'batch', // Use batching for efficiency
  priority: 'low', // Lower priority for bulk messages
  encryption: false, // Skip encryption for public messages
});
```

### 2. Critical Event Tracking

```typescript
// For important events that need immediate indexing
await sdk.writeData(eventData, {
  writeMode: 'viaIndex', // Write via Activity SDK for immediate indexing
  priority: 'high', // High priority processing
  encryption: true, // Encrypt sensitive event data
});
```

### 3. Analytics-Only Data

```typescript
// For data that only needs to be indexed (not stored in DDC)
await sdk.writeData(analyticsData, {
  priority: 'normal',
  metadata: {
    processing: {
      dataCloudWriteMode: 'skip', // Skip DDC storage
      indexWriteMode: 'realtime', // Index immediately
    },
  },
});
```

## Performance Optimization for Telegram

### 1. Batching Strategies

```typescript
// Configure SDK for high-throughput Telegram bots
const sdk = new UnifiedSDK({
  // ... other config
  processing: {
    enableBatching: true,
    defaultBatchSize: 100, // Larger batches for message processing
    defaultBatchTimeout: 2000, // 2 second timeout
    maxRetries: 3,
    retryDelay: 1000,
  },
});

// Batch process multiple events
const events = [
  { eventType: 'message_sent', userId: 'user1' /* ... */ },
  { eventType: 'message_sent', userId: 'user2' /* ... */ },
  { eventType: 'message_sent', userId: 'user3' /* ... */ },
];

for (const event of events) {
  // ✨ These will be automatically batched by the SDK - Auto-detected
  sdk.writeData(event, { writeMode: 'batch' });
}
```

### 2. Payload Size Optimization

```typescript
// ✨ For large media or file data - Auto-detected as Telegram Message
await sdk.writeData({
  messageId: 'large_video_msg',
  chatId: 'media_group',
  userId: 'user123',
  messageType: 'video',
  timestamp: new Date(),
  metadata: {
    fileReference: 'ddc://bucket123/video456.mp4', // Store reference instead of data
    fileSize: 50 * 1024 * 1024, // 50MB
    thumbnailUrl: 'https://cdn.example.com/thumb456.jpg',
  },
});
```

## Error Handling for Telegram Bots

### 1. Graceful Degradation

```typescript
try {
  // ✨ One method for all Telegram data
  await sdk.writeData(eventData);
} catch (error) {
  if (error instanceof UnifiedSDKError) {
    // Log the error but continue bot operation
    console.error('Event tracking failed:', error.message);

    // Maybe store in local queue for retry
    await localQueue.add(eventData);

    // Bot continues to respond to user
    await bot.sendMessage(chatId, 'Action completed!');
  }
}
```

### 2. Monitoring and Alerting

```typescript
// Check SDK health periodically
setInterval(async () => {
  const status = sdk.getStatus();

  if (!status.initialized) {
    // Alert monitoring system
    await alerting.send('Unified SDK not initialized');

    // Attempt to reinitialize
    try {
      await sdk.initialize();
    } catch (error) {
      await alerting.send('SDK initialization failed', error);
    }
  }
}, 30000); // Check every 30 seconds
```

## Best Practices for Telegram Integration

### 1. **Data Privacy**

- Always encrypt sensitive user data
- Use privacy-friendly user identifiers
- Implement data retention policies

### 2. **Performance**

- Use batching for high-volume bots
- Implement proper error handling
- Monitor SDK health and performance

### 3. **User Experience**

- Track user interactions to improve bot flow
- Monitor response times and optimize
- Implement graceful fallbacks

### 4. **Analytics**

- Track meaningful events that provide business value
- Use consistent event naming conventions
- Implement proper user attribution

### 5. **🎯 Simplicity**

- **Use only `writeData()`** - the SDK handles the complexity
- **Let automatic detection work** - structure your data properly and the SDK routes it correctly
- **No method confusion** - one method for all Telegram use cases

This guide demonstrates how the Unified SDK's **single `writeData()` method** with automatic detection makes Telegram bot development incredibly simple while maintaining full functionality and performance.
