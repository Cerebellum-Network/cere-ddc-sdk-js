import { UnifiedSDK } from './dist/index.js';

/**
 * Test script to verify the Unified SDK with testnet credentials
 *
 * IMPORTANT: Replace the placeholder values with your actual credentials
 */

async function testWithCredentials() {
  console.log('🚀 Testing Unified SDK with testnet credentials');

  // Configuration using testnet credentials
  // REPLACE THE PLACEHOLDERS BELOW WITH YOUR ACTUAL CREDENTIALS
  const config = {
    ddcConfig: {
      signer: 'YOUR_MNEMONIC_PHRASE_HERE', // Replace with your mnemonic phrase
      bucketId: BigInt('YOUR_BUCKET_ID'), // Replace with your bucket ID (e.g., BigInt(573409))
      clusterId: BigInt('YOUR_CLUSTER_ID'), // Replace with your cluster ID (e.g., BigInt('0x825c4b2352850de9986d9d28568db6f0c023a1e3'))
      network: 'testnet',
    },
    activityConfig: {
      endpoint: 'YOUR_ACTIVITY_ENDPOINT', // Replace with your activity endpoint (e.g., 'https://ai-event.stage.cere.io')
      keyringUri: 'YOUR_MNEMONIC_PHRASE_HERE', // Same as signer above
      appId: 'YOUR_APP_ID', // Replace with your app ID (e.g., '2621')
      connectionId: 'conn_test_' + Date.now(),
      sessionId: 'sess_test_' + Date.now(),
      appPubKey: 'YOUR_APP_PUBLIC_KEY', // Replace with your app public key
      dataServicePubKey: 'YOUR_DATA_SERVICE_PUBLIC_KEY', // Replace with your data service public key
    },
    processing: {
      enableBatching: true,
      defaultBatchSize: 10,
      defaultBatchTimeout: 5000,
      maxRetries: 3,
      retryDelay: 1000,
    },
    logging: {
      level: 'debug',
      enableMetrics: true,
    },
  };

  const sdk = new UnifiedSDK(config);

  try {
    console.log('📋 Initializing SDK...');
    await sdk.initialize();
    console.log('✅ SDK initialized successfully');

    // Test 1: Simple data ingestion to DDC
    console.log('\n📝 Test 1: Simple data ingestion to DDC');
    const testData = {
      type: 'test_event',
      userId: 'test_user_123',
      timestamp: new Date().toISOString(),
      data: {
        action: 'sdk_test',
        message: 'Testing unified SDK with credentials',
      },
    };

    const metadata = {
      processing: {
        dataCloudWriteMode: 'direct',
        indexWriteMode: 'realtime',
        priority: 'normal',
      },
    };

    const result1 = await sdk.writeData(testData, metadata);
    console.log('✅ Test 1 Result:', {
      transactionId: result1.transactionId,
      status: result1.status,
      dataCloudHash: result1.dataCloudHash,
      indexId: result1.indexId,
    });

    // Test 2: Telegram event
    console.log('\n💬 Test 2: Telegram event ingestion');
    const telegramEvent = {
      eventType: 'quest_completed',
      userId: 'telegram_user_456',
      chatId: 'chat_789',
      eventData: {
        questId: 'daily-login',
        points: 50,
        level: 3,
      },
      timestamp: new Date(),
    };

    const result2 = await sdk.writeTelegramEvent(telegramEvent, {
      priority: 'high',
      writeMode: 'realtime',
    });
    console.log('✅ Test 2 Result:', {
      transactionId: result2.transactionId,
      status: result2.status,
      dataCloudHash: result2.dataCloudHash,
      indexId: result2.indexId,
    });

    // Test 3: Telegram message
    console.log('\n📱 Test 3: Telegram message storage');
    const telegramMessage = {
      messageId: 'msg_' + Date.now(),
      chatId: 'chat_789',
      userId: 'telegram_user_456',
      messageText: 'Hello from the unified SDK test!',
      messageType: 'text',
      timestamp: new Date(),
    };

    const result3 = await sdk.writeTelegramMessage(telegramMessage, {
      priority: 'normal',
      writeMode: 'batch', // Note: Batch mode not yet implemented, will show partial success
    });
    console.log('✅ Test 3 Result:', {
      transactionId: result3.transactionId,
      status: result3.status,
      dataCloudHash: result3.dataCloudHash,
      indexId: result3.indexId,
    });

    // Test 4: SDK Status
    console.log('\n📊 Test 4: SDK Status');
    const status = sdk.getStatus();
    console.log('✅ SDK Status:', status);

    console.log('\n🎉 All tests completed successfully!');

    return {
      success: true,
      results: [result1, result2, result3],
      status,
    };
  } catch (error) {
    console.error('❌ Test failed:', error);
    return {
      success: false,
      error: error.message,
      stack: error.stack,
    };
  } finally {
    console.log('\n🧹 Cleaning up...');
    await sdk.cleanup();
    console.log('✅ Cleanup completed');
  }
}

// Run the test
testWithCredentials()
  .then((result) => {
    console.log('\n📋 Final Result:', result.success ? 'SUCCESS' : 'FAILED');
    if (!result.success) {
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });
