# Troubleshooting Guide

## Overview

This guide helps you diagnose and resolve common issues when using the Unified Data Ingestion SDK. It covers error codes, diagnostic techniques, common problems, and their solutions.

## Quick Diagnostic Checklist

Before diving into specific issues, run through this quick checklist:

```typescript
// 1. Check SDK initialization
const status = sdk.getStatus();
console.log('SDK Status:', {
  initialized: status.initialized,
  ddcAvailable: status.ddcAvailable,
  activitySdkAvailable: status.activitySdkAvailable,
  errors: status.errors,
});

// 2. Verify configuration
console.log('Configuration check:', {
  hasDDCConfig: !!config.ddcConfig,
  hasActivityConfig: !!config.activityConfig,
  network: config.ddcConfig?.network,
  bucketId: config.ddcConfig?.bucketId?.toString(),
});

// 3. Test basic connectivity
try {
  const testResponse = await sdk.writeData(
    { test: true },
    {
      processing: {
        dataCloudWriteMode: 'direct',
        indexWriteMode: 'skip',
      },
    },
  );
  console.log('Basic connectivity test:', testResponse.success);
} catch (error) {
  console.error('Connectivity test failed:', error);
}
```

## Error Codes and Solutions

### UnifiedSDKError Codes

#### `CONFIG_INVALID`

**Symptoms:**

- SDK throws configuration validation errors
- Missing required configuration fields
- Invalid data types in configuration

**Common Causes:**

```typescript
// ❌ Missing required DDC config
const config = {
  // ddcConfig missing
  activityConfig: {
    /* ... */
  },
};

// ❌ Wrong bucket ID type
const config = {
  ddcConfig: {
    signer: '//Alice',
    bucketId: 12345, // Should be BigInt(12345)
    network: 'testnet',
  },
};

// ❌ Invalid network value
const config = {
  ddcConfig: {
    signer: '//Alice',
    bucketId: BigInt(12345),
    network: 'invalid-network', // Must be 'mainnet' or 'testnet'
  },
};
```

**Solutions:**

```typescript
// ✅ Correct configuration
const config = {
  ddcConfig: {
    signer: '//Alice', // Valid substrate signer
    bucketId: BigInt(12345), // Use BigInt for bucket ID
    network: 'testnet', // Valid network
  },
  activityConfig: {
    // Optional but properly structured
    keyringUri: '//Alice',
    appId: 'my-app',
    endpoint: 'https://api.stats.testnet.cere.network',
    appPubKey: 'valid-app-key',
    dataServicePubKey: 'valid-service-key',
  },
};

// Validate configuration before using
function validateConfig(config: UnifiedSDKConfig): void {
  if (!config.ddcConfig) {
    throw new Error('DDC configuration is required');
  }

  if (typeof config.ddcConfig.bucketId !== 'bigint') {
    throw new Error('Bucket ID must be a BigInt');
  }

  if (!['mainnet', 'testnet'].includes(config.ddcConfig.network)) {
    throw new Error('Network must be mainnet or testnet');
  }
}
```

#### `INIT_FAILED`

**Symptoms:**

- SDK initialization fails
- Cannot connect to DDC or Activity SDK
- Network connectivity issues

**Debugging Steps:**

```typescript
// Check network connectivity
async function diagnoseDDCConnection(config: DDCConfig) {
  try {
    const { DdcClient } = await import('@cere-ddc-sdk/ddc-client');
    const client = await DdcClient.create(config.signer, {
      blockchain:
        config.network === 'mainnet' ? 'wss://rpc.mainnet.cere.network/ws' : 'wss://rpc.testnet.cere.network/ws',
    });
    console.log('DDC connection successful');
    return true;
  } catch (error) {
    console.error('DDC connection failed:', error);
    return false;
  }
}

// Check Activity SDK connectivity
async function diagnoseActivityConnection(config: ActivityConfig) {
  try {
    const response = await fetch(`${config.endpoint}/health`);
    if (response.ok) {
      console.log('Activity SDK endpoint accessible');
      return true;
    } else {
      console.error('Activity SDK endpoint returned:', response.status);
      return false;
    }
  } catch (error) {
    console.error('Activity SDK connection failed:', error);
    return false;
  }
}
```

