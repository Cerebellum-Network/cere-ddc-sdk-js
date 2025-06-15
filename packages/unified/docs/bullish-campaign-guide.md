# Bullish Campaign Use Cases Guide

## Overview

The Unified SDK is specifically designed and optimized for Bullish campaign and quest system development. It provides **automatic detection** of Bullish campaign data types, intelligent routing for different campaign patterns, and seamless integration with Bullish's ecosystem.

## 🚀 Unified API for Bullish Campaigns

**The key advantage**: You only need to learn **ONE method** - `writeData()`. The SDK automatically detects whether your data is a Bullish campaign event, quest completion, or any other type and routes it appropriately.

### Automatic Detection

The SDK automatically detects Bullish campaign data types based on payload structure:

- **Bullish Campaign Events**: Automatically detected by `eventType`, `campaignId`, and `accountId` fields
- **Quest Completions**: Automatically detected by `eventType: 'QUESTION_ANSWERED'` or `'SEGMENT_WATCHED'` with campaign context
- **No method confusion**: Just call `writeData()` with your data structure

## Bullish Campaign Data Types

### BullishCampaignEvent (Auto-detected)

**Detected when payload contains:**
- `eventType` (string)
- `campaignId` (string)
- `accountId` (string)

```typescript
interface BullishCampaignEvent {
  eventType: 'SEGMENT_WATCHED' | 'QUESTION_ANSWERED' | 'JOIN_CAMPAIGN' | 'CUSTOM_EVENTS';
  campaignId: string;
  accountId: string;
  timestamp: Date;
  eventData: Record<string, any>; // Campaign-specific data
  questId?: string; // Optional quest identifier
  metadata?: Record<string, any>; // Additional campaign metadata
}
```

## Common Bullish Campaign Use Cases

### 1. Video Segment Tracking

```typescript
// ✨ Video segment completion - Auto-detected as Bullish Campaign Event
const result = await sdk.writeData({
  eventType: 'SEGMENT_WATCHED',
  campaignId: 'bullish_education_2024',
  accountId: 'user_12345',
  eventData: {
    segmentId: 'intro_trading_basics',
    segmentTitle: 'Introduction to Trading',
    watchDuration: 180000, // 3 minutes in milliseconds
    totalDuration: 300000, // 5 minutes total
    completionPercentage: 60,
    watchedAt: new Date(),
  },
  questId: 'education_quest_001',
  timestamp: new Date(),
});

// ✨ Full video completion - Auto-detected as Bullish Campaign Event
const completionResult = await sdk.writeData({
  eventType: 'SEGMENT_WATCHED',
  campaignId: 'bullish_education_2024',
  accountId: 'user_12345',
  eventData: {
    segmentId: 'advanced_strategies',
    segmentTitle: 'Advanced Trading Strategies',
    watchDuration: 900000, // 15 minutes
    totalDuration: 900000, // Full duration
    completionPercentage: 100,
    watchedAt: new Date(),
    isCompleted: true,
  },
  questId: 'education_quest_002',
  timestamp: new Date(),
});

console.log('Segment tracking stored:', result.transactionId);
console.log('DDC CID:', result.dataCloudHash);
```

### 2. Quiz and Question Answering

```typescript
// ✨ Quiz question answered - Auto-detected as Bullish Campaign Event
const quizResult = await sdk.writeData({
  eventType: 'QUESTION_ANSWERED',
  campaignId: 'bullish_quiz_challenge',
  accountId: 'user_67890',
  eventData: {
    questionId: 'q_trading_001',
    questionText: 'What is a bull market?',
    selectedAnswer: 'A market with rising prices',
    correctAnswer: 'A market with rising prices',
    isCorrect: true,
    timeToAnswer: 15000, // 15 seconds
    points: 10,
    answeredAt: new Date(),
  },
  questId: 'quiz_quest_001',
  timestamp: new Date(),
});

// ✨ Quiz completion - Auto-detected as Bullish Campaign Event
const quizCompletionResult = await sdk.writeData({
  eventType: 'QUESTION_ANSWERED',
  campaignId: 'bullish_quiz_challenge',
  accountId: 'user_67890',
  eventData: {
    quizId: 'trading_basics_quiz',
    totalQuestions: 10,
    correctAnswers: 8,
    totalPoints: 80,
    completionTime: 300000, // 5 minutes
    accuracy: 80,
    completedAt: new Date(),
    isQuizCompleted: true,
  },
  questId: 'quiz_quest_001',
  timestamp: new Date(),
});

console.log('Quiz answer stored:', quizResult.transactionId);
```

