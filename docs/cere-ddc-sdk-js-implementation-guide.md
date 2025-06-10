# Cere DDC SDK - Developer Implementation Guide

## Introduction

This guide provides practical implementation instructions for developers who want to integrate the Cere DDC SDK into their applications. It covers setup, configuration, common use cases, and best practices for different scenarios.

## Getting Started

### Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **TypeScript**: 4.5+ (recommended)
- **Package Manager**: npm, yarn, or pnpm

### Installation

```bash
# Install the main client (recommended starting point)
npm install @cere-ddc-sdk/ddc-client

# Install the unified SDK (for advanced data ingestion)
npm install @cere-ddc-sdk/unified

# Install individual packages as needed
npm install @cere-ddc-sdk/blockchain
npm install @cere-ddc-sdk/file-storage
npm install @cere-ddc-sdk/ddc
npm install @cere-ddc-sdk/cli
```

### Environment Setup

1. **Create environment configuration**:

```typescript
// config/ddc.config.ts
export const ddcConfig = {
  network: 'testnet' as const, // or 'mainnet'
  signer: process.env.DDC_SIGNER || '//Alice', // Your mnemonic or URI
  bucketId: BigInt(process.env.DDC_BUCKET_ID || '573409'),
  clusterId: process.env.DDC_CLUSTER_ID || '0x825c4b2352850de9986d9d28568db6f0c023a1e3',
};

export const activityConfig = {
  endpoint: process.env.ACTIVITY_ENDPOINT || 'https://ai-event.stage.cere.io',
  keyringUri: process.env.ACTIVITY_KEYRING_URI || '//Alice',
  appId: process.env.APP_ID || '2621',
  appPubKey: process.env.APP_PUBLIC_KEY || '0x367bd16b9fa69acc8d769add1652799683d68273eae126d2d4bae4d7b8e75bb6',
  dataServicePubKey: process.env.DATA_SERVICE_PUBLIC_KEY || '0x8225bda7fc68c17407e933ba8a44a3cbb31ce933ef002fb60337ff63c952b932',
};
```

2. **Create environment variables** (`.env`):

```bash
# DDC Configuration
DDC_SIGNER=your-twelve-word-mnemonic-phrase-here
DDC_BUCKET_ID=573409
DDC_CLUSTER_ID=0x825c4b2352850de9986d9d28568db6f0c023a1e3

# Activity SDK Configuration  
ACTIVITY_ENDPOINT=https://ai-event.stage.cere.io
ACTIVITY_KEYRING_URI=your-twelve-word-mnemonic-phrase-here
APP_ID=2621
APP_PUBLIC_KEY=0x367bd16b9fa69acc8d769add1652799683d68273eae126d2d4bae4d7b8e75bb6
DATA_SERVICE_PUBLIC_KEY=0x8225bda7fc68c17407e933ba8a44a3cbb31ce933ef002fb60337ff63c952b932
```

## Implementation Patterns

### 1. Simple File Storage (DDC Client)

Perfect for basic file upload/download operations:

```typescript
// services/fileStorage.ts
import { DdcClient, File, TESTNET } from '@cere-ddc-sdk/ddc-client';
import * as fs from 'fs';

export class FileStorageService {
  private client: DdcClient;

  async initialize() {
    this.client = await DdcClient.create(
      process.env.DDC_SIGNER!,
      TESTNET
    );
  }

  async uploadFile(filePath: string, bucketId: bigint): Promise<string> {
    const fileStats = fs.statSync(filePath);
    const fileStream = fs.createReadStream(filePath);
    const file = new File(fileStream, { size: fileStats.size });

    const { cid } = await this.client.store(bucketId, file);
    return cid;
  }

  async downloadFile(bucketId: bigint, cid: string): Promise<ArrayBuffer> {
    const uri = new FileUri(bucketId, cid);
    const response = await this.client.read(uri);
    return response.arrayBuffer();
  }

  async createBucket(clusterId: string): Promise<bigint> {
    return await this.client.createBucket(clusterId, { isPublic: true });
  }
}

// Usage
const storage = new FileStorageService();
await storage.initialize();

const bucketId = BigInt(573409);
const cid = await storage.uploadFile('./document.pdf', bucketId);
console.log(`File uploaded with CID: ${cid}`);

const fileData = await storage.downloadFile(bucketId, cid);
fs.writeFileSync('./downloaded-document.pdf', Buffer.from(fileData));
```

