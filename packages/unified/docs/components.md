# Component Guide

## Overview

The Unified Data Ingestion SDK is built using a modular architecture with four main components, each with specific responsibilities. This guide provides detailed information about each component's role, implementation, and interactions.

## Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      UnifiedSDK                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              Public API Layer                           ││
│  │  • writeTelegramEvent()  • writeTelegramMessage()       ││
│  │  • writeData()           • getStatus()                  ││
│  │  • initialize()          • cleanup()                    ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Processing Layer                            │
│  ┌──────────────────────┐    ┌──────────────────────────────┐│
│  │  RulesInterpreter    │    │        Dispatcher            ││
│  │                      │    │                              ││
│  │ • Metadata           │    │ • Route Planning             ││
│  │   Validation         │    │ • Action Creation            ││
│  │ • Rule Extraction    │    │ • Priority Management       ││
│  │ • Business Logic     │    │ • Execution Mode Selection  ││
│  └──────────────────────┘    └──────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Execution Layer                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                  Orchestrator                           ││
│  │                                                         ││
│  │ • Action Execution    • Resource Management             ││
│  │ • Error Handling      • Fallback Logic                 ││
│  │ • Performance Mgmt    • Connection Pooling             ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                External Services                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ DDC Client  │  │Activity SDK │  │    HTTP APIs        │  │
│  │             │  │             │  │                     │  │
│  │ • Storage   │  │ • Events    │  │ • Webhooks          │  │
│  │ • Files     │  │ • Analytics │  │ • External Services │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. UnifiedSDK Component

### Purpose

The main entry point that provides the public API and coordinates between all other components.

### Responsibilities

- **API Surface**: Provides clean, type-safe methods for users
- **Lifecycle Management**: Handles initialization and cleanup
- **Component Coordination**: Orchestrates interactions between internal components
- **Error Handling**: Wraps and propagates errors in a user-friendly format
- **Configuration Management**: Validates and manages SDK configuration

### Key Methods

#### Constructor

```typescript
constructor(config: UnifiedSDKConfig) {
  this.config = this.validateConfig(config);
  this.rulesInterpreter = new RulesInterpreter(this.logger);
  this.dispatcher = new Dispatcher(this.logger);
  this.orchestrator = new Orchestrator(config, this.logger);
}
```

#### initialize()

```typescript
async initialize(): Promise<void> {
  try {
    await this.orchestrator.initialize();
    this.status.initialized = true;
    this.logger('info', 'UnifiedSDK initialized successfully');
  } catch (error) {
    this.logger('error', 'Failed to initialize UnifiedSDK', error);
    throw new UnifiedSDKError('Initialization failed', 'INIT_FAILED', 'UnifiedSDK', error);
  }
}
```

#### writeTelegramEvent()

```typescript
async writeTelegramEvent(
  eventData: TelegramEventData,
  options?: TelegramOptions
): Promise<UnifiedResponse> {
  // 1. Create Telegram-specific metadata
  const metadata = this.createTelegramEventMetadata(eventData, options);

  // 2. Delegate to generic writeData method
  return this.writeData(eventData, metadata);
}
```

### Configuration Handling

```typescript
private validateConfig(config: UnifiedSDKConfig): UnifiedSDKConfig {
  // Validate required DDC configuration
  if (!config.ddcConfig) {
    throw new UnifiedSDKError('DDC configuration is required', 'CONFIG_INVALID', 'UnifiedSDK');
  }

  // Apply defaults for optional configurations
  const defaults = {
    processing: {
      enableBatching: true,
      defaultBatchSize: 50,
      defaultBatchTimeout: 5000,
      maxRetries: 3,
      retryDelay: 1000
    },
    logging: {
      level: 'info',
      enableMetrics: true
    }
  };

  return { ...defaults, ...config };
}
```

---

## 2. RulesInterpreter Component

### Purpose

Validates metadata and extracts processing rules that drive routing decisions.

### Responsibilities

- **Metadata Validation**: Ensures all metadata conforms to schemas
- **Rule Extraction**: Converts metadata into actionable processing rules
- **Business Logic**: Applies business rules and constraints
- **Default Application**: Provides sensible defaults for optional fields
- **Optimization**: Optimizes processing based on payload characteristics

### Key Methods

#### validateMetadata()

```typescript
validateMetadata(metadata: Metadata): Metadata {
  try {
    // Use Zod schema for validation
    return MetadataSchema.parse(metadata);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(issue =>
        `${issue.path.join('.')}: ${issue.message}`
      ).join(', ');

      throw new ValidationError(
        `Metadata validation failed: ${issues}`,
        'metadata',
        metadata
      );
    }
    throw error;
  }
}
```

#### extractProcessingRules()

```typescript
extractProcessingRules(metadata: Metadata): ProcessingRules {
  const validated = this.validateMetadata(metadata);
  const processing = validated.processing;

  // Convert metadata to actionable rules
  const rules: ProcessingRules = {
    dataCloudAction: this.mapWriteMode(processing.dataCloudWriteMode),
    indexAction: this.mapIndexMode(processing.indexWriteMode),
    batchingRequired: this.determineBatching(processing),
    additionalParams: {
      priority: processing.priority || 'normal',
      encryption: processing.encryption || false,
      ttl: processing.ttl,
      batchOptions: processing.batchOptions
    }
  };

  // Apply business rules validation
  this.validateBusinessRules(rules);

  return rules;
}
```

