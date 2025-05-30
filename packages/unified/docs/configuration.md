# Configuration Guide

## Overview

The Unified Data Ingestion SDK uses a hierarchical configuration system that balances simplicity for basic use cases with flexibility for advanced scenarios. This guide covers all configuration options, best practices, and production considerations.

## Configuration Structure

### Basic Configuration

```typescript
import { UnifiedSDK } from '@cere-ddc-sdk/unified';

const sdk = new UnifiedSDK({
  // Required: DDC configuration
  ddcConfig: {
    signer: '//Alice',
    bucketId: BigInt(12345),
    network: 'testnet',
  },

  // Optional: Activity SDK configuration
  activityConfig: {
    keyringUri: '//Alice',
    appId: 'my-telegram-bot',
    endpoint: 'https://api.stats.testnet.cere.network',
    appPubKey: 'your-app-public-key',
    dataServicePubKey: 'data-service-public-key',
  },
});
```

### Full Configuration

```typescript
const sdk = new UnifiedSDK({
  ddcConfig: {
    signer: process.env.DDC_SIGNER!,
    bucketId: BigInt(process.env.DDC_BUCKET_ID!),
    network: 'mainnet',
    clusterId: 'premium-cluster-01',
  },

  activityConfig: {
    keyringUri: process.env.ACTIVITY_KEYRING_URI!,
    appId: 'production-telegram-bot',
    endpoint: 'https://api.stats.cere.network',
    appPubKey: process.env.APP_PUBLIC_KEY!,
    dataServicePubKey: process.env.DATA_SERVICE_PUBLIC_KEY!,
    connectionId: 'persistent-connection-01',
    sessionId: `session-${Date.now()}`,
  },

  processing: {
    enableBatching: true,
    defaultBatchSize: 100,
    defaultBatchTimeout: 2000,
    maxRetries: 5,
    retryDelay: 1000,
  },

  logging: {
    level: 'info',
    enableMetrics: true,
  },
});
```

## Configuration Sections

### 1. DDC Configuration (Required)

The DDC configuration is required for all SDK operations.

```typescript
interface DDCConfig {
  signer: string; // Substrate signer
  bucketId: bigint; // DDC bucket ID
  network: 'mainnet' | 'testnet'; // Network
  clusterId?: string; // Optional cluster ID
}
```

#### Parameters

- **`signer`** (required): Substrate account for signing transactions

  - Can be a mnemonic phrase, seed phrase, or URI format
  - Examples: `'//Alice'`, `'word1 word2 ... word12'`, `'0x1234...'`

- **`bucketId`** (required): DDC bucket identifier

  - Must be a valid bucket you have access to
  - Use `BigInt()` for large numbers: `BigInt(12345)`

- **`network`** (required): Blockchain network

  - `'mainnet'`: Production Cere network
  - `'testnet'`: Test network for development

- **`clusterId`** (optional): Specific cluster for data storage
  - Useful for performance optimization or data locality
  - Contact Cere team for available cluster IDs

#### Network Endpoints

```typescript
const NETWORK_ENDPOINTS = {
  mainnet: {
    blockchain: 'wss://rpc.mainnet.cere.network/ws',
    gateway: 'https://ddc.mainnet.cere.network',
  },
  testnet: {
    blockchain: 'wss://rpc.testnet.cere.network/ws',
    gateway: 'https://ddc.testnet.cere.network',
  },
};
```

### 2. Activity SDK Configuration (Optional)

Activity SDK configuration enables event indexing and analytics.

```typescript
interface ActivityConfig {
  keyringUri: string; // Signing key for events
  appId: string; // Application identifier
  endpoint: string; // Activity SDK endpoint
  appPubKey: string; // Application public key
  dataServicePubKey: string; // Data service public key
  connectionId?: string; // Optional connection ID
  sessionId?: string; // Optional session ID
}
```

#### Parameters

- **`keyringUri`** (required): Substrate URI for event signing

  - Same format as DDC signer: `'//Alice'`, mnemonic, or hex

- **`appId`** (required): Unique application identifier

  - Use descriptive names: `'telegram-quest-bot'`, `'cere-wallet'`
  - Should be consistent across deployments

- **`endpoint`** (required): Activity SDK API endpoint

  - Mainnet: `'https://api.stats.cere.network'`
  - Testnet: `'https://api.stats.testnet.cere.network'`

- **`appPubKey`** (required): Your application's public key

  - Obtained during app registration with Cere
  - Used for authentication and encryption

- **`dataServicePubKey`** (required): Cere's data service public key

  - Provided by Cere team
  - Used for data encryption and verification