### 2. Unified Data Ingestion (Unified SDK)

Ideal for complex data workflows, especially Telegram applications:

```typescript
// services/dataIngestion.ts
import { UnifiedSDK } from '@cere-ddc-sdk/unified';
import { ddcConfig, activityConfig } from '../config/ddc.config';

export class DataIngestionService {
  private sdk: UnifiedSDK;

  async initialize() {
    this.sdk = new UnifiedSDK({
      ddcConfig,
      activityConfig,
      processing: {
        enableBatching: true,
        defaultBatchSize: 50,
        defaultBatchTimeout: 5000,
        maxRetries: 3,
        retryDelay: 1000,
      },
      logging: {
        level: 'info',
        enableMetrics: true,
      },
    });

    await this.sdk.initialize();
  }

  // Telegram Event Ingestion
  async trackTelegramEvent(eventData: {
    eventType: string;
    userId: string;
    chatId?: string;
    eventData: any;
  }) {
    const response = await this.sdk.writeData({
      eventType: eventData.eventType,
      userId: eventData.userId,
      chatId: eventData.chatId,
      eventData: eventData.eventData,
      timestamp: new Date(),
    });

    return {
      transactionId: response.transactionId,
      cid: response.ddcResult?.cid,
    };
  }

  // Telegram Message Storage
  async storeTelegramMessage(messageData: {
    messageId: string;
    chatId: string;
    userId: string;
    messageText?: string;
    messageType: 'text' | 'photo' | 'video' | 'document';
  }) {
    const response = await this.sdk.writeData({
      messageId: messageData.messageId,
      chatId: messageData.chatId,
      userId: messageData.userId,
      messageText: messageData.messageText,
      messageType: messageData.messageType,
      timestamp: new Date(),
    });

    return {
      transactionId: response.transactionId,
      cid: response.ddcResult?.cid,
    };
  }

  // Custom Data with Specific Options
  async storeCustomData(data: any, options?: {
    priority?: 'low' | 'normal' | 'high';
    encryption?: boolean;
    ttl?: number;
  }) {
    const response = await this.sdk.writeData(data, {
      priority: options?.priority || 'normal',
      encryption: options?.encryption || false,
      ttl: options?.ttl,
      metadata: {
        processing: {
          dataCloudWriteMode: 'direct',
          indexWriteMode: 'realtime',
        },
      },
    });

    return response;
  }

  async getStatus() {
    return this.sdk.getStatus();
  }

  async cleanup() {
    await this.sdk.cleanup();
  }
}

// Usage Examples
const dataService = new DataIngestionService();
await dataService.initialize();

// Track quest completion
await dataService.trackTelegramEvent({
  eventType: 'quest_completed',
  userId: 'user123',
  chatId: 'group456',
  eventData: {
    questId: 'daily_checkin',
    points: 100,
    streak: 7,
  },
});

// Store message
await dataService.storeTelegramMessage({
  messageId: 'msg789',
  chatId: 'chat456',
  userId: 'user123',
  messageText: 'Hello from the mini app!',
  messageType: 'text',
});

// Store custom analytics data
await dataService.storeCustomData({
  analytics: {
    page: '/dashboard',
    action: 'view',
    duration: 45000,
  },
  userId: 'user123',
}, {
  priority: 'high',
  encryption: true,
});
```

### 3. Blockchain Operations

For direct blockchain interaction:

```typescript
// services/blockchain.ts
import { Blockchain, UriSigner } from '@cere-ddc-sdk/blockchain';

export class BlockchainService {
  private blockchain: Blockchain;
  private signer: UriSigner;

  async initialize() {
    this.signer = new UriSigner(process.env.DDC_SIGNER!);
    this.blockchain = await Blockchain.connect({
      wsEndpoint: 'wss://rpc.testnet.cere.network/ws',
    });
  }

  async createBucket(clusterId: string, isPublic: boolean = true): Promise<bigint> {
    const tx = this.blockchain.ddcCustomers.createBucket(clusterId, { isPublic });
    const { events } = await this.blockchain.send(tx, { account: this.signer });
    const [bucketId] = this.blockchain.ddcCustomers.extractCreatedBucketIds(events);
    return bucketId;
  }

  async makeDeposit(amount: bigint): Promise<void> {
    const tx = this.blockchain.ddcCustomers.deposit(amount);
    await this.blockchain.send(tx, { account: this.signer });
  }

  async getBucketInfo(bucketId: bigint) {
    return await this.blockchain.ddcCustomers.getBucket(bucketId);
  }

  async getBalance(): Promise<bigint> {
    return await this.blockchain.ddcCustomers.getBalance(this.signer.address);
  }
}

// Usage
const blockchain = new BlockchainService();
await blockchain.initialize();

// Make deposit
const deposit = 100n * 10n ** 18n; // 100 CERE tokens
await blockchain.makeDeposit(deposit);

// Create bucket
const clusterId = '0x825c4b2352850de9986d9d28568db6f0c023a1e3';
const bucketId = await blockchain.createBucket(clusterId, true);
console.log(`Created bucket with ID: ${bucketId}`);
```

## Common Use Cases

### Use Case 1: Telegram Bot with Quest System

```typescript
// bot/questBot.ts
import { Telegraf } from 'telegraf';
import { DataIngestionService } from '../services/dataIngestion';

export class QuestBot {
  private bot: Telegraf;
  private dataService: DataIngestionService;

  constructor(token: string) {
    this.bot = new Telegraf(token);
    this.dataService = new DataIngestionService();
  }

  async initialize() {
    await this.dataService.initialize();
    this.setupCommands();
    this.bot.launch();
  }

  private setupCommands() {
    // Daily check-in command
    this.bot.command('checkin', async (ctx) => {
      const userId = ctx.from.id.toString();
      const chatId = ctx.chat.id.toString();

      try {
        // Track the check-in event
        await this.dataService.trackTelegramEvent({
          eventType: 'daily_checkin',
          userId,
          chatId,
          eventData: {
            timestamp: new Date(),
            points: 10,
          },
        });

        ctx.reply('✅ Daily check-in completed! You earned 10 points.');
      } catch (error) {
        console.error('Check-in failed:', error);
        ctx.reply('❌ Check-in failed. Please try again.');
      }
    });

    // Quest completion
    this.bot.command('complete_quest', async (ctx) => {
      const userId = ctx.from.id.toString();
      const questId = ctx.message.text.split(' ')[1];

      if (!questId) {
        ctx.reply('Please specify a quest ID: /complete_quest QUEST_ID');
        return;
      }

      await this.dataService.trackTelegramEvent({
        eventType: 'quest_completed',
        userId,
        eventData: {
          questId,
          completedAt: new Date(),
          points: 50,
        },
      });

      ctx.reply(`🎉 Quest ${questId} completed! You earned 50 points.`);
    });

    // Store important messages
    this.bot.on('text', async (ctx) => {
      if (ctx.message.text.startsWith('/')) return; // Skip commands

      await this.dataService.storeTelegramMessage({
        messageId: ctx.message.message_id.toString(),
        chatId: ctx.chat.id.toString(),
        userId: ctx.from.id.toString(),
        messageText: ctx.message.text,
        messageType: 'text',
      });
    });
  }
}

// Usage
const bot = new QuestBot(process.env.BOT_TOKEN!);
bot.initialize();
```

### Use Case 2: File Upload API