**Common Solutions:**

```typescript
// 1. Check network and firewall settings
// 2. Verify endpoint URLs are correct
// 3. Ensure signing keys are valid

// Retry with exponential backoff
async function initializeWithRetry(sdk: UnifiedSDK, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await sdk.initialize();
      console.log(`Initialization successful on attempt ${attempt}`);
      return;
    } catch (error) {
      console.warn(`Initialization attempt ${attempt} failed:`, error);

      if (attempt === maxRetries) {
        throw new Error(`Failed to initialize after ${maxRetries} attempts`);
      }

      // Exponential backoff
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
```

#### `VALIDATION_FAILED`

**Symptoms:**

- Data validation errors
- Invalid metadata structure
- Business rule violations

**Common Validation Issues:**

```typescript
// ❌ Invalid metadata structure
const invalidMetadata = {
  processing: {
    dataCloudWriteMode: 'invalid-mode', // Must be 'direct', 'batch', 'viaIndex', or 'skip'
    indexWriteMode: 'invalid-mode', // Must be 'realtime' or 'skip'
  },
};

// ❌ Business rule violation
const conflictingMetadata = {
  processing: {
    dataCloudWriteMode: 'skip', // Both actions disabled
    indexWriteMode: 'skip', // Violates business rule
  },
};

// ❌ Invalid Telegram data
const invalidTelegramEvent = {
  eventType: '', // Empty event type
  userId: '', // Empty user ID
  // timestamp missing                   // Required field missing
};
```

**Solutions:**

```typescript
// ✅ Use schema validation
import { z } from 'zod';

const TelegramEventSchema = z.object({
  eventType: z.string().min(1),
  userId: z.string().min(1),
  chatId: z.string().optional(),
  eventData: z.any(),
  timestamp: z.date(),
});

function validateTelegramEvent(data: any): TelegramEventData {
  try {
    return TelegramEventSchema.parse(data);
  } catch (error) {
    console.error('Validation failed:', error);
    throw new ValidationError('Invalid Telegram event data', 'eventData', data);
  }
}

// ✅ Validate metadata before use
function createValidMetadata(options: any) {
  return {
    processing: {
      dataCloudWriteMode: options.storeInDDC ? 'direct' : 'skip',
      indexWriteMode: options.indexData ? 'realtime' : 'skip',
      priority: options.priority || 'normal',
    },
  };
}
```

#### `NETWORK_ERROR`

**Symptoms:**

- Connection timeouts
- DNS resolution failures
- SSL certificate errors

**Debugging Network Issues:**

```typescript
// Network diagnostic utility
async function diagnoseNetworkIssues(config: UnifiedSDKConfig) {
  const results = {
    ddcBlockchain: false,
    activityEndpoint: false,
    dnsResolution: false,
  };

  // Test blockchain connectivity
  try {
    const wsUrl =
      config.ddcConfig.network === 'mainnet'
        ? 'wss://rpc.mainnet.cere.network/ws'
        : 'wss://rpc.testnet.cere.network/ws';

    const ws = new WebSocket(wsUrl);
    await new Promise((resolve, reject) => {
      ws.onopen = () => {
        results.ddcBlockchain = true;
        ws.close();
        resolve(true);
      };
      ws.onerror = reject;
      setTimeout(reject, 5000); // 5 second timeout
    });
  } catch (error) {
    console.error('Blockchain connection failed:', error);
  }

  // Test Activity SDK endpoint
  if (config.activityConfig) {
    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 5000);

      const response = await fetch(config.activityConfig.endpoint, {
        signal: controller.signal,
      });
      results.activityEndpoint = response.ok;
    } catch (error) {
      console.error('Activity endpoint failed:', error);
    }
  }

  return results;
}
```

#### `SERVICE_UNAVAILABLE`

**Symptoms:**

- External service downtime
- Rate limiting responses
- Service maintenance periods

**Handling Service Unavailability:**

