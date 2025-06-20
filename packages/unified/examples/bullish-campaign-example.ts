import { UnifiedSDK } from '../src/UnifiedSDK';
import { BullishCampaignEvent } from '../src/types';

/**
 * Bullish Campaign Use Case Example
 * Demonstrates the Unified SDK with real Activity SDK integration for Bullish campaigns
 */

async function bullishCampaignExample() {
  console.log('🚀 Starting Bullish Campaign Unified SDK Example');

  // Example configuration with real Activity SDK setup for Bullish campaigns
  const config = {
    ddcConfig: {
      signer: 'bottom drive obey lake curtain smoke basket hold race lonely fit walk//Alice', // Example mnemonic
      bucketId: BigInt(67890),
      network: 'testnet' as const,
    },
    activityConfig: {
      endpoint: 'https://api.stats.cere.network',
      appId: 'bullish-campaigns-example',
      // In a real application, you would provide a Substrate URI or mnemonic
      // For example:
      // keyringUri: 'your twelve word mnemonic phrase here',
      // keyringUri: '//Alice', // For testing
      // For this example, we'll show the structure but leave it commented out
      // keyringUri: undefined, // Replace with actual URI or mnemonic
      connectionId: 'bullish_conn_' + Date.now(),
      sessionId: 'bullish_sess_' + Date.now(),
      appPubKey: 'bullish_app_pub_key_example',
      dataServicePubKey: 'bullish_data_service_pub_key_example',
    },
    processing: {
      enableBatching: true,
      defaultBatchSize: 25, // Optimized for campaign events
      defaultBatchTimeout: 3000,
      maxRetries: 5, // Higher retries for important campaign data
      retryDelay: 1000,
    },
    logging: {
      level: 'debug' as const,
      enableMetrics: true,
    },
  };

  // Initialize the SDK
  const sdk = new UnifiedSDK(config);

  try {
    await sdk.initialize();
    console.log('✅ SDK initialized successfully for Bullish campaigns');

    // Example 1: Video segment tracking with Activity SDK + DDC storage
    console.log('\n📺 Example 1: Bullish video segment completion event');

    const segmentEvent: BullishCampaignEvent = {
      eventType: 'SEGMENT_WATCHED',
      campaignId: 'bullish_education_2024',
      accountId: 'user_12345',
      eventData: {
        segmentId: 'trading_basics_001',
        segmentTitle: 'Introduction to Trading',
        watchDuration: 300000, // 5 minutes in milliseconds
        totalDuration: 300000, // Full segment duration
        completionPercentage: 100,
        watchedAt: new Date(),
        isCompleted: true,
      },
      questId: 'education_quest_001',
      timestamp: new Date(),
    };

    // ✨ Using writeData() with automatic Bullish campaign detection
    const segmentResult = await sdk.writeData(segmentEvent, {
      priority: 'high',
      metadata: {
        processing: {
          dataCloudWriteMode: 'direct',
          indexWriteMode: 'realtime',
          priority: 'high',
        },
      },
    });
    console.log('Video segment completion result:', segmentResult);

    // Example 2: Quiz answer tracking with intelligent routing
    console.log('\n🧠 Example 2: Bullish quiz answer tracking');

    const quizEvent: BullishCampaignEvent = {
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
    };

    // ✨ Using writeData() with automatic Bullish campaign detection
    const quizResult = await sdk.writeData(quizEvent, {
      priority: 'normal',
      metadata: {
        processing: {
          dataCloudWriteMode: 'batch',
          indexWriteMode: 'realtime',
          priority: 'normal',
          batchOptions: {
            maxSize: 10,
            maxWaitTime: 2000,
          },
        },
      },
    });
    console.log('Quiz answer tracking result:', quizResult);

    // Example 3: Campaign participation tracking
    console.log('\n🎯 Example 3: Bullish campaign participation');

    const joinEvent: BullishCampaignEvent = {
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
    };

    // ✨ Using writeData() with automatic Bullish campaign detection
    const joinResult = await sdk.writeData(joinEvent, {
      priority: 'high',
      encryption: true,
      metadata: {
        processing: {
          dataCloudWriteMode: 'direct',
          indexWriteMode: 'realtime',
          priority: 'high',
          encryption: true,
          ttl: 86400, // 24 hours
        },
      },
    });
    console.log('Campaign participation result:', joinResult);

    // Example 4: Custom campaign events
    console.log('\n🔧 Example 4: Custom Bullish campaign events');

    const customEvent: BullishCampaignEvent = {
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
    };

    // ✨ Using writeData() with automatic Bullish campaign detection
    const customResult = await sdk.writeData(customEvent, {
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
        },
      },
    });
    console.log('Custom campaign event result:', customResult);

    // Example 5: High-volume campaign event processing
    console.log('\n⚡ Example 5: High-volume campaign event batch');

    const batchEvents: BullishCampaignEvent[] = [
      {
        eventType: 'SEGMENT_WATCHED',
        campaignId: 'bullish_mass_education',
        accountId: 'batch_user_001',
        eventData: {
          segmentId: 'batch_segment_001',
          completionPercentage: 100,
        },
        timestamp: new Date(),
      },
      {
        eventType: 'QUESTION_ANSWERED',
        campaignId: 'bullish_mass_quiz',
        accountId: 'batch_user_002',
        eventData: {
          questionId: 'batch_q_001',
          isCorrect: true,
          points: 5,
        },
        timestamp: new Date(),
      },
      {
        eventType: 'CUSTOM_EVENTS',
        campaignId: 'bullish_engagement',
        accountId: 'batch_user_003',
        eventData: {
          eventName: 'button_click',
          buttonId: 'start_quest',
        },
        timestamp: new Date(),
      },
    ];

    // Process batch events with optimized settings
    const batchResults = await Promise.all(
      batchEvents.map(event =>
        sdk.writeData(event, {
          writeMode: 'batch',
          metadata: {
            processing: {
              dataCloudWriteMode: 'batch',
              indexWriteMode: 'realtime',
              batchOptions: {
                maxSize: 50,
                maxWaitTime: 1000,
              },
            },
          },
        })
      )
    );
    console.log('Batch campaign events results:', batchResults.length, 'events processed');

    // Example 6: Campaign analytics and metrics
    console.log('\n📊 Example 6: Campaign analytics event');

    const analyticsEvent: BullishCampaignEvent = {
      eventType: 'CUSTOM_EVENTS',
      campaignId: 'bullish_analytics_tracking',
      accountId: 'analytics_user_001',
      eventData: {
        eventName: 'campaign_milestone_reached',
        milestoneId: 'first_week_complete',
        milestoneType: 'time_based',
        pointsEarned: 500,
        totalPoints: 1250,
        progressPercentage: 25,
        reachedAt: new Date(),
        userEngagement: {
          sessionsCount: 15,
          totalTimeSpent: 3600000, // 1 hour
          averageSessionDuration: 240000, // 4 minutes
        },
      },
      timestamp: new Date(),
    };

    // ✨ Using writeData() with campaign analytics metadata
    const analyticsResult = await sdk.writeData(analyticsEvent, {
      metadata: {
        processing: {
          dataCloudWriteMode: 'direct',
          indexWriteMode: 'realtime',
        },
        campaignContext: {
          source: 'bullish_analytics_service',
          campaignPhase: 'active',
          userSegment: 'engaged_users',
          analyticsVersion: 'v1.2.0',
        },
        traceId: 'campaign_analytics_' + Date.now(),
      },
    });
    console.log('Campaign analytics result:', analyticsResult);

    console.log('\n✨ All Bullish campaign examples completed successfully!');
  } catch (error) {
    console.error('❌ Bullish campaign example failed:', error);
  } finally {
    // Clean up
    await sdk.cleanup();
    console.log('🧹 SDK cleanup completed');
  }
}

