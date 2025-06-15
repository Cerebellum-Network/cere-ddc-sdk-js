# Bullish Campaign Migration Guide

## Overview

This guide helps you migrate from using individual DDC Client and Activity SDK packages to the Unified Data Ingestion SDK for Bullish campaign integration. The migration provides significant benefits including **one unified method**, automatic Bullish campaign data detection, intelligent quest routing, better error handling, and optimized performance for campaign scenarios.

## Migration Benefits

### Before: Multiple SDKs for Campaign Data

```typescript
// Old approach - managing multiple SDKs for Bullish campaigns
import { DdcClient, DagNode, File } from '@cere-ddc-sdk/ddc-client';
import { EventDispatcher, ActivityEvent } from '@cere-activity-sdk/events';
import { UriSigner } from '@cere-activity-sdk/signers';
import { NoOpCipher } from '@cere-activity-sdk/ciphers';

// Complex initialization for campaign tracking
const ddcClient = await DdcClient.create(signer, config);
const activitySigner = new UriSigner(keyringUri);
const cipher = new NoOpCipher();
const eventDispatcher = new EventDispatcher(activitySigner, cipher, activityConfig);

// Manual coordination between systems for campaign events
try {
  // Store campaign data in DDC
  const campaignNode = new DagNode('bullish_campaign_event', {
    eventType: 'SEGMENT_WATCHED',
    campaignId: 'bullish_education_2024',
    accountId: 'user_12345',
    eventData: { segmentId: 'intro', completionPercentage: 100 }
  });
  const cid = await ddcClient.store(bucketId, campaignNode);

  // Index campaign event in Activity SDK
  const campaignEvent = new ActivityEvent('bullish.segment_watched', {
    campaignId: 'bullish_education_2024',
    accountId: 'user_12345',
    cid: cid
  });
  await eventDispatcher.dispatchEvent(campaignEvent);
} catch (error) {
  // Complex error handling across multiple systems for campaigns
  // Manual fallback logic for campaign data
}
```

### After: Unified SDK for Bullish Campaigns ⭐

```typescript
// New approach - single SDK with ONE method for all campaign data
import { UnifiedSDK } from '@cere-ddc-sdk/unified';

// Simple initialization for campaign tracking
const sdk = new UnifiedSDK({
  ddcConfig: {
    /* ... */
  },
  activityConfig: {
    /* ... */
  },
});

await sdk.initialize();

// ✨ ONE method for all campaign data - automatic detection and routing
const response = await sdk.writeData({
  eventType: 'SEGMENT_WATCHED',
  campaignId: 'bullish_education_2024',
  accountId: 'user_12345',
  eventData: {
    segmentId: 'intro_trading_basics',
    completionPercentage: 100,
    watchDuration: 300000,
  },
  questId: 'education_quest_001',
  timestamp: new Date(),
});

// The SDK automatically:
// 1. Detects this is a Bullish campaign event
// 2. Routes to both DDC and Activity SDK with campaign-specific metadata
// 3. Handles all errors and fallbacks for campaign scenarios
// 4. Returns unified response with campaign context
```

## Key Migration Principles for Bullish Campaigns

### 🎯 From Multiple Methods to ONE Method for Campaigns

**Before (Complex Campaign Integration):**

- `ddcClient.store()` for campaign data storage
- `eventDispatcher.dispatchEvent()` for campaign analytics
- Different methods for video segments, quiz answers, custom events
- Manual coordination between systems for quest tracking

**After (Simple Campaign Integration):**

```typescript
// ✨ ONE method for ALL campaign data
await sdk.writeData(anyCampaignData);
```

### 🤖 Automatic Bullish Campaign Detection

**Before:** You had to know which method to call for different campaign events
**After:** Just pass your campaign data structure - the SDK detects Bullish campaigns automatically