- **`connectionId`** (optional): Persistent connection identifier

  - Useful for connection pooling and monitoring
  - Auto-generated if not provided

- **`sessionId`** (optional): Session tracking identifier
  - Helps with debugging and analytics
  - Auto-generated if not provided

### 3. Processing Configuration (Optional)

Controls batching, retries, and performance optimizations.

```typescript
interface ProcessingConfig {
  enableBatching: boolean; // Enable automatic batching
  defaultBatchSize: number; // Items per batch
  defaultBatchTimeout: number; // Max wait time (ms)
  maxRetries: number; // Max retry attempts
  retryDelay: number; // Delay between retries (ms)
}
```

#### Default Values

```typescript
const DEFAULT_PROCESSING_CONFIG = {
  enableBatching: true,
  defaultBatchSize: 50,
  defaultBatchTimeout: 5000, // 5 seconds
  maxRetries: 3,
  retryDelay: 1000, // 1 second
};
```

#### Tuning Guidelines

**High-Volume Bots (1000+ events/minute):**

```typescript
processing: {
  enableBatching: true,
  defaultBatchSize: 100,      // Larger batches
  defaultBatchTimeout: 2000,  // Shorter timeout
  maxRetries: 5,
  retryDelay: 500,           // Faster retries
}
```

**Low-Latency Applications:**

```typescript
processing: {
  enableBatching: false,      // Disable batching
  defaultBatchSize: 1,
  defaultBatchTimeout: 0,
  maxRetries: 2,             // Fewer retries
  retryDelay: 200,           // Very fast retries
}
```

**Reliable Background Processing:**

```typescript
processing: {
  enableBatching: true,
  defaultBatchSize: 25,      // Smaller, reliable batches
  defaultBatchTimeout: 10000, // Longer timeout
  maxRetries: 10,            // Many retries
  retryDelay: 2000,          // Conservative retry delay
}
```

### 4. Logging Configuration (Optional)

Controls logging level and metrics collection.

```typescript
interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  enableMetrics: boolean;
}
```

#### Log Levels

- **`debug`**: Verbose logging for development
- **`info`**: General operational information
- **`warn`**: Warning messages and fallbacks
- **`error`**: Error conditions only

#### Production Logging

```typescript
logging: {
  level: 'warn',          // Reduce log noise in production
  enableMetrics: true,    // Keep metrics for monitoring
}
```

#### Development Logging

```typescript
logging: {
  level: 'debug',         // Verbose logging for debugging
  enableMetrics: true,    // Full observability
}
```

## Environment-Based Configuration

### Using Environment Variables

```typescript
// .env file
DDC_SIGNER=//Alice
DDC_BUCKET_ID=12345
DDC_NETWORK=testnet

ACTIVITY_KEYRING_URI=//Alice
ACTIVITY_APP_ID=telegram-bot
ACTIVITY_ENDPOINT=https://api.stats.testnet.cere.network
APP_PUBLIC_KEY=your-app-key
DATA_SERVICE_PUBLIC_KEY=service-key

ENABLE_BATCHING=true
BATCH_SIZE=50
LOG_LEVEL=info
```

```typescript
// Configuration from environment
const config = {
  ddcConfig: {
    signer: process.env.DDC_SIGNER!,
    bucketId: BigInt(process.env.DDC_BUCKET_ID!),
    network: process.env.DDC_NETWORK as 'mainnet' | 'testnet',
  },

  activityConfig: process.env.ACTIVITY_KEYRING_URI
    ? {
        keyringUri: process.env.ACTIVITY_KEYRING_URI,
        appId: process.env.ACTIVITY_APP_ID!,
        endpoint: process.env.ACTIVITY_ENDPOINT!,
        appPubKey: process.env.APP_PUBLIC_KEY!,
        dataServicePubKey: process.env.DATA_SERVICE_PUBLIC_KEY!,
      }
    : undefined,

  processing: {
    enableBatching: process.env.ENABLE_BATCHING === 'true',
    defaultBatchSize: parseInt(process.env.BATCH_SIZE || '50'),
    defaultBatchTimeout: parseInt(process.env.BATCH_TIMEOUT || '5000'),
    maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
    retryDelay: parseInt(process.env.RETRY_DELAY || '1000'),
  },

  logging: {
    level: (process.env.LOG_LEVEL as any) || 'info',
    enableMetrics: process.env.ENABLE_METRICS !== 'false',
  },
};
```

### Configuration Factory

