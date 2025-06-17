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

  // Nightingale-specific configuration (optional)
  nightingaleConfig?: {
    videoProcessing?: {
      chunkSize?: number; // Default chunk size for video processing
      timelinePreservation?: boolean; // Maintain temporal relationships
      compression?: boolean; // Enable video compression
    };
    klvProcessing?: {
      coordinateIndexing?: boolean; // Index coordinate data
      metadataValidation?: boolean; // Validate KLV metadata
    };
    telemetryProcessing?: {
      timeSeries?: boolean; // Enable time series processing
      coordinateTracking?: boolean; // Track coordinate changes
    };
  };

  // Processing options (required)
  processing: {
    enableBatching: boolean;
    defaultBatchSize: number;
    defaultBatchTimeout: number; // in milliseconds
    maxRetries: number;
    retryDelay: number; // in milliseconds
  };

  // Performance tuning (optional)
  performance?: {
    connectionTimeout?: number; // Connection timeout in ms
    requestTimeout?: number; // Request timeout in ms
    maxConcurrentRequests?: number; // Max parallel requests
  };

  // Error handling (optional)
  errorHandling?: {
    enableFallbacks?: boolean; // Enable fallback mechanisms
    circuitBreakerThreshold?: number; // Circuit breaker failure threshold
    fallbackToDataCloud?: boolean; // Fallback to DDC when Activity SDK fails
  };

  // Logging and monitoring (required)
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    enableMetrics: boolean;
    logRequests?: boolean; // Log all requests (debug only)
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

## Nightingale Configuration (Optional)

The Nightingale configuration is specifically designed for drone video processing, KLV metadata handling, and telemetry data management.

### Video Processing Configuration

```typescript
const nightingaleConfig = {
  videoProcessing: {
    chunkSize: 1024 * 1024, // 1MB chunks (default)
    timelinePreservation: true, // Maintain temporal relationships
    compression: true, // Enable video compression
  },
};
```

### KLV Processing Configuration

```typescript
const nightingaleConfig = {
  klvProcessing: {
    coordinateIndexing: true, // Index coordinate data for searchability
    metadataValidation: true, // Validate KLV metadata structure
  },
};
```

### Telemetry Processing Configuration

```typescript
const nightingaleConfig = {
  telemetryProcessing: {
    timeSeries: true, // Enable time series processing
    coordinateTracking: true, // Track coordinate changes over time
  },
};
```

### Complete Nightingale Configuration

```typescript
const nightingaleConfig = {
  videoProcessing: {
    chunkSize: 2 * 1024 * 1024, // 2MB chunks for high-quality video
    timelinePreservation: true,
    compression: false, // Disable compression for analysis
  },
  klvProcessing: {
    coordinateIndexing: true,
    metadataValidation: true,
  },
  telemetryProcessing: {
    timeSeries: true,
    coordinateTracking: true,
  },
};
```

## Performance Configuration (Optional)

Advanced performance tuning options for high-throughput scenarios.

### Connection and Timeout Settings

```typescript
const performance = {
  connectionTimeout: 30000, // 30 seconds connection timeout
  requestTimeout: 60000, // 60 seconds request timeout
  maxConcurrentRequests: 10, // Maximum parallel requests
};
```

### High-Performance Settings

```typescript
const performance = {
  connectionTimeout: 15000, // Faster connection timeout
  requestTimeout: 30000, // Faster request timeout
  maxConcurrentRequests: 20, // More parallel requests
};
```

### Conservative Settings

```typescript
const performance = {
  connectionTimeout: 60000, // Longer connection timeout
  requestTimeout: 120000, // Longer request timeout
  maxConcurrentRequests: 5, // Fewer parallel requests
};
```

## Error Handling Configuration (Optional)

Advanced error handling and fallback mechanisms.

### Basic Error Handling

```typescript
const errorHandling = {
  enableFallbacks: true, // Enable fallback mechanisms
  circuitBreakerThreshold: 5, // Fail-fast after 5 consecutive errors
  fallbackToDataCloud: true, // Use DDC when Activity SDK fails
};
```

### Production Error Handling

```typescript
const errorHandling = {
  enableFallbacks: true,
  circuitBreakerThreshold: 10, // More tolerance for errors
  fallbackToDataCloud: true,
};
```