```typescript
// All these are detected automatically as Bullish Campaign Events:

// Video segment tracking (detected by eventType + campaignId + accountId)
await sdk.writeData({
  eventType: 'SEGMENT_WATCHED',
  campaignId: 'bullish_education_2024',
  accountId: 'user_12345',
  eventData: {
    segmentId: 'trading_basics_001',
    completionPercentage: 100,
  },
  timestamp: new Date(),
});

// Quiz answer tracking (detected by eventType + campaignId + accountId)
await sdk.writeData({
  eventType: 'QUESTION_ANSWERED',
  campaignId: 'bullish_quiz_challenge',
  accountId: 'user_67890',
  eventData: {
    questionId: 'q_001',
    isCorrect: true,
    points: 10,
  },
  timestamp: new Date(),
});

// Campaign participation (detected by eventType + campaignId + accountId)
await sdk.writeData({
  eventType: 'JOIN_CAMPAIGN',
  campaignId: 'bullish_rewards_2024',
  accountId: 'user_11111',
  eventData: {
    joinedAt: new Date(),
    referralCode: 'FRIEND123',
  },
  timestamp: new Date(),
});

// Custom campaign events (detected by eventType + campaignId + accountId)
await sdk.writeData({
  eventType: 'CUSTOM_EVENTS',
  campaignId: 'bullish_trading_sim',
  accountId: 'user_22222',
  eventData: {
    eventName: 'trade_executed',
    tradeType: 'buy',
    symbol: 'BTC/USD',
  },
  timestamp: new Date(),
});
```

## Migration Strategies for Bullish Campaigns

### 1. Gradual Campaign Migration (Recommended)

Migrate campaign functionality incrementally while maintaining existing systems:

**Phase 1: Install and Test with Sample Campaign**

```typescript
// Add Unified SDK alongside existing campaign SDKs
npm install @cere-ddc-sdk/unified

// Initialize and test with one campaign event type
const sdk = new UnifiedSDK(config);
await sdk.initialize();

// Test with simple campaign event first
const testResult = await sdk.writeData({
  eventType: 'SEGMENT_WATCHED',
  campaignId: 'test_migration_campaign',
  accountId: 'test_user',
  eventData: {
    segmentId: 'migration_test',
    completionPercentage: 100,
  },
  timestamp: new Date(),
});

console.log('Campaign migration test successful:', testResult);
```

**Phase 2: Replace Individual Campaign Operations**

```typescript
// Replace DDC campaign operations
// OLD:
// const campaignNode = new DagNode('campaign_data', campaignData);
// const cid = await ddcClient.store(bucketId, campaignNode);

// NEW:
const result = await sdk.writeData(campaignData, {
  writeMode: 'direct', // Forces DDC storage for campaigns
  metadata: {
    processing: {
      dataCloudWriteMode: 'direct',
      indexWriteMode: 'skip', // Skip Activity SDK if not needed for this campaign
    },
  },
});
```

**Phase 3: Migrate Complex Campaign Workflows**

```typescript
// Replace complex multi-SDK campaign operations
// OLD:
// try {
//   const cid = await ddcClient.store(bucketId, campaignNode);
//   const campaignEvent = new ActivityEvent('bullish.campaign_event', { 
//     cid, 
//     campaignId: 'bullish_education_2024',
//     ...campaignData 
//   });
//   await dispatcher.dispatchEvent(campaignEvent);
// } catch (error) { /* complex campaign error handling */ }

// NEW:
const result = await sdk.writeData({
  eventType: 'SEGMENT_WATCHED',
  campaignId: 'bullish_education_2024',
  accountId: 'user_12345',
  eventData: campaignData,
  timestamp: new Date(),
}); // Handles everything automatically with campaign-specific optimizations
```

**Phase 4: Remove Legacy Campaign Dependencies**

```typescript
// Remove old SDK imports and dependencies
// npm uninstall @cere-ddc-sdk/ddc-client @cere-activity-sdk/events
```

### 2. Complete Campaign Migration

