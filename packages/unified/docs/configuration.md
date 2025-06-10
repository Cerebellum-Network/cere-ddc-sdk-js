# Configuration Guide

## Overview

The Unified SDK uses a comprehensive configuration system that provides sensible defaults while allowing fine-tuned control over all aspects of data ingestion and processing. The configuration is strictly typed and validated at runtime using Zod schemas.

## Complete Configuration Interface

```typescript
interface UnifiedSDKConfig {
  // DDC Client configuration (required)
  ddcConfig: {
    signer: string; // Substrate URI or mnemonic phrase
    bucketId: bigint;
    clusterId?: bigint;
    network?: 'testnet' | 'devnet' | 'mainnet';
  };

  // Activity SDK configuration (optional)
  activityConfig?: {
    endpoint?: string;
    keyringUri?: string; // Substrate URI for signing
    appId?: string;
    connectionId?: string;
    sessionId?: string;
    appPubKey?: string;
    dataServicePubKey?: string;
  };

  // Processing options (required)
  processing: {
    enableBatching: boolean;
    defaultBatchSize: number;
    defaultBatchTimeout: number; // in milliseconds
    maxRetries: number;
    retryDelay: number; // in milliseconds
  };

  // Logging and monitoring (required)
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    enableMetrics: boolean;
  };
}
```

## DDC Configuration (Required)

### Basic DDC Setup

```typescript
const ddcConfig = {
  signer: 'your twelve word mnemonic phrase here', // or Substrate URI like '//Alice'
  bucketId: BigInt(573409), // Your DDC bucket ID
  network: 'testnet', // or 'devnet', 'mainnet'
};
```

### DDC Network Options

The SDK automatically configures network endpoints based on the `network` setting:

```typescript
// Network endpoint mapping (handled internally)
const networkEndpoints = {
  devnet: 'wss://archive.devnet.cere.network/ws',
  testnet: 'wss://rpc.testnet.cere.network/ws',
  mainnet: 'wss://rpc.mainnet.cere.network/ws', // default for production
};
```

### DDC Cluster Configuration

```typescript
const ddcConfig = {
  signer: 'your mnemonic',
  bucketId: BigInt(573409),
  clusterId: BigInt('0x825c4b2352850de9986d9d28568db6f0c023a1e3'), // Optional cluster ID
  network: 'testnet',
};
```

### Signer Options

```typescript
// Mnemonic phrase (recommended for production)
signer: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

// Substrate URI (good for development)
signer: '//Alice'  // Built-in test account
signer: '//Bob'    // Built-in test account
signer: '//Charlie' // Built-in test account

// Environment variable (recommended)
signer: process.env.DDC_SIGNER
```

## Activity SDK Configuration (Optional)

If not provided, the SDK operates in DDC-only mode with graceful fallback.

### Basic Activity SDK Setup

```typescript
const activityConfig = {
  endpoint: 'https://api.stats.cere.network', // Activity SDK endpoint
  keyringUri: 'your twelve word mnemonic phrase here', // or Substrate URI
  appId: 'your-app-id',
  appPubKey: 'your-app-public-key',
  dataServicePubKey: 'your-data-service-public-key',
};
```

### Activity SDK Endpoints

```typescript
// Environment-specific endpoints
const endpoints = {
  production: 'https://api.stats.cere.network',
  staging: 'https://api.stats.testnet.cere.network',
  development: 'http://localhost:3000', // Local development
};
```

### Session Management

```typescript
const activityConfig = {
  endpoint: 'https://api.stats.cere.network',
  keyringUri: process.env.ACTIVITY_KEYRING_URI,
  appId: 'telegram-bot-v1',
  
  // Session management (optional, auto-generated if not provided)
  connectionId: 'conn_' + Date.now(),
  sessionId: 'sess_' + Date.now(),
  
  // Application keys
  appPubKey: process.env.APP_PUBLIC_KEY,
  dataServicePubKey: process.env.DATA_SERVICE_PUBLIC_KEY,
};
```