### Development Error Handling

```typescript
const errorHandling = {
  enableFallbacks: false, // Disable fallbacks to see all errors
  circuitBreakerThreshold: 3, // Fail fast for debugging
  fallbackToDataCloud: false, // Force Activity SDK usage
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
  logRequests: true, // Log all requests for debugging
};
```

### Minimal Logging

```typescript
const logging = {
  level: 'error', // Only errors
  enableMetrics: false, // Disable metrics for performance
  logRequests: false, // Disable request logging
};
```

### Debug Logging

```typescript
const logging = {
  level: 'debug',
  enableMetrics: true,
  logRequests: true, // Enable detailed request logging
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
  performance: {
    connectionTimeout: 30000,
    requestTimeout: 60000,
    maxConcurrentRequests: 10,
  },
  errorHandling: {
    enableFallbacks: true,
    circuitBreakerThreshold: 5,
    fallbackToDataCloud: true,
  },
  logging: {
    level: 'info' as const,
    enableMetrics: true,
    logRequests: false,
  },
};

const sdk = new UnifiedSDK(config);
```

### Nightingale Drone Data Configuration

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
    appId: 'nightingale-drone-system',
    appPubKey: process.env.APP_PUBLIC_KEY!,
    dataServicePubKey: process.env.DATA_SERVICE_PUBLIC_KEY!,
  },
  nightingaleConfig: {
    videoProcessing: {
      chunkSize: 2 * 1024 * 1024, // 2MB chunks for high-quality video
      timelinePreservation: true,
      compression: false, // Keep original quality for analysis
    },
    klvProcessing: {
      coordinateIndexing: true, // Enable GPS coordinate indexing
      metadataValidation: true, // Validate all KLV metadata
    },
    telemetryProcessing: {
      timeSeries: true, // Enable time series analysis
      coordinateTracking: true, // Track drone movement
    },
  },
  processing: {
    enableBatching: true,
    defaultBatchSize: 25, // Smaller batches for large video data
    defaultBatchTimeout: 10000, // Longer timeout for video processing
    maxRetries: 5,
    retryDelay: 2000,
  },
  performance: {
    connectionTimeout: 60000, // Longer timeout for video uploads
    requestTimeout: 300000, // 5 minutes for large video chunks
    maxConcurrentRequests: 5, // Limit concurrent video uploads
  },
  errorHandling: {
    enableFallbacks: true,
    circuitBreakerThreshold: 10, // More tolerance for video processing
    fallbackToDataCloud: true,
  },
  logging: {
    level: 'info' as const,
    enableMetrics: true,
    logRequests: false, // Disable to reduce log volume
  },
};
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
  performance: {
    connectionTimeout: 15000, // Fast connection timeout
    requestTimeout: 30000, // Fast request timeout
    maxConcurrentRequests: 20, // High concurrency
  },
  errorHandling: {
    enableFallbacks: true,
    circuitBreakerThreshold: 15, // High tolerance for volume
    fallbackToDataCloud: true,
  },
  logging: {
    level: 'warn' as const, // Reduce log noise
    enableMetrics: true,
    logRequests: false, // Disable to reduce overhead
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
  performance: {
    connectionTimeout: 10000, // Short timeout for dev
    requestTimeout: 20000, // Short timeout for dev
    maxConcurrentRequests: 5, // Limited concurrency
  },
  errorHandling: {
    enableFallbacks: false, // Disable fallbacks to see all errors
    circuitBreakerThreshold: 3, // Fail fast for debugging
    fallbackToDataCloud: false, // Force Activity SDK usage
  },
  logging: {
    level: 'debug' as const, // Verbose logging
    enableMetrics: true,
    logRequests: true, // Enable request logging for debugging
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

# Nightingale Configuration (optional)
NIGHTINGALE_VIDEO_CHUNK_SIZE=2097152
NIGHTINGALE_TIMELINE_PRESERVATION=true
NIGHTINGALE_COMPRESSION=false
NIGHTINGALE_COORDINATE_INDEXING=true
NIGHTINGALE_METADATA_VALIDATION=true
NIGHTINGALE_TIME_SERIES=true
NIGHTINGALE_COORDINATE_TRACKING=true

# Performance Configuration (optional)
CONNECTION_TIMEOUT=30000
REQUEST_TIMEOUT=60000
MAX_CONCURRENT_REQUESTS=10

# Error Handling Configuration (optional)
ENABLE_FALLBACKS=true
CIRCUIT_BREAKER_THRESHOLD=5
FALLBACK_TO_DATA_CLOUD=true

# Logging Configuration (optional)
LOG_REQUESTS=false
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
  nightingaleConfig: process.env.NIGHTINGALE_VIDEO_CHUNK_SIZE ? {
    videoProcessing: {
      chunkSize: parseInt(process.env.NIGHTINGALE_VIDEO_CHUNK_SIZE || '1048576'),
      timelinePreservation: process.env.NIGHTINGALE_TIMELINE_PRESERVATION !== 'false',
      compression: process.env.NIGHTINGALE_COMPRESSION !== 'false',
    },
    klvProcessing: {
      coordinateIndexing: process.env.NIGHTINGALE_COORDINATE_INDEXING !== 'false',
      metadataValidation: process.env.NIGHTINGALE_METADATA_VALIDATION !== 'false',
    },
    telemetryProcessing: {
      timeSeries: process.env.NIGHTINGALE_TIME_SERIES !== 'false',
      coordinateTracking: process.env.NIGHTINGALE_COORDINATE_TRACKING !== 'false',
    },
  } : undefined,
  processing: {
    enableBatching: process.env.ENABLE_BATCHING !== 'false',
    defaultBatchSize: parseInt(process.env.BATCH_SIZE || '100'),
    defaultBatchTimeout: parseInt(process.env.BATCH_TIMEOUT || '5000'),
    maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
    retryDelay: parseInt(process.env.RETRY_DELAY || '1000'),
  },
  performance: process.env.CONNECTION_TIMEOUT ? {
    connectionTimeout: parseInt(process.env.CONNECTION_TIMEOUT || '30000'),
    requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || '60000'),
    maxConcurrentRequests: parseInt(process.env.MAX_CONCURRENT_REQUESTS || '10'),
  } : undefined,
  errorHandling: process.env.ENABLE_FALLBACKS ? {
    enableFallbacks: process.env.ENABLE_FALLBACKS !== 'false',
    circuitBreakerThreshold: parseInt(process.env.CIRCUIT_BREAKER_THRESHOLD || '5'),
    fallbackToDataCloud: process.env.FALLBACK_TO_DATA_CLOUD !== 'false',
  } : undefined,
  logging: {
    level: (process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info',
    enableMetrics: process.env.ENABLE_METRICS !== 'false',
    logRequests: process.env.LOG_REQUESTS === 'true',
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

## Use Case-Specific Configuration Patterns

### Nightingale Drone Operations

For drone video processing and telemetry data handling:

```typescript
// Real-time telemetry processing
const realtimeTelemetryConfig = {
  nightingaleConfig: {
    telemetryProcessing: {
      timeSeries: true,
      coordinateTracking: true,
    },
  },
  processing: {
    enableBatching: false, // Real-time processing
    maxRetries: 1, // Fail fast for real-time data
  },
  performance: {
    maxConcurrentRequests: 15, // High concurrency for telemetry
  },
};

// Video analysis and storage
const videoAnalysisConfig = {
  nightingaleConfig: {
    videoProcessing: {
      chunkSize: 4 * 1024 * 1024, // 4MB chunks for analysis
      timelinePreservation: true,
      compression: false, // Keep original quality
    },
    klvProcessing: {
      coordinateIndexing: true,
      metadataValidation: true,
    },
  },
  processing: {
    enableBatching: true,
    defaultBatchSize: 10, // Small batches for large video data
    defaultBatchTimeout: 30000, // 30 seconds for video processing
  },
  performance: {
    requestTimeout: 600000, // 10 minutes for large video uploads
    maxConcurrentRequests: 3, // Limit concurrent video processing
  },
};
```

### High-Frequency Data Ingestion

For applications with high data volume:

```typescript
const highFrequencyConfig = {
  processing: {
    enableBatching: true,
    defaultBatchSize: 1000, // Large batches
    defaultBatchTimeout: 500, // Fast processing
  },
  performance: {
    connectionTimeout: 5000, // Fast connections
    requestTimeout: 15000, // Fast requests
    maxConcurrentRequests: 25, // High concurrency
  },
  errorHandling: {
    circuitBreakerThreshold: 20, // High tolerance
    fallbackToDataCloud: true,
  },
  logging: {
    level: 'warn', // Minimal logging for performance
    enableMetrics: true,
    logRequests: false,
  },
};
```

### Development and Testing

For development environments with debugging needs:

```typescript
const developmentConfig = {
  processing: {
    enableBatching: false, // Process immediately
    maxRetries: 1, // Fail fast
  },
  performance: {
    connectionTimeout: 5000, // Short timeouts
    requestTimeout: 10000,
    maxConcurrentRequests: 3, // Limited concurrency
  },
  errorHandling: {
    enableFallbacks: false, // See all errors
    circuitBreakerThreshold: 1, // Immediate failure
    fallbackToDataCloud: false,
  },
  logging: {
    level: 'debug', // Verbose logging
    enableMetrics: true,
    logRequests: true, // Log all requests
  },
};
```

## Configuration Validation and Monitoring

### Runtime Validation

```typescript
import { z } from 'zod';

// Custom validation schema
const customConfigSchema = z.object({
  ddcConfig: z.object({
    bucketId: z.bigint().min(BigInt(1)),
    network: z.enum(['testnet', 'devnet', 'mainnet']),
  }),
  nightingaleConfig: z.object({
    videoProcessing: z.object({
      chunkSize: z.number().min(1024).max(10 * 1024 * 1024), // 1KB to 10MB
    }),
  }).optional(),
});

// Validate configuration before use
try {
  const validatedConfig = customConfigSchema.parse(config);
  const sdk = new UnifiedSDK(validatedConfig);
} catch (error) {
  console.error('Configuration validation failed:', error);
}
```

### Configuration Monitoring

```typescript
class ConfigurationMonitor {
  private sdk: UnifiedSDK;
  
  constructor(config: UnifiedSDKConfig) {
    this.sdk = new UnifiedSDK(config);
  }
  
  async monitorPerformance() {
    const status = this.sdk.getStatus();
    
    // Monitor batch processing efficiency
    if (status.metrics?.batchEfficiency < 0.8) {
      console.warn('Consider increasing batch size for better efficiency');
    }
    
    // Monitor error rates
    if (status.metrics?.errorRate > 0.1) {
      console.warn('High error rate detected, check error handling configuration');
    }
    
    // Monitor resource usage
    if (status.metrics?.avgResponseTime > 5000) {
      console.warn('High response times, consider adjusting performance settings');
    }
  }
}
```

## Best Practices

1. **Use Environment Variables**: Keep sensitive data in environment variables
2. **Validate Early**: Check configuration validity before deployment
3. **Monitor Resource Usage**: Adjust batch sizes based on memory/CPU usage
4. **Log Appropriately**: Use appropriate log levels for each environment
5. **Test Configurations**: Validate configurations in staging environments
6. **Document Settings**: Document custom configurations for your team
7. **Use Case-Specific Tuning**: Configure based on your specific data patterns
8. **Monitor Performance**: Regularly check metrics and adjust settings
9. **Fallback Planning**: Always configure appropriate fallback mechanisms
10. **Security First**: Never hardcode sensitive values in configuration files

## Configuration Migration Guide

When upgrading from older versions, follow this migration pattern:

```typescript
// Old configuration (v1.x)
const oldConfig = {
  ddcConfig: { /* ... */ },
  activityConfig: { /* ... */ },
  processing: { /* ... */ },
  logging: { /* ... */ },
};

// New configuration (v2.x+) - backward compatible
const newConfig = {
  ...oldConfig,
  // Add new optional configurations as needed
  nightingaleConfig: {
    videoProcessing: {
      chunkSize: 1024 * 1024, // 1MB default
      timelinePreservation: true,
      compression: true,
    },
  },
  performance: {
    connectionTimeout: 30000,
    requestTimeout: 60000,
    maxConcurrentRequests: 10,
  },
  errorHandling: {
    enableFallbacks: true,
    circuitBreakerThreshold: 5,
    fallbackToDataCloud: true,
  },
};
```

This comprehensive configuration system provides maximum flexibility while maintaining security and performance best practices across all supported use cases including Telegram bots, analytics systems, and Nightingale drone operations.