### Business Rule Validation

```typescript
private validateBusinessRules(rules: ProcessingRules): void {
  // Rule: Must have at least one action
  if (rules.dataCloudAction === 'skip' && rules.indexAction === 'skip') {
    throw new ValidationError(
      'At least one action must be enabled (dataCloud or index)',
      'processing',
      rules
    );
  }

  // Rule: Batching only available for certain modes
  if (rules.batchingRequired && rules.dataCloudAction === 'viaIndex') {
    this.logger('warn', 'Batching not optimal for viaIndex mode, consider direct mode');
  }
}
```

### Optimization Logic

```typescript
private determineBatching(processing: ProcessingMetadata): boolean {
  // Auto-enable batching for high-volume scenarios
  if (processing.dataCloudWriteMode === 'batch') {
    return true;
  }

  // Consider payload size and priority
  if (processing.priority === 'low') {
    return true; // Low priority benefits from batching
  }

  return false;
}
```

---

## 3. Dispatcher Component

### Purpose

Creates execution plans by routing requests to appropriate backend services.

### Responsibilities

- **Route Planning**: Determines which services should handle the request
- **Action Creation**: Creates specific actions for each target service
- **Priority Management**: Assigns priorities and manages resource allocation
- **Execution Mode**: Decides between sequential, parallel, or batch execution
- **Performance Optimization**: Optimizes actions for best performance

### Key Methods

#### routeRequest()

```typescript
routeRequest(payload: any, rules: ProcessingRules): DispatchPlan {
  const actions: Action[] = [];

  // Create DDC actions
  if (rules.dataCloudAction !== 'skip') {
    actions.push(this.createDDCAction(payload, rules));
  }

  // Create Activity SDK actions
  if (rules.indexAction !== 'skip') {
    actions.push(this.createActivityAction(payload, rules));
  }

  // Create HTTP API actions (if needed)
  if (this.requiresWebhook(payload, rules)) {
    actions.push(this.createWebhookAction(payload, rules));
  }

  // Determine execution strategy
  const executionMode = this.determineExecutionMode(actions, rules);
  const rollbackRequired = this.requiresRollback(actions, rules);

  return {
    actions,
    executionMode,
    rollbackRequired
  };
}
```

#### createDDCAction()

```typescript
private createDDCAction(payload: any, rules: ProcessingRules): Action {
  // Determine storage method based on data type
  const method = this.determineStorageMethod(payload, rules);

  // Optimize payload for DDC storage
  const optimizedPayload = this.optimizeForDDC(payload, rules);

  return {
    target: 'ddc-client',
    method,
    payload: optimizedPayload,
    options: {
      encryption: rules.additionalParams.encryption,
      priority: rules.additionalParams.priority,
      ttl: rules.additionalParams.ttl
    },
    priority: rules.additionalParams.priority || 'normal'
  };
}
```

#### createActivityAction()

```typescript
private createActivityAction(payload: any, rules: ProcessingRules): Action {
  // Determine event type for Activity SDK
  const eventType = this.determineEventType(payload);

  // Format payload for Activity SDK
  const activityPayload = {
    type: eventType,
    data: payload,
    metadata: {
      source: 'unified-sdk',
      priority: rules.additionalParams.priority,
      timestamp: new Date()
    }
  };

  return {
    target: 'activity-sdk',
    method: 'sendEvent',
    payload: activityPayload,
    options: {
      writeToDataCloud: rules.dataCloudAction === 'viaIndex',
      realtime: rules.indexAction === 'realtime'
    },
    priority: rules.additionalParams.priority || 'normal'
  };
}
```

### Execution Mode Determination

```typescript
private determineExecutionMode(actions: Action[], rules: ProcessingRules): ExecutionMode {
  // Single action always sequential
  if (actions.length === 1) {
    return 'sequential';
  }

  // High priority gets parallel execution
  if (rules.additionalParams.priority === 'high') {
    return 'parallel';
  }

  // Batching requires sequential for consistency
  if (rules.batchingRequired) {
    return 'sequential';
  }

  // Default to parallel for better performance
  return 'parallel';
}
```

---

## 4. Orchestrator Component

### Purpose

Executes the dispatch plan and manages interactions with external services.

### Responsibilities

- **Action Execution**: Executes actions against external services
- **Resource Management**: Manages connections and resource pools
- **Error Handling**: Handles errors and implements fallback logic
- **Performance Monitoring**: Tracks execution metrics and performance
- **State Management**: Maintains state across action executions

### Key Methods

#### initialize()