```typescript
// api/fileUpload.ts
import express from 'express';
import multer from 'multer';
import { FileStorageService } from '../services/fileStorage';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });
const fileService = new FileStorageService();

// Initialize service
fileService.initialize();

// Upload endpoint
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const bucketId = BigInt(req.body.bucketId || process.env.DEFAULT_BUCKET_ID);
    const cid = await fileService.uploadFile(req.file.path, bucketId);

    // Clean up temporary file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      cid,
      downloadUrl: `https://storage.testnet.cere.network/${bucketId}/${cid}`,
    });
  } catch (error) {
    console.error('Upload failed:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Download endpoint
router.get('/download/:bucketId/:cid', async (req, res) => {
  try {
    const { bucketId, cid } = req.params;
    const fileData = await fileService.downloadFile(BigInt(bucketId), cid);

    res.setHeader('Content-Type', 'application/octet-stream');
    res.send(Buffer.from(fileData));
  } catch (error) {
    console.error('Download failed:', error);
    res.status(500).json({ error: 'Download failed' });
  }
});

export default router;
```

### Use Case 3: Analytics Dashboard

```typescript
// analytics/dashboard.ts
import { DataIngestionService } from '../services/dataIngestion';

export class AnalyticsDashboard {
  private dataService: DataIngestionService;

  constructor() {
    this.dataService = new DataIngestionService();
  }

  async initialize() {
    await this.dataService.initialize();
  }

  // Track page views
  async trackPageView(data: {
    userId: string;
    page: string;
    referrer?: string;
    userAgent?: string;
  }) {
    await this.dataService.storeCustomData({
      eventType: 'page_view',
      userId: data.userId,
      page: data.page,
      referrer: data.referrer,
      userAgent: data.userAgent,
      timestamp: new Date(),
    }, {
      priority: 'normal',
      encryption: false,
    });
  }

  // Track user actions
  async trackUserAction(data: {
    userId: string;
    action: string;
    target: string;
    value?: any;
  }) {
    await this.dataService.storeCustomData({
      eventType: 'user_action',
      userId: data.userId,
      action: data.action,
      target: data.target,
      value: data.value,
      timestamp: new Date(),
    }, {
      priority: 'high',
      encryption: true,
    });
  }

  // Batch analytics events
  async trackBatch(events: any[]) {
    const promises = events.map(event => 
      this.dataService.storeCustomData(event, {
        priority: 'low',
      })
    );

    await Promise.all(promises);
  }
}

// Usage in Express middleware
const analytics = new AnalyticsDashboard();
analytics.initialize();

export const trackingMiddleware = (req, res, next) => {
  // Track page view
  analytics.trackPageView({
    userId: req.user?.id || 'anonymous',
    page: req.path,
    referrer: req.get('Referrer'),
    userAgent: req.get('User-Agent'),
  });

  next();
};
```

## Error Handling & Best Practices

### Error Handling

```typescript
// utils/errorHandler.ts
import { UnifiedSDKError } from '@cere-ddc-sdk/unified';

export class ErrorHandler {
  static handle(error: unknown): {
    code: string;
    message: string;
    retry: boolean;
  } {
    if (error instanceof UnifiedSDKError) {
      return {
        code: error.code,
        message: error.message,
        retry: this.shouldRetry(error.code),
      };
    }

    if (error instanceof Error) {
      return {
        code: 'UNKNOWN_ERROR',
        message: error.message,
        retry: false,
      };
    }

    return {
      code: 'UNEXPECTED_ERROR',
      message: 'An unexpected error occurred',
      retry: false,
    };
  }

  private static shouldRetry(code: string): boolean {
    const retryableCodes = [
      'NETWORK_ERROR',
      'SERVICE_UNAVAILABLE',
      'TIMEOUT_ERROR',
    ];
    return retryableCodes.includes(code);
  }
}

// Retry wrapper
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const errorInfo = ErrorHandler.handle(error);

      if (!errorInfo.retry || attempt === maxRetries - 1) {
        throw error;
      }

      await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)));
    }
  }

  throw lastError;
}
```

### Configuration Management

```typescript
// config/index.ts
import { z } from 'zod';

const ConfigSchema = z.object({
  ddc: z.object({
    signer: z.string().min(1),
    bucketId: z.string().transform(val => BigInt(val)),
    clusterId: z.string().optional(),
    network: z.enum(['mainnet', 'testnet']),
  }),
  activity: z.object({
    endpoint: z.string().url(),
    keyringUri: z.string().min(1),
    appId: z.string().min(1),
    appPubKey: z.string().min(1),
    dataServicePubKey: z.string().min(1),
  }).optional(),
  processing: z.object({
    enableBatching: z.boolean().default(true),
    defaultBatchSize: z.number().min(1).default(50),
    defaultBatchTimeout: z.number().min(100).default(5000),
    maxRetries: z.number().min(1).default(3),
    retryDelay: z.number().min(100).default(1000),
  }).optional(),
});

