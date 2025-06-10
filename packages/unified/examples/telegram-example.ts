import { UnifiedSDK } from '../src/UnifiedSDK';
import { TelegramEventData, TelegramMessageData } from '../src/types';

/**
 * Telegram Use Case Example
 * Demonstrates the Unified SDK with real Activity SDK integration
 */

async function telegramExample() {
  console.log('🚀 Starting Telegram Unified SDK Example');

  // Example configuration with real Activity SDK setup
  const config = {
    ddcConfig: {
      signer: 'bottom drive obey lake curtain smoke basket hold race lonely fit walk//Alice', // Example mnemonic
      bucketId: BigInt(12345),
      network: 'testnet' as const,
    },
    activityConfig: {
      endpoint: 'https://api.stats.cere.network',
      appId: 'telegram-miniapp-example',
      // In a real application, you would provide a Substrate URI or mnemonic
      // For example:
      // keyringUri: 'your twelve word mnemonic phrase here',
      // keyringUri: '//Alice', // For testing
      // For this example, we'll show the structure but leave it commented out
      // keyringUri: undefined, // Replace with actual URI or mnemonic
      connectionId: 'conn_' + Date.now(),
      sessionId: 'sess_' + Date.now(),
      appPubKey: 'app_pub_key_example',
      dataServicePubKey: 'data_service_pub_key_example',
    },
    processing: {
      enableBatching: true,
      defaultBatchSize: 10,
      defaultBatchTimeout: 5000,
      maxRetries: 3,
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
    console.log('✅ SDK initialized successfully');

    // Example 1: Simple Telegram event with Activity SDK + DDC storage
    console.log('\n📝 Example 1: Telegram quest completion event');

    const questEvent: TelegramEventData = {
      eventType: 'quest_completed',
      userId: 'user123',
      chatId: 'chat456',
      eventData: {
        questId: 'daily-check-in',
        points: 100,
        level: 5,
      },
      timestamp: new Date(),
    };

    // ✨ Using writeData() with automatic detection
    const questResult = await sdk.writeData(questEvent, {
      priority: 'high',
      metadata: {
        processing: {
          dataCloudWriteMode: 'direct',
          indexWriteMode: 'realtime',
          priority: 'high',
        },
      },
    });
    console.log('Quest completion result:', questResult);

    // Example 2: Telegram message with intelligent routing
    console.log('\n💬 Example 2: Telegram message storage');

    const message: TelegramMessageData = {
      messageId: 'msg789',
      chatId: 'chat456',
      userId: 'user123',
      messageText: 'Hello from the mini app!',
      messageType: 'text',
      timestamp: new Date(),
      metadata: {
        miniAppName: 'Cere Games',
        actionContext: 'game-chat',
      },
    };

    // ✨ Using writeData() with automatic detection
    const messageResult = await sdk.writeData(message, {
      priority: 'normal',
      metadata: {
        processing: {
          dataCloudWriteMode: 'batch',
          indexWriteMode: 'realtime',
          priority: 'normal',
          batchOptions: {
            maxSize: 5,
            maxWaitTime: 3000,
          },
        },
      },
    });
    console.log('Message storage result:', messageResult);

    // Example 3: High-priority event with encryption
    console.log('\n🔒 Example 3: Encrypted high-priority event');

    const sensitiveEvent: TelegramEventData = {
      eventType: 'user_action',
      userId: 'user123',
      eventData: {
        action: 'purchase',
        amount: 50.99,
        currency: 'USD',
        itemId: 'premium-upgrade',
      },
      timestamp: new Date(),
    };

    // ✨ Using writeData() with automatic detection
    const secureResult = await sdk.writeData(sensitiveEvent, {
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
    console.log('Secure event result:', secureResult);

    // Example 4: Fallback scenario demonstration
    console.log('\n🔄 Example 4: Activity SDK unavailable - fallback to DDC');

    // This would happen automatically if Activity SDK fails to initialize
    // or if an Activity SDK call fails but writeToDataCloud is enabled
    const fallbackEvent: TelegramEventData = {
      eventType: 'mini_app_interaction',
      userId: 'user456',
      eventData: {
        interaction: 'button_click',
        buttonId: 'start-game',
        screen: 'main-menu',
      },
      timestamp: new Date(),
    };

    // ✨ Using writeData() with automatic detection
    const fallbackResult = await sdk.writeData(fallbackEvent, {
      metadata: {
        processing: {
          dataCloudWriteMode: 'direct',
          indexWriteMode: 'skip', // Only store in DDC as fallback
        },
      },
    });
    console.log('Fallback result:', fallbackResult);

    console.log('\n✨ All examples completed successfully!');
  } catch (error) {
    console.error('❌ Example failed:', error);
  } finally {
    // Clean up
    await sdk.cleanup();
    console.log('🧹 SDK cleanup completed');
  }
}

// Additional helper function showing keyring setup (for reference)
function showKeyringSetup() {
  console.log(`
📋 Activity SDK Setup Guide:

The Unified SDK uses UriSigner for Activity SDK integration, which accepts:

1. Substrate URI format:
   keyringUri: '//Alice'  // For testing
   keyringUri: '//Bob'    // For testing

2. Mnemonic phrase:
   keyringUri: 'your twelve word mnemonic phrase here'

3. Use in configuration:
   activityConfig: {
     keyringUri: '//Alice', // or your mnemonic
     appId: 'your-app-id',
     endpoint: 'https://api.stats.cere.network',
     // ... other config
   }

Note: If keyringUri is not provided, the SDK will use '//Alice' as default
and will work in mock mode if Activity SDK initialization fails.
  `);
}

// Run the example
if (require.main === module) {
  showKeyringSetup();
  telegramExample().catch(console.error);
}

export { telegramExample, showKeyringSetup };