## Processing Configuration (Required)

Controls batching, retries, and performance optimization.

### Production Settings

```typescript
const processing = {
  enableBatching: true,
  defaultBatchSize: 100,
  defaultBatchTimeout: 5000, // 5 seconds
  maxRetries: 3,
  retryDelay: 1000, // 1 second
};
```

### High-Volume Settings

```typescript
const processing = {
  enableBatching: true,
  defaultBatchSize: 200, // Larger batches
  defaultBatchTimeout: 2000, // Faster processing
  maxRetries: 5,
  retryDelay: 500, // Shorter delay
};
```

### Real-Time Settings

```typescript
const processing = {
  enableBatching: false, // Disable batching for immediate processing
  defaultBatchSize: 1,
  defaultBatchTimeout: 100,
  maxRetries: 3,
  retryDelay: 1000,
};
```

### Low-Resource Settings

```typescript
const processing = {
  enableBatching: true,
  defaultBatchSize: 25, // Smaller batches
  defaultBatchTimeout: 10000, // Longer timeout
  maxRetries: 2,
  retryDelay: 2000, // Longer delays
};
```

## Logging Configuration (Required)

### Production Logging

```typescript
const logging = {
  level: 'warn', // Only warnings and errors
  enableMetrics: true, // Enable performance metrics
};
```

### Development Logging

```typescript
const logging = {
  level: 'debug', // All log messages
  enableMetrics: true, // Enable metrics for debugging
};
```

### Minimal Logging

```typescript
const logging = {
  level: 'error', // Only errors
  enableMetrics: false, // Disable metrics for performance
};
```

## Complete Configuration Examples

### Telegram Bot Configuration

```typescript
import { UnifiedSDK } from '@cere-ddc-sdk/unified';

const config = {
  ddcConfig: {
    signer: process.env.DDC_SIGNER!,
    bucketId: BigInt(process.env.DDC_BUCKET_ID!),
    network: 'testnet' as const,
  },
  activityConfig: {
    endpoint: 'https://api.stats.cere.network',
    keyringUri: process.env.ACTIVITY_KEYRING_URI!,
    appId: process.env.TELEGRAM_APP_ID!,
    connectionId: `tg_bot_${Date.now()}`,
    sessionId: `session_${Date.now()}`,
    appPubKey: process.env.APP_PUBLIC_KEY!,
    dataServicePubKey: process.env.DATA_SERVICE_PUBLIC_KEY!,
  },
  processing: {
    enableBatching: true,
    defaultBatchSize: 50, // Moderate batching for bots
    defaultBatchTimeout: 3000,
    maxRetries: 3,
    retryDelay: 1000,
  },
  logging: {
    level: 'info' as const,
    enableMetrics: true,
  },
};

const sdk = new UnifiedSDK(config);
```

### High-Volume Analytics Configuration

```typescript
const config = {
  ddcConfig: {
    signer: process.env.DDC_SIGNER!,
    bucketId: BigInt(process.env.DDC_BUCKET_ID!),
    clusterId: BigInt(process.env.DDC_CLUSTER_ID!),
    network: 'mainnet' as const,
  },
  activityConfig: {
    endpoint: 'https://api.stats.cere.network',
    keyringUri: process.env.ACTIVITY_KEYRING_URI!,
    appId: 'analytics-system',
    appPubKey: process.env.APP_PUBLIC_KEY!,
    dataServicePubKey: process.env.DATA_SERVICE_PUBLIC_KEY!,
  },
  processing: {
    enableBatching: true,
    defaultBatchSize: 500, // Large batches for high volume
    defaultBatchTimeout: 1000, // Quick processing
    maxRetries: 5,
    retryDelay: 500,
  },
  logging: {
    level: 'warn' as const, // Reduce log noise
    enableMetrics: true,
  },
};
```

