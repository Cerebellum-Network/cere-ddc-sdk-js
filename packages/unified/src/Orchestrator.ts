import { DdcClient } from '@cere-ddc-sdk/ddc-client';
import { Action, DispatchPlan } from './Dispatcher';
import { UnifiedSDKError, UnifiedSDKConfig } from './types';

/**
 * Orchestrator Component
 *
 * Implements the orchestration pattern that manages complex workflows
 * across multiple systems while providing comprehensive error handling and recovery.
 *
 * Based on architecture document: diagrams/0_1_component_descriptions.md
 */

export interface ExecutionResult {
  target: string;
  success: boolean;
  response: any;
  error?: any;
  executionTime: number;
}

export interface OrchestrationResult {
  results: ExecutionResult[];
  overallStatus: 'success' | 'partial' | 'failed';
  totalExecutionTime: number;
  transactionId: string;
}

export class Orchestrator {
  private ddcClient?: DdcClient;
  private activityClient?: any; // Activity SDK EventDispatcher
  private logger: (level: string, message: string, ...args: any[]) => void;
  private config: UnifiedSDKConfig;

  constructor(config: UnifiedSDKConfig, logger?: (level: string, message: string, ...args: any[]) => void) {
    this.config = config;
    this.logger = logger || ((level, message, ...args) => console.log(`[Orchestrator:${level}] ${message}`, ...args));
  }

  /**
   * Initialize the orchestrator with backend clients
   */
  async initialize(): Promise<void> {
    this.logger('info', 'Initializing Orchestrator');

    try {
      // Initialize DDC Client with network preset
      const networkConfig =
        this.config.ddcConfig.network === 'devnet'
          ? 'wss://archive.devnet.cere.network/ws'
          : 'wss://rpc.testnet.cere.network/ws';

      this.ddcClient = await DdcClient.create(this.config.ddcConfig.signer, {
        blockchain: networkConfig,
        logLevel: this.config.logging.level === 'debug' ? 'debug' : 'silent',
      });

      // Initialize Activity SDK
      if (this.config.activityConfig) {
        this.logger('debug', 'Initializing Activity SDK...');
        try {
          // Import Activity SDK modules
          const { EventDispatcher } = await import('@cere-activity-sdk/events');
          // eslint-disable-next-line import/no-extraneous-dependencies
          const { UriSigner } = await import('@cere-activity-sdk/signers');
          // eslint-disable-next-line import/no-extraneous-dependencies
          const { NoOpCipher } = await import('@cere-activity-sdk/ciphers');

          // Create signer from the activity config with correct type for Event Service
          const signer = new UriSigner(this.config.activityConfig.keyringUri || '//Alice', {
            type: 'ed25519', // Use ed25519 signatures to match Event Service expectations
          });

          // Wait for signer to be ready (minimal fix for enterprise-level reliability)
          this.logger('debug', 'Waiting for UriSigner to be ready...');
          await new Promise((resolve) => setTimeout(resolve, 2000)); // Give signer time to initialize

          // Verify signer is ready before proceeding
          try {
            // Test signer readiness by accessing address (will throw if not ready)
            const testAddress = signer.address;
            this.logger('debug', 'UriSigner ready with address:', testAddress);
          } catch (signerError) {
            this.logger('warn', 'UriSigner not ready after wait, will retry with longer delay');
            await new Promise((resolve) => setTimeout(resolve, 3000));
          }

          // Create cipher (using NoOpCipher for now, can be enhanced later)
          const cipher = new NoOpCipher();

          // Initialize EventDispatcher
          this.activityClient = new EventDispatcher(signer, cipher, {
            baseUrl: this.config.activityConfig.endpoint || 'https://api.stats.cere.network',
            appId: this.config.activityConfig.appId || 'unified-sdk',
            connectionId: this.config.activityConfig.connectionId,
            sessionId: this.config.activityConfig.sessionId,
            appPubKey: this.config.activityConfig.appPubKey || 'default-app-key',
            dataServicePubKey: this.config.activityConfig.dataServicePubKey || 'default-service-key',
          });

          this.logger('debug', 'Activity SDK initialized successfully');
        } catch (error) {
          this.logger('warn', 'Failed to initialize Activity SDK - will operate in DDC-only mode', error);
          // Continue without Activity SDK - the dispatcher will handle missing activity actions gracefully
        }
      }

      this.logger('info', 'Orchestrator initialized successfully');
    } catch (error) {
      this.logger('error', 'Failed to initialize Orchestrator', error);
      throw new UnifiedSDKError(
        'Orchestrator initialization failed',
        'INITIALIZATION_ERROR',
        'Orchestrator',
        false,
        error as Error,
      );
    }
  }