### 3. Campaign Participation

```typescript
// ✨ User joins campaign - Auto-detected as Bullish Campaign Event
const joinResult = await sdk.writeData({
  eventType: 'JOIN_CAMPAIGN',
  campaignId: 'bullish_rewards_2024',
  accountId: 'user_11111',
  eventData: {
    joinedAt: new Date(),
    referralCode: 'FRIEND123',
    userTier: 'premium',
    initialPoints: 0,
    campaignType: 'education',
    expectedDuration: '30_days',
  },
  timestamp: new Date(),
});

// ✨ Campaign milestone reached - Auto-detected as Bullish Campaign Event
const milestoneResult = await sdk.writeData({
  eventType: 'CUSTOM_EVENTS',
  campaignId: 'bullish_rewards_2024',
  accountId: 'user_11111',
  eventData: {
    eventName: 'milestone_reached',
    milestoneId: 'first_week_complete',
    milestoneType: 'time_based',
    pointsEarned: 500,
    totalPoints: 1250,
    progressPercentage: 25,
    reachedAt: new Date(),
  },
  timestamp: new Date(),
});

console.log('Campaign participation stored:', joinResult.transactionId);
```

### 4. Custom Campaign Events

```typescript
// ✨ Trading simulation - Auto-detected as Bullish Campaign Event
const tradingResult = await sdk.writeData({
  eventType: 'CUSTOM_EVENTS',
  campaignId: 'bullish_trading_sim',
  accountId: 'user_22222',
  eventData: {
    eventName: 'trade_executed',
    tradeType: 'buy',
    symbol: 'BTC/USD',
    amount: 0.1,
    price: 45000,
    profit: 250.50,
    isSimulated: true,
    executedAt: new Date(),
  },
  questId: 'trading_sim_quest',
  timestamp: new Date(),
});

// ✨ Social sharing - Auto-detected as Bullish Campaign Event
const shareResult = await sdk.writeData({
  eventType: 'CUSTOM_EVENTS',
  campaignId: 'bullish_social_2024',
  accountId: 'user_33333',
  eventData: {
    eventName: 'achievement_shared',
    platform: 'twitter',
    achievementId: 'first_profitable_trade',
    shareUrl: 'https://bullish.com/share/achievement/123',
    engagement: {
      likes: 15,
      retweets: 3,
      comments: 2,
    },
    sharedAt: new Date(),
  },
  timestamp: new Date(),
});

console.log('Custom event stored:', tradingResult.transactionId);
```

## Advanced Configuration for Bullish Campaigns

### High-Priority Campaign Events

```typescript
// Campaign completions with high priority
const urgentResult = await sdk.writeData(
  {
    eventType: 'SEGMENT_WATCHED',
    campaignId: 'vip_exclusive_2024',
    accountId: 'vip_user_123',
    eventData: {
      segmentId: 'exclusive_content',
      completionPercentage: 100,
      tier: 'vip',
    },
    timestamp: new Date(),
  },
  {
    priority: 'high',
    encryption: true, // Encrypt sensitive campaign data
    metadata: {
      processing: {
        dataCloudWriteMode: 'direct', // Skip batch for immediate storage
        indexWriteMode: 'realtime',
      },
    },
  }
);
```

### Batch Processing for High Volume Campaigns