```typescript
// config/index.ts
export function createSDKConfig(environment: 'development' | 'staging' | 'production') {
  const baseConfig = {
    ddcConfig: {
      signer: process.env.DDC_SIGNER!,
      bucketId: BigInt(process.env.DDC_BUCKET_ID!),
      network: environment === 'production' ? 'mainnet' : 'testnet',
    },
  };

  switch (environment) {
    case 'development':
      return {
        ...baseConfig,
        processing: {
          enableBatching: false, // Immediate processing for debugging
          maxRetries: 1,
          retryDelay: 100,
        },
        logging: {
          level: 'debug',
          enableMetrics: true,
        },
      };

    case 'staging':
      return {
        ...baseConfig,
        processing: {
          enableBatching: true,
          defaultBatchSize: 25, // Conservative batching
          maxRetries: 5,
        },
        logging: {
          level: 'info',
          enableMetrics: true,
        },
      };

    case 'production':
      return {
        ...baseConfig,
        activityConfig: {
          keyringUri: process.env.ACTIVITY_KEYRING_URI!,
          appId: process.env.ACTIVITY_APP_ID!,
          endpoint: 'https://api.stats.cere.network',
          appPubKey: process.env.APP_PUBLIC_KEY!,
          dataServicePubKey: process.env.DATA_SERVICE_PUBLIC_KEY!,
        },
        processing: {
          enableBatching: true,
          defaultBatchSize: 100, // Optimized for performance
          defaultBatchTimeout: 2000,
          maxRetries: 5,
          retryDelay: 1000,
        },
        logging: {
          level: 'warn', // Reduce log noise
          enableMetrics: true,
        },
      };
  }
}
```

## Security Best Practices

### 1. Key Management

**DO:**

- Store signing keys in environment variables or secure key management systems
- Use different keys for different environments
- Rotate keys regularly

**DON'T:**

- Hardcode keys in source code
- Share keys across applications
- Use production keys in development

### 2. Network Security

```typescript
// Use secure endpoints
const config = {
  ddcConfig: {
    network: 'mainnet', // Use appropriate network
    // ... other config
  },
  activityConfig: {
    endpoint: 'https://api.stats.cere.network', // Always use HTTPS
    // ... other config
  },
};
```

### 3. Data Encryption

```typescript
// Enable encryption for sensitive data
await sdk.writeTelegramEvent(eventData, {
  encryption: true, // Encrypt sensitive events
  priority: 'high',
});
```

## Performance Optimization

### 1. Batching Configuration

```typescript
// For high-throughput applications
const highThroughputConfig = {
  processing: {
    enableBatching: true,
    defaultBatchSize: 100, // Process more items at once
    defaultBatchTimeout: 1000, // Shorter timeout for responsiveness
  },
};

// For low-latency applications
const lowLatencyConfig = {
  processing: {
    enableBatching: false, // Immediate processing
    maxRetries: 2, // Fewer retries for speed
    retryDelay: 200, // Fast retries
  },
};
```

### 2. Connection Optimization

```typescript
// Persistent connections for long-running applications
const config = {
  activityConfig: {
    // ... other config
    connectionId: 'persistent-bot-connection',
    sessionId: `session-${process.pid}-${Date.now()}`,
  },
};
```

### 3. Resource Management

```typescript
// Proper cleanup for resource management
process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await sdk.cleanup();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down...');
  await sdk.cleanup();
  process.exit(0);
});
```

## Monitoring and Observability

### 1. Health Checking

```typescript
// Periodic health checks
setInterval(async () => {
  const status = sdk.getStatus();

  if (!status.initialized) {
    console.error('SDK not initialized');
    // Alert monitoring system
  }

  if (!status.ddcAvailable) {
    console.warn('DDC not available');
    // Check network connectivity
  }

  if (!status.activitySdkAvailable) {
    console.warn('Activity SDK not available');
    // May be expected if not configured
  }
}, 30000); // Check every 30 seconds
```

### 2. Metrics Collection

```typescript
// Enable metrics for monitoring
const config = {
  logging: {
    level: 'info',
    enableMetrics: true, // Collect performance metrics
  },
};

// Access metrics (example integration)
sdk.on('metrics', (metrics) => {
  // Send to monitoring system (Prometheus, DataDog, etc.)
  sendToMonitoring(metrics);
});
```

### 3. Error Tracking

```typescript
// Global error handling
sdk.on('error', (error) => {
  console.error('SDK Error:', error);

  // Send to error tracking service
  errorTracker.captureException(error, {
    component: error.component,
    code: error.code,
    // ... additional context
  });
});
```

## Common Configuration Patterns