```typescript
// Circuit breaker pattern
class ServiceCircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private readonly maxFailures = 5;
  private readonly resetTimeout = 60000; // 1 minute

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.isOpen()) {
      throw new Error('Circuit breaker is open - service unavailable');
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private isOpen(): boolean {
    if (this.failures >= this.maxFailures) {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.reset();
        return false;
      }
      return true;
    }
    return false;
  }

  private onSuccess(): void {
    this.failures = 0;
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
  }

  private reset(): void {
    this.failures = 0;
    this.lastFailureTime = 0;
  }
}

// Usage with SDK
const circuitBreaker = new ServiceCircuitBreaker();

async function safeWriteData(sdk: UnifiedSDK, data: any, metadata: Metadata) {
  try {
    return await circuitBreaker.execute(() => sdk.writeData(data, metadata));
  } catch (error) {
    console.error('Service unavailable, queuing for later:', error);
    await queueForLater(data, metadata);
    throw error;
  }
}
```

## Common Issues and Solutions

### Issue 1: "BigInt is not defined" Error

**Problem:**

```
ReferenceError: BigInt is not defined
```

**Cause:** Using older Node.js version or browser environment without BigInt support.

**Solution:**

```typescript
// Check BigInt support
if (typeof BigInt === 'undefined') {
  throw new Error('BigInt is not supported in this environment. Please use Node.js 10.4.0+ or a modern browser.');
}

// Alternative for older environments
function createBigInt(value: number | string): bigint {
  if (typeof BigInt === 'undefined') {
    throw new Error('BigInt not supported');
  }
  return BigInt(value);
}

const bucketId = createBigInt(12345);
```

### Issue 2: Memory Leaks

**Symptoms:**

- Increasing memory usage over time
- Application crashes with out-of-memory errors
- Slow performance degradation

**Debugging Memory Issues:**

```typescript
// Monitor memory usage
function logMemoryUsage() {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const memory = process.memoryUsage();
    console.log('Memory usage:', {
      rss: `${Math.round(memory.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memory.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024)} MB`,
      external: `${Math.round(memory.external / 1024 / 1024)} MB`,
    });
  }
}

// Monitor memory periodically
setInterval(logMemoryUsage, 30000); // Every 30 seconds
```

**Solutions:**

```typescript
// 1. Proper cleanup
class Application {
  private sdk: UnifiedSDK;

  async initialize() {
    this.sdk = new UnifiedSDK(config);
    await this.sdk.initialize();

    // Setup cleanup handlers
    process.on('SIGTERM', this.cleanup.bind(this));
    process.on('SIGINT', this.cleanup.bind(this));
  }

  async cleanup() {
    console.log('Cleaning up resources...');
    await this.sdk.cleanup();
    process.exit(0);
  }
}

// 2. Avoid holding references
async function processData(data: any[]) {
  // ❌ Don't keep all results in memory
  // const results = [];
  // for (const item of data) {
  //   results.push(await sdk.writeData(item, metadata));
  // }

  // ✅ Process and release
  for (const item of data) {
    const result = await sdk.writeData(item, metadata);
    await processResult(result); // Handle immediately
    // result goes out of scope and can be garbage collected
  }
}
```

### Issue 3: Performance Issues

**Symptoms:**

- Slow response times
- High CPU usage
- Network timeouts

**Performance Debugging:**

```typescript
// Performance monitoring
class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  time(operation: string): () => void {
    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      if (!this.metrics.has(operation)) {
        this.metrics.set(operation, []);
      }
      this.metrics.get(operation)!.push(duration);
    };
  }

  getStats(operation: string) {
    const times = this.metrics.get(operation) || [];
    if (times.length === 0) return null;

    const sorted = times.sort((a, b) => a - b);
    return {
      count: times.length,
      avg: times.reduce((a, b) => a + b, 0) / times.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
    };
  }
}

// Usage
const monitor = new PerformanceMonitor();

async function monitoredWrite(data: any, metadata: Metadata) {
  const endTimer = monitor.time('writeData');
  try {
    const result = await sdk.writeData(data, metadata);
    endTimer();
    return result;
  } catch (error) {
    endTimer();
    throw error;
  }
}

// Report stats periodically
setInterval(() => {
  console.log('Performance stats:', monitor.getStats('writeData'));
}, 60000);
```