  /**
   * Execute actions according to the dispatch plan
   */
  async execute(plan: DispatchPlan): Promise<OrchestrationResult> {
    const startTime = Date.now();
    const transactionId = this.generateTransactionId();

    this.logger('info', 'Executing dispatch plan', { transactionId, plan });

    let results: ExecutionResult[];

    try {
      if (plan.executionMode === 'parallel') {
        results = await this.executeParallel(plan.actions);
      } else {
        results = await this.executeSequential(plan.actions);
      }

      const totalExecutionTime = Date.now() - startTime;
      const overallStatus = this.determineOverallStatus(results);

      const orchestrationResult: OrchestrationResult = {
        results,
        overallStatus,
        totalExecutionTime,
        transactionId,
      };

      this.logger('info', 'Execution completed', orchestrationResult);

      return orchestrationResult;
    } catch (error) {
      this.logger('error', 'Execution failed', error);
      throw new UnifiedSDKError('Action execution failed', 'EXECUTION_ERROR', 'Orchestrator', true, error as Error);
    }
  }

  /**
   * Execute actions in parallel
   */
  private async executeParallel(actions: Action[]): Promise<ExecutionResult[]> {
    this.logger('debug', 'Executing actions in parallel', {
      count: actions.length,
    });

    const promises = actions.map((action) => this.executeAction(action));
    return Promise.all(promises);
  }

  /**
   * Execute actions sequentially
   */
  private async executeSequential(actions: Action[]): Promise<ExecutionResult[]> {
    this.logger('debug', 'Executing actions sequentially', {
      count: actions.length,
    });

    const results: ExecutionResult[] = [];

    for (const action of actions) {
      const result = await this.executeAction(action);
      results.push(result);

      // Stop execution if a critical action fails
      if (!result.success && this.isCriticalAction(action)) {
        this.logger('warn', 'Critical action failed, stopping execution', {
          action: action.target,
        });
        break;
      }
    }

    return results;
  }