### 1. Telegram Bot Configuration

```typescript
const telegramBotConfig = {
  ddcConfig: {
    signer: process.env.BOT_SIGNER!,
    bucketId: BigInt(process.env.BOT_BUCKET_ID!),
    network: 'mainnet',
  },

  activityConfig: {
    keyringUri: process.env.BOT_ACTIVITY_KEY!,
    appId: 'telegram-quest-bot',
    endpoint: 'https://api.stats.cere.network',
    appPubKey: process.env.BOT_APP_KEY!,
    dataServicePubKey: process.env.DATA_SERVICE_KEY!,
  },

  processing: {
    enableBatching: true,
    defaultBatchSize: 50, // Good for moderate traffic
    defaultBatchTimeout: 3000,
    maxRetries: 3,
    retryDelay: 1000,
  },

  logging: {
    level: 'info',
    enableMetrics: true,
  },
};
```

### 2. Mini-App Configuration

```typescript
const miniAppConfig = {
  ddcConfig: {
    signer: process.env.MINIAPP_SIGNER!,
    bucketId: BigInt(process.env.MINIAPP_BUCKET_ID!),
    network: 'mainnet',
  },

  activityConfig: {
    keyringUri: process.env.MINIAPP_ACTIVITY_KEY!,
    appId: 'cere-wallet-miniapp',
    endpoint: 'https://api.stats.cere.network',
    appPubKey: process.env.MINIAPP_APP_KEY!,
    dataServicePubKey: process.env.DATA_SERVICE_KEY!,
    sessionId: `miniapp-${userId}-${Date.now()}`,
  },

  processing: {
    enableBatching: false, // Real-time for better UX
    maxRetries: 2, // Fast failure for responsiveness
    retryDelay: 500,
  },

  logging: {
    level: 'warn', // Minimal logging for performance
    enableMetrics: true,
  },
};
```

### 3. Analytics Service Configuration

```typescript
const analyticsConfig = {
  ddcConfig: {
    signer: process.env.ANALYTICS_SIGNER!,
    bucketId: BigInt(process.env.ANALYTICS_BUCKET_ID!),
    network: 'mainnet',
    clusterId: 'analytics-cluster', // Dedicated cluster
  },

  activityConfig: {
    keyringUri: process.env.ANALYTICS_ACTIVITY_KEY!,
    appId: 'cere-analytics-service',
    endpoint: 'https://api.stats.cere.network',
    appPubKey: process.env.ANALYTICS_APP_KEY!,
    dataServicePubKey: process.env.DATA_SERVICE_KEY!,
    connectionId: 'analytics-persistent',
  },

  processing: {
    enableBatching: true,
    defaultBatchSize: 200, // Large batches for efficiency
    defaultBatchTimeout: 5000,
    maxRetries: 10, // High reliability
    retryDelay: 2000,
  },

  logging: {
    level: 'info',
    enableMetrics: true,
  },
};
```

## Troubleshooting Configuration

### Common Issues

1. **Invalid Signer Format**

   ```typescript
   // ❌ Wrong
   signer: 'alice';

   // ✅ Correct
   signer: '//Alice'; // URI format
   signer: 'word1 word2 ... word12'; // Mnemonic
   signer: '0x1234...'; // Hex format
   ```

2. **Bucket ID Type Error**

   ```typescript
   // ❌ Wrong
   bucketId: 12345;

   // ✅ Correct
   bucketId: BigInt(12345);
   ```

3. **Missing Activity Config**

   ```typescript
   // Activity SDK features will be disabled without config
   // This is expected and handled gracefully
   ```

4. **Network Mismatch**
   ```typescript
   // Ensure bucket exists on the specified network
   network: 'testnet'; // Bucket must exist on testnet
   ```

### Validation

```typescript
// Configuration validation utility
function validateConfig(config: UnifiedSDKConfig): void {
  // Check required fields
  if (!config.ddcConfig?.signer) {
    throw new Error('DDC signer is required');
  }

  if (!config.ddcConfig?.bucketId) {
    throw new Error('DDC bucket ID is required');
  }

  // Validate network
  if (!['mainnet', 'testnet'].includes(config.ddcConfig.network)) {
    throw new Error('Network must be mainnet or testnet');
  }

  // Validate bucket ID format
  if (typeof config.ddcConfig.bucketId !== 'bigint') {
    throw new Error('Bucket ID must be a BigInt');
  }
}
```

This configuration guide provides comprehensive coverage of all configuration options and best practices for deploying the Unified Data Ingestion SDK in various environments and use cases.