export function loadConfig() {
  const config = {
    ddc: {
      signer: process.env.DDC_SIGNER!,
      bucketId: process.env.DDC_BUCKET_ID!,
      clusterId: process.env.DDC_CLUSTER_ID,
      network: process.env.DDC_NETWORK || 'testnet',
    },
    activity: process.env.ACTIVITY_ENDPOINT ? {
      endpoint: process.env.ACTIVITY_ENDPOINT!,
      keyringUri: process.env.ACTIVITY_KEYRING_URI!,
      appId: process.env.APP_ID!,
      appPubKey: process.env.APP_PUBLIC_KEY!,
      dataServicePubKey: process.env.DATA_SERVICE_PUBLIC_KEY!,
    } : undefined,
  };

  return ConfigSchema.parse(config);
}
```

### Performance Optimization

```typescript
// utils/performance.ts
export class PerformanceOptimizer {
  private cache = new Map<string, any>();
  private batchQueue = new Map<string, any[]>();
  private batchTimers = new Map<string, NodeJS.Timeout>();

  // Caching wrapper
  async cached<T>(
    key: string,
    operation: () => Promise<T>,
    ttl: number = 300000 // 5 minutes
  ): Promise<T> {
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    const value = await operation();
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl,
    });

    return value;
  }

  // Batching wrapper
  async batched<T>(
    batchKey: string,
    item: T,
    processor: (items: T[]) => Promise<void>,
    batchSize: number = 10,
    timeout: number = 1000
  ): Promise<void> {
    let queue = this.batchQueue.get(batchKey);
    if (!queue) {
      queue = [];
      this.batchQueue.set(batchKey, queue);
    }

    queue.push(item);

    if (queue.length >= batchSize) {
      await this.flushBatch(batchKey, processor);
    } else if (!this.batchTimers.has(batchKey)) {
      const timer = setTimeout(() => {
        this.flushBatch(batchKey, processor);
      }, timeout);
      this.batchTimers.set(batchKey, timer);
    }
  }

  private async flushBatch<T>(
    batchKey: string,
    processor: (items: T[]) => Promise<void>
  ): Promise<void> {
    const queue = this.batchQueue.get(batchKey);
    const timer = this.batchTimers.get(batchKey);

    if (timer) {
      clearTimeout(timer);
      this.batchTimers.delete(batchKey);
    }

    if (queue && queue.length > 0) {
      const items = queue.splice(0);
      await processor(items);
    }
  }
}
```

## Deployment Considerations

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY dist/ ./dist/
COPY config/ ./config/

# Set environment
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "dist/index.js"]
```

### Environment Configuration

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DDC_SIGNER=${DDC_SIGNER}
      - DDC_BUCKET_ID=${DDC_BUCKET_ID}
      - DDC_CLUSTER_ID=${DDC_CLUSTER_ID}
      - DDC_NETWORK=testnet
      - ACTIVITY_ENDPOINT=${ACTIVITY_ENDPOINT}
      - ACTIVITY_KEYRING_URI=${ACTIVITY_KEYRING_URI}
      - APP_ID=${APP_ID}
      - APP_PUBLIC_KEY=${APP_PUBLIC_KEY}
      - DATA_SERVICE_PUBLIC_KEY=${DATA_SERVICE_PUBLIC_KEY}
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped

  # Optional: Redis for caching
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  redis_data:
```

### Monitoring Setup

```typescript
// monitoring/metrics.ts
import { UnifiedSDK } from '@cere-ddc-sdk/unified';

export class MonitoringService {
  private sdk: UnifiedSDK;
  private metricsInterval: NodeJS.Timeout;

  constructor(sdk: UnifiedSDK) {
    this.sdk = sdk;
  }

  startMonitoring(intervalMs: number = 60000) {
    this.metricsInterval = setInterval(() => {
      this.collectMetrics();
    }, intervalMs);
  }

  stopMonitoring() {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
  }

  private async collectMetrics() {
    try {
      const status = this.sdk.getStatus();
      
      // Log metrics
      console.log('SDK Status:', {
        initialized: status.initialized,
        ddcAvailable: status.ddcAvailable,
        activitySdkAvailable: status.activitySdkAvailable,
        timestamp: new Date().toISOString(),
      });

      // Send to monitoring service (e.g., Prometheus, DataDog)
      // await this.sendToMonitoring(status);
    } catch (error) {
      console.error('Metrics collection failed:', error);
    }
  }
}
```

This implementation guide provides a comprehensive foundation for integrating the Cere DDC SDK into real-world applications, with practical examples for common use cases and production-ready patterns. 