**Performance Optimizations:**

```typescript
// 1. Optimize batching
const optimizedConfig = {
  processing: {
    enableBatching: true,
    defaultBatchSize: 100, // Larger batches for throughput
    defaultBatchTimeout: 1000, // Shorter timeout for latency
  },
};

// 2. Use appropriate write modes
const fastMetadata = {
  processing: {
    dataCloudWriteMode: 'batch', // Use batching for bulk operations
    indexWriteMode: 'realtime', // Index immediately for analytics
    priority: 'high', // High priority for critical data
  },
};

// 3. Connection pooling
const sdk = new UnifiedSDK({
  // ... other config
  activityConfig: {
    // ... other config
    connectionId: 'persistent-connection', // Reuse connections
  },
});
```

### Issue 4: TypeScript Compilation Errors

**Common TypeScript Issues:**

```typescript
// ❌ Type mismatches
const event: TelegramEventData = {
  eventType: 'test',
  userId: 123, // Should be string
  timestamp: '2024-01-01', // Should be Date
};

// ❌ Missing required fields
const metadata = {
  processing: {
    // dataCloudWriteMode missing
    indexWriteMode: 'realtime',
  },
};

// ❌ Incorrect enum values
const config = {
  ddcConfig: {
    network: 'development', // Should be 'mainnet' or 'testnet'
  },
};
```

**Solutions:**

```typescript
// ✅ Correct types
const event: TelegramEventData = {
  eventType: 'test',
  userId: '123', // String
  timestamp: new Date(), // Date object
  eventData: {},
};

// ✅ Complete metadata
const metadata: Metadata = {
  processing: {
    dataCloudWriteMode: 'direct',
    indexWriteMode: 'realtime',
  },
};

// ✅ Use type assertions carefully
const userInput = getUserInput();
const bucketId = BigInt(userInput as string);

// ✅ Use type guards
function isTelegramEventData(obj: any): obj is TelegramEventData {
  return (
    typeof obj === 'object' &&
    typeof obj.eventType === 'string' &&
    typeof obj.userId === 'string' &&
    obj.timestamp instanceof Date
  );
}
```

## Debugging Techniques

### 1. Enable Debug Logging

```typescript
const sdk = new UnifiedSDK({
  // ... config
  logging: {
    level: 'debug', // Enable verbose logging
    enableMetrics: true, // Collect performance metrics
  },
});

// Custom debug wrapper
function debugWrapper<T extends any[], R>(fn: (...args: T) => Promise<R>, name: string) {
  return async (...args: T): Promise<R> => {
    console.log(`[DEBUG] Calling ${name} with args:`, args);
    const start = Date.now();

    try {
      const result = await fn(...args);
      const duration = Date.now() - start;
      console.log(`[DEBUG] ${name} completed in ${duration}ms:`, result);
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      console.error(`[DEBUG] ${name} failed after ${duration}ms:`, error);
      throw error;
    }
  };
}

// Usage
const debugWriteData = debugWrapper(sdk.writeData.bind(sdk), 'writeData');
```

### 2. Network Request Debugging

```typescript
// Intercept network requests
if (typeof global !== 'undefined') {
  const originalFetch = global.fetch;
  global.fetch = async (url: string, options?: any) => {
    console.log(`[NETWORK] ${options?.method || 'GET'} ${url}`);
    const start = Date.now();

    try {
      const response = await originalFetch(url, options);
      const duration = Date.now() - start;
      console.log(`[NETWORK] Response ${response.status} in ${duration}ms`);
      return response;
    } catch (error) {
      const duration = Date.now() - start;
      console.error(`[NETWORK] Request failed after ${duration}ms:`, error);
      throw error;
    }
  };
}
```

### 3. State Inspection