```typescript
async initialize(): Promise<void> {
  try {
    // Initialize DDC Client (required)
    this.ddcClient = await DdcClient.create(this.config.ddcConfig.signer, {
      blockchain: this.getBlockchainUrl(),
      logLevel: this.config.logging?.level || 'info'
    });

    // Initialize Activity SDK (optional)
    if (this.config.activityConfig) {
      await this.initializeActivitySDK();
    }

    this.logger('info', 'Orchestrator initialized successfully');
  } catch (error) {
    this.logger('error', 'Orchestrator initialization failed', error);
    throw new UnifiedSDKError('Failed to initialize orchestrator', 'INIT_FAILED', 'Orchestrator', error);
  }
}
```

#### execute()

```typescript
async execute(plan: DispatchPlan): Promise<ExecutionResult> {
  const transactionId = this.generateTransactionId();
  const startTime = Date.now();

  this.logger('info', `Executing plan ${transactionId} with ${plan.actions.length} actions`);

  try {
    let results: ActionResult[];

    if (plan.executionMode === 'sequential') {
      results = await this.executeSequential(plan.actions);
    } else {
      results = await this.executeParallel(plan.actions);
    }

    const endTime = Date.now();
    const overallStatus = this.determineOverallStatus(results);

    return {
      results,
      overallStatus,
      totalExecutionTime: endTime - startTime,
      transactionId
    };
  } catch (error) {
    this.logger('error', `Plan execution failed for ${transactionId}`, error);
    throw new UnifiedSDKError('Plan execution failed', 'EXECUTION_FAILED', 'Orchestrator', error);
  }
}
```

### Execution Strategies

#### Sequential Execution

```typescript
private async executeSequential(actions: Action[]): Promise<ActionResult[]> {
  const results: ActionResult[] = [];

  for (const action of actions) {
    try {
      const startTime = Date.now();
      const response = await this.executeAction(action);
      const endTime = Date.now();

      results.push({
        target: action.target,
        success: true,
        response,
        executionTime: endTime - startTime
      });
    } catch (error) {
      const endTime = Date.now();

      results.push({
        target: action.target,
        success: false,
        error: error.message,
        executionTime: endTime - startTime
      });

      // Stop on first failure if rollback required
      if (plan.rollbackRequired) {
        await this.rollback(results);
        break;
      }
    }
  }

  return results;
}
```

#### Parallel Execution

```typescript
private async executeParallel(actions: Action[]): Promise<ActionResult[]> {
  const promises = actions.map(async (action) => {
    const startTime = Date.now();

    try {
      const response = await this.executeAction(action);
      const endTime = Date.now();

      return {
        target: action.target,
        success: true,
        response,
        executionTime: endTime - startTime
      };
    } catch (error) {
      const endTime = Date.now();

      return {
        target: action.target,
        success: false,
        error: error.message,
        executionTime: endTime - startTime
      };
    }
  });

  return Promise.all(promises);
}
```

### Fallback Mechanisms

```typescript
private async executeActivityAction(action: Action): Promise<any> {
  if (!this.activityDispatcher) {
    return {
      status: 'skipped',
      reason: 'Activity SDK not initialized'
    };
  }

  try {
    // Create and dispatch activity event
    const event = new ActivityEvent(
      action.payload.type,
      action.payload.data,
      { time: new Date() }
    );

    const success = await this.activityDispatcher.dispatchEvent(event);

    return {
      status: 'sent',
      eventId: event.id,
      success
    };
  } catch (error) {
    this.logger('warn', 'Activity SDK failed, attempting fallback', error);

    // Fallback to DDC if writeToDataCloud is enabled
    if (action.options.writeToDataCloud) {
      const fallbackResult = await this.executeDDCAction({
        target: 'ddc-client',
        method: 'store',
        payload: action.payload,
        options: { fallback: true },
        priority: action.priority
      });

      return {
        status: 'fallback_to_ddc',
        originalError: error.message,
        ddcResult: fallbackResult
      };
    }

    throw error;
  }
}
```

---

## Component Interactions

### Data Flow Between Components

1. **UnifiedSDK → RulesInterpreter**

   ```typescript
   const rules = this.rulesInterpreter.extractProcessingRules(metadata);
   ```

2. **UnifiedSDK → Dispatcher**

   ```typescript
   const plan = this.dispatcher.routeRequest(payload, rules);
   ```

3. **UnifiedSDK → Orchestrator**

   ```typescript
   const result = await this.orchestrator.execute(plan);
   ```

4. **Orchestrator → External Services**
   ```typescript
   const ddcResult = await this.ddcClient.store(dagNode);
   const activityResult = await this.activityDispatcher.dispatchEvent(event);
   ```

### Error Propagation

```typescript
// Error flows upward through the component stack
try {
  // Component-level error
  const result = await this.executeDDCAction(action);
} catch (componentError) {
  // Orchestrator handles and wraps
  throw new UnifiedSDKError('DDC action failed', 'SERVICE_ERROR', 'Orchestrator', componentError);
}
```

### Configuration Inheritance

```typescript
// Configuration flows downward
UnifiedSDK(config)
  → Orchestrator(config.ddcConfig, config.activityConfig)
    → DDC Client(config.ddcConfig)
    → Activity SDK(config.activityConfig)
```

This component guide provides a comprehensive understanding of how each component contributes to the overall architecture and functionality of the Unified Data Ingestion SDK.