  /**
   * Execute a single action
   */
  private async executeAction(action: Action): Promise<ExecutionResult> {
    const startTime = Date.now();

    this.logger('debug', 'Executing action', action);

    try {
      let response: any;

      switch (action.target) {
        case 'ddc-client':
          response = await this.executeDDCAction(action);
          break;

        case 'activity-sdk':
          response = await this.executeActivityAction(action);
          break;

        case 'http-api':
          response = await this.executeHTTPAction(action);
          break;

        default:
          throw new UnifiedSDKError(`Unknown action target: ${action.target}`, 'UNKNOWN_TARGET', 'Orchestrator');
      }

      const executionTime = Date.now() - startTime;

      return {
        target: action.target,
        success: true,
        response,
        executionTime,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;

      this.logger('error', 'Action execution failed', {
        action: action.target,
        error,
      });

      return {
        target: action.target,
        success: false,
        response: null,
        error: error instanceof Error ? error.message : String(error),
        executionTime,
      };
    }
  }

  /**
   * Execute DDC Client action
   */
  private async executeDDCAction(action: Action): Promise<any> {
    if (!this.ddcClient) {
      throw new UnifiedSDKError('DDC Client not initialized', 'CLIENT_NOT_INITIALIZED', 'Orchestrator');
    }

    switch (action.method) {
      case 'store': {
        let cid: any; // DDC client returns DagNodeUri or FileUri, not string

        // Determine storage format based on payload structure
        if (action.payload.data && typeof action.payload.data === 'string') {
          // Create DagNode for structured data
          const { DagNode } = await import('@cere-ddc-sdk/ddc-client');
          const dagNode = new DagNode(action.payload.data, action.payload.links || []);
          cid = await this.ddcClient.store(this.config.ddcConfig.bucketId, dagNode);
        } else if (Buffer.isBuffer(action.payload.data) || action.payload.data instanceof Uint8Array) {
          // Create File for binary data
          const { File } = await import('@cere-ddc-sdk/ddc-client');
          const file = new File(action.payload.data, action.payload.metadata || {});
          cid = await this.ddcClient.store(this.config.ddcConfig.bucketId, file);
        } else {
          // For any other data type, serialize to JSON and store as DagNode
          const { DagNode } = await import('@cere-ddc-sdk/ddc-client');
          const jsonData = JSON.stringify(action.payload.data || action.payload);
          const dagNode = new DagNode(jsonData, []);
          cid = await this.ddcClient.store(this.config.ddcConfig.bucketId, dagNode);
        }

        this.logger('debug', 'DDC storage completed', { cid, bucketId: this.config.ddcConfig.bucketId });

        // Return response with CID for conversation stream use cases
        return {
          cid: cid.toString(), // Convert DDC URI to string for consistency
          bucketId: this.config.ddcConfig.bucketId,
          status: 'stored',
          timestamp: new Date().toISOString(),
          size: this.estimateDataSize(action.payload),
        };
      }

      case 'storeBatch':
        // TODO: Implement batch storage when available
        throw new UnifiedSDKError('Batch storage not yet implemented', 'NOT_IMPLEMENTED', 'Orchestrator');

      default:
        throw new UnifiedSDKError(`Unknown DDC method: ${action.method}`, 'UNKNOWN_METHOD', 'Orchestrator');
    }
  }

  /**
   * Execute Activity SDK action
   */
  private async executeActivityAction(action: Action): Promise<any> {
    if (!this.activityClient) {
      this.logger('warn', 'Activity SDK not available - skipping activity action');
      // Return a mock response to maintain workflow continuity
      return {
        eventId: this.generateEventId(),
        status: 'skipped',
        reason: 'Activity SDK not initialized',
        timestamp: new Date().toISOString(),
      };
    }

    this.logger('debug', 'Executing Activity SDK action', action);

    try {
      switch (action.method) {
        case 'sendEvent': {
          // Use the real Activity SDK to send events
          const { ActivityEvent } = await import('@cere-activity-sdk/events');

          // Create ActivityEvent with the correct structure
          const activityEvent = new ActivityEvent(
            action.payload.type || 'telegram.event',
            action.payload.data || action.payload,
            {
              time: action.payload.timestamp ? new Date(action.payload.timestamp) : new Date(),
            },
          );

          // Send event using Activity SDK EventDispatcher
          const success = await this.activityClient.dispatchEvent(activityEvent);

          this.logger('debug', 'Activity SDK event dispatched', { eventId: activityEvent.id, success });

          return {
            eventId: activityEvent.id,
            status: success ? 'sent' : 'failed',
            timestamp: activityEvent.time.toISOString(),
            payload: activityEvent.payload,
            success,
          };
        }

        default:
          throw new UnifiedSDKError(`Unknown Activity SDK method: ${action.method}`, 'UNKNOWN_METHOD', 'Orchestrator');
      }
    } catch (error) {
      this.logger('error', 'Activity SDK action failed', error);

      // If writeToDataCloud is requested as fallback, we could retry with DDC
      if (action.options.writeToDataCloud) {
        this.logger('info', 'Attempting fallback to DDC storage');
        // Create a DDC action and execute it
        const fallbackAction: Action = {
          target: 'ddc-client',
          method: 'store',
          payload: {
            data: JSON.stringify(action.payload),
          },
          options: {},
          priority: action.priority,
        };

        const ddcResult = await this.executeDDCAction(fallbackAction);
        return {
          eventId: this.generateEventId(),
          status: 'fallback_to_ddc',
          ddcResult,
          originalError: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
        };
      }

      throw error;
    }
  }

  /**
   * Execute HTTP API action
   */
  private async executeHTTPAction(action: Action): Promise<any> {
    // Placeholder for HTTP API actions
    throw new UnifiedSDKError('HTTP API actions not yet implemented', 'NOT_IMPLEMENTED', 'Orchestrator');
  }

  /**
   * Determine overall status from individual results
   */
  private determineOverallStatus(results: ExecutionResult[]): 'success' | 'partial' | 'failed' {
    const successCount = results.filter((r) => r.success).length;
    const totalCount = results.length;

    if (successCount === totalCount) {
      return 'success';
    } else if (successCount > 0) {
      return 'partial';
    } else {
      return 'failed';
    }
  }

  /**
   * Check if an action is critical (failure should stop execution)
   */
  private isCriticalAction(action: Action): boolean {
    // For now, all actions are considered critical
    // This could be made configurable based on action type or priority
    return action.priority === 'high';
  }

  /**
   * Generate unique transaction ID
   */
  private generateTransactionId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Estimate data size for logging and metrics
   */
  private estimateDataSize(payload: any): number {
    try {
      return JSON.stringify(payload).length;
    } catch {
      return 0;
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    this.logger('info', 'Cleaning up Orchestrator resources');

    if (this.ddcClient) {
      await this.ddcClient.disconnect();
    }

    // Cleanup Activity SDK if needed
    if (this.activityClient) {
      // Most Activity SDK clients don't require explicit cleanup,
      // but if they do, it would go here
      this.logger('debug', 'Activity SDK cleanup completed');
    }
  }
}