For new Bullish campaign projects or major refactoring:

```typescript
// Replace entire campaign data service with unified approach
class BullishCampaignDataService {
  private sdk: UnifiedSDK;

  constructor(config: UnifiedSDKConfig) {
    this.sdk = new UnifiedSDK(config);
  }

  async initialize() {
    await this.sdk.initialize();
  }

  // ✨ ONE method replaces all previous campaign data operations
  async storeCampaignData(data: any, options?: WriteOptions) {
    return this.sdk.writeData(data, options);
  }

  // Convenience wrappers for specific campaign events (but not required)
  async trackVideoSegment(campaignId: string, accountId: string, segmentData: any) {
    return this.sdk.writeData({
      eventType: 'SEGMENT_WATCHED',
      campaignId,
      accountId,
      eventData: segmentData,
      timestamp: new Date(),
    }); // Auto-detected as Bullish Campaign Event
  }

  async trackQuizAnswer(campaignId: string, accountId: string, answerData: any) {
    return this.sdk.writeData({
      eventType: 'QUESTION_ANSWERED',
      campaignId,
      accountId,
      eventData: answerData,
      timestamp: new Date(),
    }); // Auto-detected as Bullish Campaign Event
  }

  async trackCampaignJoin(campaignId: string, accountId: string, joinData: any) {
    return this.sdk.writeData({
      eventType: 'JOIN_CAMPAIGN',
      campaignId,
      accountId,
      eventData: joinData,
      timestamp: new Date(),
    }); // Auto-detected as Bullish Campaign Event
  }

  async trackCustomCampaignEvent(campaignId: string, accountId: string, eventData: any) {
    return this.sdk.writeData({
      eventType: 'CUSTOM_EVENTS',
      campaignId,
      accountId,
      eventData,
      timestamp: new Date(),
    }); // Auto-detected as Bullish Campaign Event
  }
}
```

## Common Bullish Campaign Migration Patterns

### 1. Video Segment Tracking Migration

**Before:**

```typescript
import { DdcClient, DagNode } from '@cere-ddc-sdk/ddc-client';
import { EventDispatcher, ActivityEvent } from '@cere-activity-sdk/events';

// Manual video segment tracking
const segmentData = {
  segmentId: 'trading_basics_001',
  campaignId: 'bullish_education_2024',
  accountId: 'user_12345',
  watchDuration: 300000,
  completionPercentage: 100,
};

// Store in DDC
const segmentNode = new DagNode('video_segment', segmentData);
const cid = await ddcClient.store(bucketId, segmentNode);

// Index in Activity SDK
const segmentEvent = new ActivityEvent('bullish.segment_watched', {
  ...segmentData,
  cid: cid,
});
await eventDispatcher.dispatchEvent(segmentEvent);
```

**After:**

```typescript
// ✨ Automatic video segment tracking with ONE method
const result = await sdk.writeData({
  eventType: 'SEGMENT_WATCHED', // Auto-detected as Bullish Campaign Event
  campaignId: 'bullish_education_2024',
  accountId: 'user_12345',
  eventData: {
    segmentId: 'trading_basics_001',
    watchDuration: 300000,
    completionPercentage: 100,
  },
  questId: 'education_quest_001', // Optional quest tracking
  timestamp: new Date(),
});

// SDK automatically:
// - Detects this is a Bullish campaign event
// - Stores in DDC with campaign-specific metadata
// - Indexes in Activity SDK with quest context
// - Generates campaign trace ID
// - Handles all errors and retries
```

### 2. Quiz Answer Tracking Migration

**Before:**

```typescript
// Manual quiz answer coordination
const answerData = {
  questionId: 'q_trading_001',
  campaignId: 'bullish_quiz_challenge',
  accountId: 'user_67890',
  selectedAnswer: 'A market with rising prices',
  isCorrect: true,
  points: 10,
};

// Multiple SDK calls
const answerNode = new DagNode('quiz_answer', answerData);
const cid = await ddcClient.store(bucketId, answerNode);

const quizEvent = new ActivityEvent('bullish.question_answered', {
  ...answerData,
  cid: cid,
});
await eventDispatcher.dispatchEvent(quizEvent);
```