```typescript
// Debug SDK state
function inspectSDKState(sdk: UnifiedSDK) {
  const status = sdk.getStatus();
  console.log('SDK State Inspection:', {
    status,
    timestamp: new Date().toISOString(),
    // Add any other relevant state information
  });
}

// Call periodically or on errors
setInterval(() => inspectSDKState(sdk), 30000);
```

## Production Monitoring

### Health Checks

```typescript
// Comprehensive health check
async function healthCheck(sdk: UnifiedSDK): Promise<HealthStatus> {
  const status = sdk.getStatus();
  const checks = {
    sdkInitialized: status.initialized,
    ddcAvailable: status.ddcAvailable,
    activitySdkAvailable: status.activitySdkAvailable,
    hasErrors: status.errors.length > 0,
  };

  // Test basic functionality
  try {
    await sdk.writeData(
      { healthCheck: true },
      {
        processing: {
          dataCloudWriteMode: 'direct',
          indexWriteMode: 'skip',
        },
      },
    );
    checks.basicFunctionality = true;
  } catch (error) {
    checks.basicFunctionality = false;
    console.error('Health check failed:', error);
  }

  const healthy = Object.values(checks).every((check) => check === true);

  return {
    healthy,
    checks,
    timestamp: new Date().toISOString(),
  };
}

// Express.js health endpoint
app.get('/health', async (req, res) => {
  try {
    const health = await healthCheck(sdk);
    res.status(health.healthy ? 200 : 500).json(health);
  } catch (error) {
    res.status(500).json({
      healthy: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});
```

### Error Tracking Integration

```typescript
// Sentry integration example
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

// Wrap SDK operations
async function trackErrors<T>(operation: () => Promise<T>, context: Record<string, any>): Promise<T> {
  return Sentry.withScope((scope) => {
    scope.setContext('sdk_operation', context);
    return operation();
  });
}

// Usage
const result = await trackErrors(() => sdk.writeTelegramEvent(eventData), {
  eventType: eventData.eventType,
  userId: eventData.userId,
  timestamp: eventData.timestamp.toISOString(),
});
```

## Getting Help

### 1. Gather Diagnostic Information

Before seeking help, collect this information:

```typescript
// Diagnostic information collector
function collectDiagnostics(sdk: UnifiedSDK, error?: Error) {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    sdkVersion: sdk.getStatus().version,
    nodeVersion: process.version,
    platform: process.platform,
    architecture: process.arch,
    memoryUsage: process.memoryUsage(),
    sdkStatus: sdk.getStatus(),
    error: error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
          code: (error as any).code,
          component: (error as any).component,
        }
      : null,
    // Don't include sensitive configuration
    configStructure: {
      hasDDCConfig: !!config.ddcConfig,
      hasActivityConfig: !!config.activityConfig,
      network: config.ddcConfig?.network,
      loggingLevel: config.logging?.level,
    },
  };

  return diagnostics;
}
```

### 2. Create Minimal Reproduction

```typescript
// Minimal reproduction template
import { UnifiedSDK } from '@cere-ddc-sdk/unified';

async function reproduceIssue() {
  const sdk = new UnifiedSDK({
    ddcConfig: {
      signer: '//Alice',
      bucketId: BigInt(12345),
      network: 'testnet',
    },
    // Add minimal configuration to reproduce the issue
  });

  try {
    await sdk.initialize();

    // Add minimal code that reproduces the issue
    const result = await sdk.writeData(
      { test: true },
      {
        processing: {
          dataCloudWriteMode: 'direct',
          indexWriteMode: 'skip',
        },
      },
    );

    console.log('Success:', result);
  } catch (error) {
    console.error('Error reproduced:', error);
    console.log('Diagnostics:', collectDiagnostics(sdk, error));
  }
}

reproduceIssue();
```

### 3. Support Channels

- **GitHub Issues**: For bugs and feature requests
- **Documentation**: Check the [API Reference](./api-reference.md) and other guides
- **Community**: Join the Cere developer community
- **Support Email**: Contact Cere support team with diagnostic information

Remember to sanitize any sensitive information (keys, personal data) before sharing diagnostic information.