```typescript
// Configure for high-volume campaign processing
const batchResult = await sdk.writeData(
  {
    eventType: 'QUESTION_ANSWERED',
    campaignId: 'mass_quiz_event',
    accountId: 'user_' + Date.now(),
    eventData: {
      questionId: 'bulk_q_001',
      isCorrect: true,
      points: 5,
    },
    timestamp: new Date(),
  },
  {
    writeMode: 'batch',
    metadata: {
      processing: {
        dataCloudWriteMode: 'batch',
        indexWriteMode: 'realtime',
        batchOptions: {
          maxSize: 100,
          maxWaitTime: 1000,
        },
      },
    },
  }
);
```

### Custom Metadata for Campaign Analytics

```typescript
// Add custom analytics context for campaigns
const analyticsResult = await sdk.writeData(
  {
    eventType: 'CUSTOM_EVENTS',
    campaignId: 'bullish_analytics_test',
    accountId: 'user_analytics',
    eventData: {
      eventName: 'button_click',
      buttonId: 'start_quest_btn',
      sessionDuration: 300000, // 5 minutes
    },
    timestamp: new Date(),
  },
  {
    metadata: {
      processing: {
        dataCloudWriteMode: 'viaIndex',
        indexWriteMode: 'realtime',
      },
      campaignContext: {
        source: 'bullish_web_app',
        version: 'v2.1.0',
        userSegment: 'premium',
        experimentGroup: 'variant_a',
        campaignPhase: 'launch',
      },
      traceId: 'campaign_session_xyz789',
    },
  }
);
```

## Real-World Bullish Campaign Integration Example