**After:**

```typescript
// ✨ Automatic quiz answer tracking
const result = await sdk.writeData({
  eventType: 'QUESTION_ANSWERED', // Auto-detected as Bullish Campaign Event
  campaignId: 'bullish_quiz_challenge',
  accountId: 'user_67890',
  eventData: {
    questionId: 'q_trading_001',
    selectedAnswer: 'A market with rising prices',
    isCorrect: true,
    points: 10,
    timeToAnswer: 15000,
  },
  questId: 'quiz_quest_001',
  timestamp: new Date(),
});
```

### 3. Campaign Participation Migration

**Before:**

```typescript
// Manual campaign join tracking
const joinData = {
  campaignId: 'bullish_rewards_2024',
  accountId: 'user_11111',
  joinedAt: new Date(),
  referralCode: 'FRIEND123',
  userTier: 'premium',
};

// Separate storage and indexing
const joinNode = new DagNode('campaign_join', joinData);
const cid = await ddcClient.store(bucketId, joinNode);

const joinEvent = new ActivityEvent('bullish.campaign_joined', {
  ...joinData,
  cid: cid,
});
await eventDispatcher.dispatchEvent(joinEvent);
```

**After:**

```typescript
// ✨ Automatic campaign participation tracking
const result = await sdk.writeData({
  eventType: 'JOIN_CAMPAIGN', // Auto-detected as Bullish Campaign Event
  campaignId: 'bullish_rewards_2024',
  accountId: 'user_11111',
  eventData: {
    joinedAt: new Date(),
    referralCode: 'FRIEND123',
    userTier: 'premium',
    initialPoints: 0,
  },
  timestamp: new Date(),
});
```

### 4. Custom Campaign Events Migration

**Before:**

```typescript
// Manual custom event handling
const customEventData = {
  eventName: 'trade_executed',
  campaignId: 'bullish_trading_sim',
  accountId: 'user_22222',
  tradeType: 'buy',
  symbol: 'BTC/USD',
  amount: 0.1,
  profit: 250.50,
};

// Complex custom event storage
const customNode = new DagNode('custom_campaign_event', customEventData);
const cid = await ddcClient.store(bucketId, customNode);

const customEvent = new ActivityEvent('bullish.custom_event', {
  ...customEventData,
  cid: cid,
});
await eventDispatcher.dispatchEvent(customEvent);
```

**After:**

```typescript
// ✨ Automatic custom campaign event handling
const result = await sdk.writeData({
  eventType: 'CUSTOM_EVENTS', // Auto-detected as Bullish Campaign Event
  campaignId: 'bullish_trading_sim',
  accountId: 'user_22222',
  eventData: {
    eventName: 'trade_executed',
    tradeType: 'buy',
    symbol: 'BTC/USD',
    amount: 0.1,
    profit: 250.50,
    isSimulated: true,
  },
  timestamp: new Date(),
});
```

## Campaign-Specific Migration Considerations

### 1. Quest Tracking Integration

**Before:** Manual quest progress tracking

```typescript
// Separate quest tracking logic
if (eventType === 'SEGMENT_WATCHED' && completionPercentage === 100) {
  // Update quest progress manually
  await updateQuestProgress(questId, accountId, 'segment_completed');
}
```

**After:** Automatic quest integration

```typescript
// ✨ Quest tracking is automatic when questId is provided
const result = await sdk.writeData({
  eventType: 'SEGMENT_WATCHED',
  campaignId: 'bullish_education_2024',
  accountId: 'user_12345',
  eventData: { segmentId: 'intro', completionPercentage: 100 },
  questId: 'education_quest_001', // Automatic quest progress tracking
  timestamp: new Date(),
});

// SDK automatically handles quest updates in the background
```