### Development Configuration

```typescript
const config = {
  ddcConfig: {
    signer: '//Alice', // Built-in test account
    bucketId: BigInt(12345), // Test bucket
    network: 'devnet' as const,
  },
  activityConfig: {
    endpoint: 'http://localhost:3000', // Local development
    keyringUri: '//Alice',
    appId: 'dev-app',
    appPubKey: 'dev-key',
    dataServicePubKey: 'dev-service-key',
  },
  processing: {
    enableBatching: false, // Real-time for development
    defaultBatchSize: 1,
    defaultBatchTimeout: 100,
    maxRetries: 1, // Fail fast in development
    retryDelay: 500,
  },
  logging: {
    level: 'debug' as const, // Verbose logging
    enableMetrics: true,
  },
};
```

### DDC-Only Configuration

```typescript
const config = {
  ddcConfig: {
    signer: process.env.DDC_SIGNER!,
    bucketId: BigInt(process.env.DDC_BUCKET_ID!),
    network: 'testnet' as const,
  },
  // No activityConfig - SDK will operate in DDC-only mode
  processing: {
    enableBatching: true,
    defaultBatchSize: 100,
    defaultBatchTimeout: 5000,
    maxRetries: 3,
    retryDelay: 1000,
  },
  logging: {
    level: 'info' as const,
    enableMetrics: false,
  },
};
```

## Environment Variable Configuration

### .env File Setup

```bash
# DDC Configuration
DDC_SIGNER=your twelve word mnemonic phrase here
DDC_BUCKET_ID=573409
DDC_CLUSTER_ID=0x825c4b2352850de9986d9d28568db6f0c023a1e3
DDC_NETWORK=testnet

# Activity SDK Configuration
ACTIVITY_ENDPOINT=https://api.stats.cere.network
ACTIVITY_KEYRING_URI=your twelve word mnemonic phrase here
ACTIVITY_APP_ID=your-app-id
APP_PUBLIC_KEY=your-app-public-key
DATA_SERVICE_PUBLIC_KEY=your-data-service-public-key

# Optional Session IDs (auto-generated if not provided)
CONNECTION_ID=conn_unique_id
SESSION_ID=sess_unique_id
```

### Environment-Based Configuration

```typescript
const config = {
  ddcConfig: {
    signer: process.env.DDC_SIGNER!,
    bucketId: BigInt(process.env.DDC_BUCKET_ID!),
    clusterId: process.env.DDC_CLUSTER_ID ? BigInt(process.env.DDC_CLUSTER_ID) : undefined,
    network: (process.env.DDC_NETWORK as 'testnet' | 'devnet' | 'mainnet') || 'testnet',
  },
  activityConfig: process.env.ACTIVITY_ENDPOINT ? {
    endpoint: process.env.ACTIVITY_ENDPOINT,
    keyringUri: process.env.ACTIVITY_KEYRING_URI!,
    appId: process.env.ACTIVITY_APP_ID!,
    connectionId: process.env.CONNECTION_ID || `conn_${Date.now()}`,
    sessionId: process.env.SESSION_ID || `sess_${Date.now()}`,
    appPubKey: process.env.APP_PUBLIC_KEY!,
    dataServicePubKey: process.env.DATA_SERVICE_PUBLIC_KEY!,
  } : undefined,
  processing: {
    enableBatching: process.env.ENABLE_BATCHING !== 'false',
    defaultBatchSize: parseInt(process.env.BATCH_SIZE || '100'),
    defaultBatchTimeout: parseInt(process.env.BATCH_TIMEOUT || '5000'),
    maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
    retryDelay: parseInt(process.env.RETRY_DELAY || '1000'),
  },
  logging: {
    level: (process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info',
    enableMetrics: process.env.ENABLE_METRICS !== 'false',
  },
};
```

## Configuration Validation

The SDK validates configuration at runtime using Zod schemas:

```typescript
// This happens automatically when creating UnifiedSDK
try {
  const sdk = new UnifiedSDK(config);
  await sdk.initialize();
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Configuration validation failed:', error.validationErrors);
  }
}
```

## Dynamic Configuration Updates

While the SDK doesn't support hot-reloading configuration, you can implement dynamic updates:

```typescript
class ConfigurableSDK {
  private sdk?: UnifiedSDK;
  
  async updateConfig(newConfig: UnifiedSDKConfig) {
    // Cleanup existing SDK
    if (this.sdk) {
      await this.sdk.cleanup();
    }
    
    // Initialize with new config
    this.sdk = new UnifiedSDK(newConfig);
    await this.sdk.initialize();
  }
  
  async writeData(payload: any, options?: any) {
    if (!this.sdk) {
      throw new Error('SDK not initialized');
    }
    return this.sdk.writeData(payload, options);
  }
}
```

## Performance Tuning

### Batch Size Optimization

```typescript
// For small payloads (< 1KB each)
defaultBatchSize: 200

// For medium payloads (1-10KB each)
defaultBatchSize: 100

// For large payloads (> 10KB each)
defaultBatchSize: 25

// For very large payloads (> 100KB each)
defaultBatchSize: 5
```

### Timeout Optimization

```typescript
// For real-time requirements
defaultBatchTimeout: 500 // 0.5 seconds

// For balanced performance
defaultBatchTimeout: 2000 // 2 seconds

// For maximum throughput
defaultBatchTimeout: 10000 // 10 seconds
```

### Retry Strategy

```typescript
// For reliable networks
maxRetries: 2
retryDelay: 500

// For unreliable networks
maxRetries: 5
retryDelay: 2000

// For critical data
maxRetries: 10
retryDelay: 1000
```

## Security Considerations

### Sensitive Data Protection

```typescript
// ❌ Never hardcode sensitive values
const config = {
  ddcConfig: {
    signer: 'abandon abandon abandon...', // Don't do this!
  }
};

// ✅ Always use environment variables
const config = {
  ddcConfig: {
    signer: process.env.DDC_SIGNER!,
  }
};
```

### Configuration Sanitization

The SDK automatically sanitizes sensitive data in logs:

```typescript
// Logs will show:
{
  ddcConfig: {
    bucketId: "573409",
    network: "testnet"
    // signer is omitted for security
  },
  activityConfig: {
    endpoint: "https://api.stats.cere.network"
    // keys are omitted for security
  }
}
```

## Troubleshooting Configuration

### Common Issues

1. **Invalid BigInt format**:
   ```typescript
   // ❌ Wrong
   bucketId: 573409
   
   // ✅ Correct
   bucketId: BigInt(573409)
   ```

2. **Network endpoint issues**:
   ```typescript
   // The SDK handles endpoints automatically based on network
   // No need to specify blockchain URLs manually
   ```

3. **Missing required fields**:
   ```typescript
   // processing and logging are required fields
   const config = {
     ddcConfig: { /* ... */ },
     // activityConfig is optional
     processing: { /* required */ },
     logging: { /* required */ },
   };
   ```

### Configuration Debugging

```typescript
// Check configuration before initialization
const sdk = new UnifiedSDK(config);
const status = sdk.getStatus();
console.log('Configuration loaded:', status.config);

// Check component initialization
await sdk.initialize();
const postInitStatus = sdk.getStatus();
console.log('Components initialized:', postInitStatus.components);
```

## Best Practices

1. **Use Environment Variables**: Keep sensitive data in environment variables
2. **Validate Early**: Check configuration validity before deployment
3. **Monitor Resource Usage**: Adjust batch sizes based on memory/CPU usage
4. **Log Appropriately**: Use appropriate log levels for each environment
5. **Test Configurations**: Validate configurations in staging environments
6. **Document Settings**: Document custom configurations for your team

This configuration system provides maximum flexibility while maintaining security and performance best practices.
