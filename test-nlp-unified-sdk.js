const { UnifiedSDK } = require("@cere-ddc-sdk/unified");

async function testNLPPipeline() {
    console.log('🚀 Starting NLP Pipeline Unified SDK Test with Real Credentials');

    // Configuration with real credentials
    const config = {
        ddcConfig: {
            signer: "hybrid label reunion only dawn maze asset draft cousin height flock nation", // Test mnemonic
            bucketId: BigInt(1), // Real bucket ID
            clusterId: BigInt("0x0000000000000000000000000000000000000001"), // Real cluster ID
            network: "testnet",
        },
        activityConfig: {
            endpoint: "http://localhost:18888", // Our local Event Service
            keyringUri: "hybrid label reunion only dawn maze asset draft cousin height flock nation", // Same mnemonic
            appId: "2101", // Real app ID
            connectionId: "nlp_test_" + Date.now(),
            sessionId: "sess_nlp_" + Date.now(),
            appPubKey: "4fcbae9ac6d9ffec5da0475285d267093cdceed74fb69ba47d7a6eaafe6eb2a9", // Generated from seed
            dataServicePubKey: "4fcbae9ac6d9ffec5da0475285d267093cdceed74fb69ba47d7a6eaafe6eb2a9", // Same as appPubKey
        },
        processing: {
            enableBatching: false, // Disable batching for testing
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
        console.log('⚡ Initializing SDK...');
        await sdk.initialize();
        console.log('✅ SDK initialized successfully');

        // Test 1: Direct processing (high priority) for NLP - using unified writeData
        console.log('\n📝 Test 1: Direct processing (high priority)');
        const directResult = await sdk.writeData({
            eventType: "quest_completed",
            userId: "nlp_test_user_1",
            chatId: "nlp_test_chat",
            eventData: {
                message: "Direct processing test for NLP pipeline dashboard",
                testType: "direct_processing",
                nlpCategory: "telegram_data",
                questId: "daily-login",
                points: 100,
                level: 5
            },
            timestamp: new Date(),
        }, {
            priority: 'high',
            writeMode: 'realtime', // This maps to dataCloudWriteMode: 'viaIndex'
            encryption: false,
        });

        console.log('✅ Test 1 Result:', {
            transactionId: directResult.transactionId,
            status: directResult.status,
            dataCloudHash: directResult.dataCloudHash,
            indexId: directResult.indexId,
            processingTime: directResult.metadata.processingTime,
        });

        // Test 2: Batch processing (normal priority) - using unified writeData
        console.log('\n📱 Test 2: Batch processing');
        const batchResult = await sdk.writeData({
            messageId: `nlp_batch_test_${Date.now()}`,
            chatId: "nlp_test_chat",
            userId: "nlp_test_user_2",
            messageText: "Batch processing test message for NLP pipeline",
            messageType: "text",
            timestamp: new Date(),
            metadata: {
                nlpTestBatch: true,
                nlpCategory: "telegram_batch"
            },
        }, {
            priority: 'normal',
            writeMode: 'batch',
            encryption: false,
        });

        console.log('✅ Test 2 Result:', {
            transactionId: batchResult.transactionId,
            status: batchResult.status,
            dataCloudHash: batchResult.dataCloudHash,
            indexId: batchResult.indexId,
            processingTime: batchResult.metadata.processingTime,
        });

        // Test 3: Using the advanced writeData method with full metadata
        console.log('\n🔍 Test 3: Advanced writeData with full metadata control');
        const advancedResult = await sdk.writeData({
            type: 'nlp_analysis_request',
            userId: 'nlp_test_user_3',
            eventData: {
                message: "Advanced processing test for NLP",
                testType: "advanced_metadata",
                nlpCategory: "telegram_analysis",
                contentType: "text",
                language: "en"
            },
            timestamp: new Date().toISOString(),
        }, {
            priority: 'high',
            writeMode: 'realtime',
            encryption: false,
            metadata: {
                processing: {
                    dataCloudWriteMode: 'direct', // Direct to DDC, bypassing index
                    indexWriteMode: 'realtime',   // Also send to index
                    priority: 'high',
                    encryption: false,
                    ttl: 86400, // 24 hours
                },
                userContext: {
                    nlpPipeline: true,
                    testType: 'advanced',
                    dataSource: 'telegram',
                    analysisRequired: true
                },
                traceId: `nlp_advanced_${Date.now()}`
            },
        });

        console.log('✅ Test 3 Result:', {
            transactionId: advancedResult.transactionId,
            status: advancedResult.status,
            dataCloudHash: advancedResult.dataCloudHash,
            indexId: advancedResult.indexId,
            processingTime: advancedResult.metadata.processingTime,
            actionsExecuted: advancedResult.metadata.actionsExecuted,
        });

        // Test 4: SDK Status
        console.log('\n📊 Test 4: SDK Status Check');
        const status = sdk.getStatus();
        console.log('✅ SDK Status:', {
            initialized: status.initialized,
            components: status.components,
            configSummary: {
                bucketId: status.config.ddcConfig.bucketId,
                appId: status.config.activityConfig.appId,
                endpoint: status.config.activityConfig.endpoint,
            }
        });

        console.log('\n🎉 All NLP Pipeline tests completed successfully!');
        console.log('🔍 Check Event Service logs for routing information:');
        console.log('   - High priority events → general_data_stream_2101_HIGH_PRIORITY');
        console.log('   - Normal/batch events → general_data_stream_2101');
        console.log('📊 Data ingested through multiple paths:');
        console.log('   - Activity SDK → Event Service → Kafka');
        console.log('   - DDC Direct → Data Cloud storage');
        console.log('🤖 NLP pipeline ready for NLP\'s Intelligence Dashboard');

        return {
            success: true,
            results: [directResult, batchResult, advancedResult],
            status,
        };

    } catch (error) {
        console.error('❌ NLP Pipeline test failed:', error);
        console.error('Stack:', error.stack);
        return {
            success: false,
            error: error.message,
            stack: error.stack,
        };
    } finally {
        console.log('\n🧹 Cleaning up SDK...');
        await sdk.cleanup();
        console.log('✅ SDK cleanup completed');
    }
}

// Run the test
if (require.main === module) {
    testNLPPipeline()
        .then((result) => {
            console.log('\n🏁 Final Result:', result.success ? 'SUCCESS ✅' : 'FAILED ❌');
            if (!result.success) {
                process.exit(1);
            }
        })
        .catch((error) => {
            console.error('\n💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { testNLPPipeline }; 