### 2. Campaign Metrics and Analytics

**Before:** Manual metrics collection

```typescript
// Manual campaign metrics
await recordCampaignMetric('segment_completion', {
  campaignId: 'bullish_education_2024',
  accountId: 'user_12345',
  value: 1,
});
```

**After:** Automatic campaign metrics

```typescript
// ✨ Campaign metrics are automatically collected
const result = await sdk.writeData({
  eventType: 'SEGMENT_WATCHED',
  campaignId: 'bullish_education_2024',
  accountId: 'user_12345',
  eventData: { completionPercentage: 100 },
  timestamp: new Date(),
});

// SDK automatically:
// - Updates campaign completion metrics
// - Tracks user engagement patterns
// - Records quest progress
// - Generates analytics events
```

### 3. High-Volume Campaign Events

**Before:** Manual batching for campaign events

```typescript
// Manual batching logic for high-volume campaigns
const batchSize = 50;
const campaignEvents = [];

for (const event of highVolumeCampaignEvents) {
  campaignEvents.push(event);
  
  if (campaignEvents.length >= batchSize) {
    await processCampaignEventBatch(campaignEvents);
    campaignEvents.length = 0;
  }
}
```

**After:** Automatic intelligent batching

```typescript
// ✨ Automatic batching for high-volume campaign scenarios
const results = await Promise.all(
  highVolumeCampaignEvents.map(event =>
    sdk.writeData({
      eventType: event.type,
      campaignId: event.campaignId,
      accountId: event.accountId,
      eventData: event.data,
      timestamp: new Date(),
    }, {
      writeMode: 'batch', // Automatic intelligent batching
      metadata: {
        processing: {
          batchOptions: {
            maxSize: 100,
            maxWaitTime: 1000,
          },
        },
      },
    })
  )
);
```

## Error Handling Migration for Campaigns

### Before: Complex Campaign Error Handling

```typescript
try {
  const cid = await ddcClient.store(bucketId, campaignNode);
  
  try {
    await eventDispatcher.dispatchEvent(campaignEvent);
  } catch (activityError) {
    // Manual fallback for campaign events
    console.error('Activity SDK failed for campaign:', activityError);
    // Complex retry logic for campaigns
  }
} catch (ddcError) {
  console.error('DDC storage failed for campaign:', ddcError);
  // Manual campaign error recovery
}
```

### After: Unified Campaign Error Handling

```typescript
try {
  const result = await sdk.writeData({
    eventType: 'SEGMENT_WATCHED',
    campaignId: 'bullish_education_2024',
    accountId: 'user_12345',
    eventData: { segmentId: 'intro', completionPercentage: 100 },
    timestamp: new Date(),
  });
  
  if (result.status === 'partial') {
    console.warn('Campaign event partially processed:', result.errors);
    // Campaign still tracked, some features might be limited
  }
  
} catch (error) {
  if (error instanceof UnifiedSDKError && error.recoverable) {
    // Automatic retry for recoverable campaign errors
    console.log('Retrying campaign event...');
  } else {
    console.error('Campaign event failed:', error);
  }
}
```

## Configuration Migration for Campaigns

### Optimized Configuration for Bullish Campaigns

```typescript
// Campaign-optimized configuration
const campaignConfig = {
  ddcConfig: {
    signer: process.env.BULLISH_DDC_SIGNER,
    bucketId: BigInt(process.env.BULLISH_CAMPAIGN_BUCKET_ID),
    network: 'mainnet',
  },
  activityConfig: {
    endpoint: 'https://api.stats.cere.network',
    keyringUri: process.env.BULLISH_KEYRING_URI,
    appId: 'bullish-campaigns',
    appPubKey: process.env.BULLISH_APP_PUBLIC_KEY,
    dataServicePubKey: process.env.DATA_SERVICE_PUBLIC_KEY,
  },
  processing: {
    enableBatching: true,
    defaultBatchSize: 50, // Optimized for campaign events
    defaultBatchTimeout: 2000, // Fast processing for real-time campaigns
    maxRetries: 5, // Higher retries for important campaign data
    retryDelay: 1000,
  },
  logging: {
    level: 'info',
    enableMetrics: true, // Important for campaign analytics
  },
};

const sdk = new UnifiedSDK(campaignConfig);
```

## Testing Migration for Campaigns

### Before: Complex Campaign Testing

```typescript
// Testing multiple SDKs for campaigns
describe('Campaign Integration', () => {
  let ddcClient, eventDispatcher;
  
  beforeEach(async () => {
    ddcClient = await DdcClient.create(testSigner, testConfig);
    eventDispatcher = new EventDispatcher(testSigner, cipher, activityConfig);
  });
  
  it('should store and index campaign event', async () => {
    const campaignNode = new DagNode('campaign_event', testCampaignData);
    const cid = await ddcClient.store(testBucketId, campaignNode);
    
    const campaignEvent = new ActivityEvent('bullish.test_event', {
      ...testCampaignData,
      cid,
    });
    await eventDispatcher.dispatchEvent(campaignEvent);
    
    // Complex verification across multiple systems
  });
});
```

### After: Simple Campaign Testing

```typescript
// Testing unified campaign integration
describe('Bullish Campaign Integration', () => {
  let sdk: UnifiedSDK;
  
  beforeEach(async () => {
    sdk = new UnifiedSDK(testConfig);
    await sdk.initialize();
  });
  
  it('should handle campaign event automatically', async () => {
    const result = await sdk.writeData({
      eventType: 'SEGMENT_WATCHED',
      campaignId: 'test_campaign',
      accountId: 'test_user',
      eventData: { segmentId: 'test_segment', completionPercentage: 100 },
      timestamp: new Date(),
    });
    
    expect(result.status).toBe('success');
    expect(result.transactionId).toBeDefined();
    expect(result.dataCloudHash).toBeDefined(); // DDC storage
    expect(result.indexId).toBeDefined(); // Activity SDK indexing
    
    // Single unified verification
  });
});
```

## Migration Checklist for Bullish Campaigns

### Pre-Migration
- [ ] Audit existing campaign data flows
- [ ] Identify all campaign event types (video segments, quiz answers, custom events)
- [ ] Document current quest tracking logic
- [ ] Review campaign analytics requirements
- [ ] Test Unified SDK with sample campaign data

### During Migration
- [ ] Install `@cere-ddc-sdk/unified`
- [ ] Configure SDK with campaign-optimized settings
- [ ] Migrate video segment tracking first (lowest risk)
- [ ] Migrate quiz answer tracking
- [ ] Migrate campaign participation events
- [ ] Migrate custom campaign events
- [ ] Update error handling for campaign scenarios
- [ ] Test quest tracking integration

### Post-Migration
- [ ] Verify all campaign events are properly detected
- [ ] Confirm quest progress tracking works correctly
- [ ] Validate campaign analytics data
- [ ] Monitor campaign event processing performance
- [ ] Remove legacy SDK dependencies
- [ ] Update campaign documentation

## Benefits Summary

The Unified SDK migration for Bullish campaigns provides:

- **🎯 Simplicity**: One method (`writeData()`) for all campaign data
- **🤖 Intelligence**: Automatic detection of Bullish campaign events
- **📊 Analytics**: Built-in campaign metrics and quest tracking
- **🔧 Reliability**: Unified error handling and retry logic
- **⚡ Performance**: Optimized batching for high-volume campaigns
- **🔄 Compatibility**: Seamless integration with existing Bullish systems

The migration transforms complex multi-SDK campaign integration into a simple, reliable, and performant solution that scales with your Bullish campaign needs. 