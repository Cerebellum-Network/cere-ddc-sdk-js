# Unified Data Ingestion SDK

## Overview

The Unified Data Ingestion SDK is a comprehensive solution that provides a **single entry point** for data ingestion across multiple Cere ecosystem backends. It intelligently routes data to the appropriate storage and indexing systems based on configurable metadata, with specialized support for Telegram use cases.

## Key Features

- **🎯 Single Entry Point**: One SDK to rule them all - eliminates complexity of managing multiple SDKs
- **🧠 Intelligent Routing**: Metadata-driven routing to DDC Client and Activity SDK
- **📱 Telegram Optimized**: Built-in support for Telegram events, messages, and mini-app interactions
- **🔄 Fallback Mechanisms**: Graceful degradation when services are unavailable
- **⚡ Performance Optimized**: Batching, parallel execution, and resource management
- **🛡️ Production Ready**: Comprehensive error handling, validation, and observability

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Unified SDK (Entry Point)                │
├─────────────────────────────────────────────────────────────┤
│  • writeTelegramEvent()   • writeTelegramMessage()          │
│  • writeData()            • getStatus()                     │
└─────────────────┬───────────────────────────┬───────────────┘
                  │                           │
        ┌─────────▼──────────┐      ┌─────────▼──────────┐
        │  Rules Interpreter │      │    Dispatcher      │
        │                    │      │                    │
        │ • Metadata         │      │ • Route Planning   │
        │   Validation       │      │ • Action Creation  │
        │ • Rules Extraction │      │ • Priority Mgmt    │
        │ • Optimization     │      │ • Execution Mode   │
        └─────────┬──────────┘      └─────────┬──────────┘
                  │                           │
                  └─────────┬───────────────────┘
                            │
                  ┌─────────▼──────────┐
                  │    Orchestrator    │
                  │                    │
                  │ • Execution Engine │
                  │ • Resource Mgmt    │
                  │ • Error Handling   │
                  │ • Fallback Logic   │
                  └─────────┬──────────┘
                            │
           ┌────────────────┼────────────────┐
           │                │                │
    ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
    │ DDC Client  │  │Activity SDK │  │ HTTP APIs   │
    │             │  │             │  │             │
    │ • Data      │  │ • Events    │  │ • Webhooks  │
    │   Storage   │  │ • Analytics │  │ • External  │
    │ • Files     │  │ • Indexing  │  │   Services  │
    └─────────────┘  └─────────────┘  └─────────────┘
```

## Core Components

| Component            | Purpose            | Responsibilities                                         |
| -------------------- | ------------------ | -------------------------------------------------------- |
| **UnifiedSDK**       | Main entry point   | API surface, initialization, high-level operations       |
| **RulesInterpreter** | Metadata processor | Validation, rule extraction, optimization                |
| **Dispatcher**       | Route planner      | Action creation, priority management, execution planning |
| **Orchestrator**     | Execution engine   | Resource management, error handling, fallback logic      |

## Design Philosophy

### 1. **Metadata-Driven Architecture**

Instead of hardcoded routing logic, the SDK uses flexible metadata to determine:

- Where data should be stored (DDC vs external)
- How data should be indexed (realtime vs batch vs skip)
- Processing priorities and encryption requirements
- Batching and performance optimizations

### 2. **Telegram-First Design**

While the SDK is generic, it's optimized for Telegram use cases:

- Specialized data types for Telegram events and messages
- Intelligent routing for different Telegram data types
- Built-in support for mini-app interactions and user analytics

### 3. **Graceful Degradation**

The system is designed to handle failures gracefully:

- If Activity SDK fails, fall back to DDC storage
- If DDC is unavailable, queue for later processing
- Partial success scenarios are handled intelligently

### 4. **Performance & Scalability**

- Batching for high-throughput scenarios
- Parallel execution when possible
- Resource pooling and connection management
- Intelligent payload size optimization

## Quick Start

```typescript
import { UnifiedSDK } from '@cere-ddc-sdk/unified';

// Initialize the SDK
const sdk = new UnifiedSDK({
  ddcConfig: {
    signer: '//Alice',
    bucketId: BigInt(12345),
    network: 'testnet',
  },
  activityConfig: {
    keyringUri: '//Alice',
    appId: 'telegram-bot',
    endpoint: 'https://api.stats.cere.network',
    appPubKey: 'your-app-key',
    dataServicePubKey: 'service-key',
  },
});

await sdk.initialize();

// Write Telegram event
await sdk.writeTelegramEvent({
  eventType: 'quest_completed',
  userId: 'user123',
  chatId: 'chat456',
  eventData: { questId: 'daily_checkin', points: 100 },
  timestamp: new Date(),
});

// Write Telegram message
await sdk.writeTelegramMessage({
  messageId: 'msg123',
  chatId: 'chat456',
  userId: 'user789',
  messageText: 'Hello from mini-app!',
  messageType: 'text',
  timestamp: new Date(),
});
```

## Documentation Structure

- [**Architecture Guide**](./architecture.md) - Detailed system architecture and design patterns
- [**API Reference**](./api-reference.md) - Complete API documentation
- [**Component Guide**](./components.md) - Deep dive into each component
- [**Telegram Use Cases**](./telegram-guide.md) - Telegram-specific documentation and examples
- [**Configuration Guide**](./configuration.md) - Configuration options and best practices
- [**Design Decisions**](./design-decisions.md) - Rationale behind key architectural choices
- [**Testing Guide**](./testing.md) - Testing approach and guidelines
- [**Migration Guide**](./migration.md) - Migrating from individual SDKs
- [**Troubleshooting**](./troubleshooting.md) - Common issues and solutions

## Key Benefits

### For Developers

- **Simplified Integration**: One SDK instead of multiple
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Flexible Configuration**: Metadata-driven behavior without code changes
- **Rich Documentation**: Comprehensive guides and examples

### For Applications

- **Better Performance**: Intelligent batching and parallel processing
- **Reliability**: Built-in fallback mechanisms and error handling
- **Observability**: Comprehensive logging and status reporting
- **Scalability**: Optimized for high-throughput scenarios

### For Telegram Bots

- **Native Support**: Built-in Telegram data types and routing
- **Analytics Ready**: Automatic event tracking and user analytics
- **Mini-App Optimized**: Specialized handling for mini-app interactions
- **Quest Integration**: Easy integration with gamification systems

## Next Steps

1. **Read the [Architecture Guide](./architecture.md)** to understand the system design
2. **Explore [Telegram Use Cases](./telegram-guide.md)** for Telegram-specific examples
3. **Check the [API Reference](./api-reference.md)** for detailed method documentation
4. **Review [Configuration Guide](./configuration.md)** for production setup

---

> **Note**: This SDK is part of the Cere DDC SDK monorepo and follows the same versioning and release cycle.