// Additional helper function showing Bullish campaign setup (for reference)
function showBullishCampaignSetup() {
  console.log(`
📋 Bullish Campaign SDK Setup Guide:

The Unified SDK automatically detects Bullish campaign events when your payload contains:
- eventType: 'SEGMENT_WATCHED' | 'QUESTION_ANSWERED' | 'JOIN_CAMPAIGN' | 'CUSTOM_EVENTS'
- campaignId: string (identifies the specific Bullish campaign)
- accountId: string (identifies the user account)

Supported Campaign Event Types:

1. SEGMENT_WATCHED - Video segment completion tracking
   {
     eventType: 'SEGMENT_WATCHED',
     campaignId: 'bullish_education_2024',
     accountId: 'user_12345',
     eventData: {
       segmentId: 'trading_basics_001',
       completionPercentage: 100,
       watchDuration: 300000,
     },
     questId: 'education_quest_001', // Optional
     timestamp: new Date(),
   }

2. QUESTION_ANSWERED - Quiz and question tracking
   {
     eventType: 'QUESTION_ANSWERED',
     campaignId: 'bullish_quiz_challenge',
     accountId: 'user_67890',
     eventData: {
       questionId: 'q_001',
       isCorrect: true,
       points: 10,
     },
     timestamp: new Date(),
   }

3. JOIN_CAMPAIGN - Campaign participation tracking
   {
     eventType: 'JOIN_CAMPAIGN',
     campaignId: 'bullish_rewards_2024',
     accountId: 'user_11111',
     eventData: {
       joinedAt: new Date(),
       referralCode: 'FRIEND123',
     },
     timestamp: new Date(),
   }

4. CUSTOM_EVENTS - Custom campaign events
   {
     eventType: 'CUSTOM_EVENTS',
     campaignId: 'bullish_trading_sim',
     accountId: 'user_22222',
     eventData: {
       eventName: 'trade_executed',
       tradeType: 'buy',
       symbol: 'BTC/USD',
     },
     timestamp: new Date(),
   }

Configuration for Bullish Campaigns:
   activityConfig: {
     keyringUri: '//Alice', // or your mnemonic
     appId: 'bullish-campaigns',
     endpoint: 'https://api.stats.cere.network',
     // ... other config
   }

Note: If keyringUri is not provided, the SDK will use '//Alice' as default
and will work in mock mode if Activity SDK initialization fails.

The SDK automatically:
- Detects Bullish campaign events by payload structure
- Routes to both DDC and Activity SDK with campaign-specific metadata
- Handles quest tracking when questId is provided
- Generates campaign-specific trace IDs
- Optimizes processing for campaign scenarios
  `);
}

// Run the example
if (require.main === module) {
  showBullishCampaignSetup();
  bullishCampaignExample().catch(console.error);
}

export { bullishCampaignExample, showBullishCampaignSetup }; 