```typescript
import { UnifiedSDK } from '@cere-ddc-sdk/unified';

/**
 * Bullish Campaign Service
 * Handles all campaign-related data ingestion
 */
class BullishCampaignService {
  private sdk: UnifiedSDK;

  constructor() {
    // Initialize SDK with Bullish-optimized configuration
    this.sdk = new UnifiedSDK({
      ddcConfig: {
        signer: process.env.BULLISH_DDC_SIGNER!,
        bucketId: BigInt(process.env.BULLISH_BUCKET_ID!),
        network: 'mainnet',
      },
      activityConfig: {
        endpoint: 'https://api.stats.cere.network',
        keyringUri: process.env.BULLISH_KEYRING_URI!,
        appId: 'bullish-campaigns',
        appPubKey: process.env.BULLISH_APP_PUBLIC_KEY!,
        dataServicePubKey: process.env.DATA_SERVICE_PUBLIC_KEY!,
      },
      processing: {
        enableBatching: true,
        defaultBatchSize: 50,
        defaultBatchTimeout: 2000,
        maxRetries: 5,
        retryDelay: 1000,
      },
      logging: {
        level: 'info',
        enableMetrics: true,
      },
    });
  }

  async initialize() {
    await this.sdk.initialize();
    console.log('✅ Bullish Campaign Service initialized');
  }

  // Video segment tracking
  async trackVideoSegment(
    campaignId: string,
    accountId: string,
    segmentData: any,
    questId?: string
  ) {
    // ✨ Auto-detected as Bullish Campaign Event
    return await this.sdk.writeData({
      eventType: 'SEGMENT_WATCHED',
      campaignId,
      accountId,
      eventData: segmentData,
      questId,
      timestamp: new Date(),
    });
  }

  // Quiz answer tracking
  async trackQuizAnswer(
    campaignId: string,
    accountId: string,
    answerData: any,
    questId?: string
  ) {
    // ✨ Auto-detected as Bullish Campaign Event
    return await this.sdk.writeData({
      eventType: 'QUESTION_ANSWERED',
      campaignId,
      accountId,
      eventData: answerData,
      questId,
      timestamp: new Date(),
    });
  }

  // Campaign participation
  async trackCampaignJoin(campaignId: string, accountId: string, joinData: any) {
    // ✨ Auto-detected as Bullish Campaign Event
    return await this.sdk.writeData({
      eventType: 'JOIN_CAMPAIGN',
      campaignId,
      accountId,
      eventData: joinData,
      timestamp: new Date(),
    });
  }

  // Custom campaign events
  async trackCustomEvent(
    campaignId: string,
    accountId: string,
    eventData: any,
    questId?: string
  ) {
    // ✨ Auto-detected as Bullish Campaign Event
    return await this.sdk.writeData({
      eventType: 'CUSTOM_EVENTS',
      campaignId,
      accountId,
      eventData,
      questId,
      timestamp: new Date(),
    });
  }

  // Batch processing for high-volume events
  async trackBulkEvents(events: Array<{
    eventType: string;
    campaignId: string;
    accountId: string;
    eventData: any;
    questId?: string;
  }>) {
    const promises = events.map(event =>
      this.sdk.writeData({
        ...event,
        timestamp: new Date(),
      }, {
        writeMode: 'batch',
        metadata: {
          processing: {
            dataCloudWriteMode: 'batch',
            indexWriteMode: 'realtime',
          },
        },
      })
    );

    return await Promise.all(promises);
  }

  // Error handling with campaign context
  async trackWithErrorHandling(eventData: any) {
    try {
      const result = await this.sdk.writeData(eventData);
      
      if (result.status === 'partial') {
        console.warn('Campaign event partially processed:', result.errors);
        // Campaign still tracked, some features might be limited
      }
      
      return result;
      
    } catch (error) {
      console.error('Failed to track campaign event:', error);
      
      // Log error but continue campaign flow
      await this.trackCustomEvent(
        eventData.campaignId,
        eventData.accountId,
        {
          eventName: 'tracking_error',
          originalEvent: eventData.eventType,
          error: error.message,
          timestamp: new Date(),
        }
      );
      
      throw error;
    }
  }

  async cleanup() {
    await this.sdk.cleanup();
  }
}

// Usage example
const campaignService = new BullishCampaignService();
await campaignService.initialize();

// Track video segment
await campaignService.trackVideoSegment(
  'bullish_education_2024',
  'user_12345',
  {
    segmentId: 'trading_basics_001',
    watchDuration: 180000,
    completionPercentage: 100,
  },
  'education_quest_001'
);

// Track quiz completion
await campaignService.trackQuizAnswer(
  'bullish_quiz_challenge',
  'user_12345',
  {
    questionId: 'q_001',
    isCorrect: true,
    points: 10,
    timeToAnswer: 15000,
  },
  'quiz_quest_001'
);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down Bullish Campaign Service...');
  await campaignService.cleanup();
  process.exit(0);
});
```

## Benefits for Bullish Campaign Developers

### 🎯 **Ultimate Simplicity**
- **One method**: `writeData()` for all Bullish campaign data
- **Auto-detection**: No need to choose between different event methods
- **Zero configuration**: Automatic routing based on campaign data structure

### 🤖 **Intelligent Campaign Processing**
- **Context awareness**: Understands Bullish campaign-specific patterns
- **Optimal routing**: Automatically chooses best storage/indexing strategy for campaigns
- **Performance optimization**: Batching for high-volume campaign scenarios

### 📊 **Campaign Analytics Ready**
- **Automatic indexing**: Campaign events are automatically indexed for analytics
- **Quest tracking**: Built-in quest progress tracking and completion detection
- **Campaign relationships**: CIDs link related campaign data across systems

### 🔧 **Production Campaign Features**
- **Error handling**: Graceful fallbacks when services unavailable
- **Campaign monitoring**: Built-in metrics and health checks for campaigns
- **Scalability**: Handles high-volume campaign scenarios efficiently

## Response Format

All `writeData()` calls return a `UnifiedResponse`:

```typescript
interface UnifiedResponse {
  transactionId: string; // Unique transaction identifier
  status: 'success' | 'partial' | 'failed';
  
  // DDC storage reference (when stored)
  dataCloudHash?: string; // CID for DDC-stored campaign data
  
  // Activity SDK reference (when indexed)
  indexId?: string; // Event ID for campaign analytics queries
  
  errors?: Array<{
    component: string;
    error: string;
    recoverable: boolean;
  }>;
  
  metadata: {
    processedAt: Date;
    processingTime: number;
    actionsExecuted: string[]; // Which services were used
    campaignContext?: {
      campaignId: string;
      questId?: string;
      traceId: string;
    };
  };
}
```

## Error Handling for Bullish Campaigns

```typescript
async function handleCampaignData(campaignData: any) {
  try {
    const result = await sdk.writeData(campaignData);
    
    if (result.status === 'partial') {
      console.warn('Campaign event partially processed:', result.errors);
      // Campaign tracking still works, just some features might be limited
    }
    
    return result.transactionId;
    
  } catch (error) {
    if (error instanceof UnifiedSDKError) {
      console.error('Campaign SDK error:', error.code, error.message);
      
      // Handle recoverable campaign errors
      if (error.recoverable) {
        // Retry logic for campaign events
        setTimeout(() => handleCampaignData(campaignData), 5000);
      }
    }
    
    // Log error but keep campaign flow running
    console.error('Failed to store campaign data:', error);
    return null;
  }
}
```

## Migration from Direct Campaign Integration

If you're currently using DDC Client or Activity SDK directly for campaigns:

```typescript
// ❌ Before: Multiple SDK calls for campaign data
await ddcClient.store(bucketId, campaignEventData);
await activitySDK.sendEvent(bullishCampaignEvent);

// ✅ After: Single unified call with automatic detection
await sdk.writeData({
  eventType: 'SEGMENT_WATCHED',
  campaignId: 'bullish_education_2024',
  accountId: 'user_12345',
  eventData: { segmentId: 'intro', completionPercentage: 100 },
  timestamp: new Date(),
});
```

## Configuration Tips for Bullish Campaigns

### For High-Volume Campaign Events

```typescript
const config = {
  // ... other config
  processing: {
    enableBatching: true,
    defaultBatchSize: 100, // Larger batches for campaign events
    defaultBatchTimeout: 1000, // Faster processing for real-time campaigns
    maxRetries: 5,
    retryDelay: 500,
  },
  logging: {
    level: 'warn', // Reduce log noise for high-volume campaigns
    enableMetrics: true,
  },
};
```

### For Analytics-Heavy Campaigns

```typescript
const config = {
  // ... other config
  processing: {
    enableBatching: false, // Real-time processing for immediate analytics
    maxRetries: 3,
    retryDelay: 1000,
  },
  logging: {
    level: 'info',
    enableMetrics: true, // Critical for campaign analytics
  },
};
```

The Unified SDK makes Bullish campaign development incredibly simple while providing enterprise-grade reliability and performance. Just call `writeData()` with your campaign data, and the SDK handles all the complexity behind the scenes!

### 4. Bullish Campaign Migration

**Before:**

```typescript
// Multiple methods for different campaign data types
import { DDCClient } from '@cere-ddc-sdk/ddc-client';
import { EventDispatcher } from '@cere-activity-sdk/events';

// Manual coordination for campaign events
const ddcResult = await ddcClient.store(campaignData);
const activityResult = await eventDispatcher.dispatchEvent(campaignEvent);
```

**After:**

```typescript
// ✨ ONE method for all campaign data - auto-detected
// Video segment tracking
await sdk.writeData({
  eventType: 'SEGMENT_WATCHED', // Auto-detected as Bullish Campaign Event
  campaignId: 'bullish_education_2024',
  accountId: 'user_12345',
  eventData: { segmentId: 'intro', completionPercentage: 100 },
  timestamp: new Date(),
});

// Quiz answer tracking
await sdk.writeData({
  eventType: 'QUESTION_ANSWERED', // Auto-detected as Bullish Campaign Event
  campaignId: 'bullish_quiz_challenge',
  accountId: 'user_67890',
  eventData: { questionId: 'q_001', isCorrect: true, points: 10 },
  timestamp: new Date(),
});
``` 