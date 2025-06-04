import { ProcessingRules } from './RulesInterpreter';
import { UnifiedSDKError } from './types';

/**
 * Dispatcher Component
 *
 * Implements the command pattern that translates abstract processing rules
 * into concrete actions for specific backend systems.
 *
 * Based on architecture document: diagrams/0_1_component_descriptions.md
 */

export interface Action {
  target: 'ddc-client' | 'activity-sdk' | 'http-api';
  method: string;
  payload: any;
  options: Record<string, any>;
  priority: 'low' | 'normal' | 'high';
}

export interface DispatchPlan {
  actions: Action[];
  executionMode: 'sequential' | 'parallel';
  rollbackRequired: boolean;
}

export class Dispatcher {
  private logger: (level: string, message: string, ...args: any[]) => void;

  constructor(logger?: (level: string, message: string, ...args: any[]) => void) {
    this.logger = logger || ((level, message, ...args) => console.log(`[Dispatcher:${level}] ${message}`, ...args));
  }

  /**
   * Routes request based on processing rules and creates execution plan
   */
  routeRequest(payload: any, rules: ProcessingRules): DispatchPlan {
    this.logger('debug', 'Routing request based on processing rules', { rules });

    const actions: Action[] = [];

    // Handle Data Cloud actions
    if (rules.dataCloudAction !== 'skip') {
      const dataCloudAction = this.createDataCloudAction(payload, rules);
      if (dataCloudAction) {
        actions.push(dataCloudAction);
      }
    }

    // Handle Index actions
    if (rules.indexAction !== 'skip') {
      const indexAction = this.createIndexAction(payload, rules);
      if (indexAction) {
        actions.push(indexAction);
      }
    }

    // Determine execution mode
    const executionMode = this.determineExecutionMode(rules);

    // Determine if rollback is required
    const rollbackRequired = actions.length > 1;

    const plan: DispatchPlan = {
      actions,
      executionMode,
      rollbackRequired,
    };

    this.logger('debug', 'Dispatch plan created', plan);

    return plan;
  }

  /**
   * Creates Data Cloud action based on processing rules
   */
  private createDataCloudAction(payload: any, rules: ProcessingRules): Action | null {
    switch (rules.dataCloudAction) {
      case 'write_direct':
        return {
          target: 'ddc-client',
          method: 'store',
          payload: this.transformPayloadForDDC(payload),
          options: {
            encryption: rules.additionalParams.encryption,
            ttl: rules.additionalParams.ttl,
          },
          priority: rules.additionalParams.priority,
        };

      case 'write_batch':
        return {
          target: 'ddc-client',
          method: 'storeBatch',
          payload: this.transformPayloadForDDC(payload),
          options: {
            batchOptions: rules.additionalParams.batchOptions,
            encryption: rules.additionalParams.encryption,
            ttl: rules.additionalParams.ttl,
          },
          priority: rules.additionalParams.priority,
        };

      case 'write_via_index':
        // Data will be written via index, so no direct DDC action needed
        this.logger('debug', 'Data Cloud write will be handled via index');
        return null;

      case 'skip':
        return null;

      default:
        throw new UnifiedSDKError(
          `Unknown data cloud action: ${rules.dataCloudAction}`,
          'UNKNOWN_DATA_CLOUD_ACTION',
          'Dispatcher',
        );
    }
  }

  /**
   * Creates Index action based on processing rules
   */
  private createIndexAction(payload: any, rules: ProcessingRules): Action | null {
    switch (rules.indexAction) {
      case 'write_realtime':
        return {
          target: 'activity-sdk',
          method: 'sendEvent',
          payload: this.transformPayloadForActivity(payload),
          options: {
            realtime: true,
            priority: rules.additionalParams.priority,
            writeToDataCloud: rules.dataCloudAction === 'write_via_index',
          },
          priority: rules.additionalParams.priority,
        };

      case 'skip':
        return null;

      default:
        throw new UnifiedSDKError(`Unknown index action: ${rules.indexAction}`, 'UNKNOWN_INDEX_ACTION', 'Dispatcher');
    }
  }

  /**
   * Determines execution mode based on processing rules
   */
  private determineExecutionMode(rules: ProcessingRules): 'sequential' | 'parallel' {
    // If writing via index, data cloud write is handled by index, so sequential
    if (rules.dataCloudAction === 'write_via_index') {
      return 'sequential';
    }

    // If both data cloud and index actions are present, execute in parallel
    if (rules.dataCloudAction !== 'skip' && rules.indexAction !== 'skip') {
      return 'parallel';
    }

    // Single action, execution mode doesn't matter
    return 'sequential';
  }

  /**
   * Transforms payload for DDC Client
   */
  private transformPayloadForDDC(payload: any): any {
    // For Telegram events, create a DagNode structure
    if (this.isTelegramEvent(payload)) {
      return {
        data: JSON.stringify(payload),
        links: [], // Could add links to previous events for event chains
      };
    }

    // For Telegram messages, create a File structure
    if (this.isTelegramMessage(payload)) {
      return {
        name: `telegram-message-${payload.messageId}`,
        data: JSON.stringify(payload),
        mimeType: 'application/json',
      };
    }

    // Default transformation
    return {
      data: JSON.stringify(payload),
      mimeType: 'application/json',
    };
  }

  /**
   * Transforms payload for Activity SDK
   */
  private transformPayloadForActivity(payload: any): any {
    // For Telegram events, create activity event structure
    if (this.isTelegramEvent(payload)) {
      return {
        type: 'telegram.event',
        userId: payload.userId,
        eventType: payload.eventType,
        data: payload.eventData,
        timestamp: payload.timestamp,
        metadata: {
          chatId: payload.chatId,
        },
      };
    }

    // For Telegram messages, create activity event structure
    if (this.isTelegramMessage(payload)) {
      return {
        type: 'telegram.message',
        userId: payload.userId,
        messageId: payload.messageId,
        data: {
          messageText: payload.messageText,
          messageType: payload.messageType,
        },
        timestamp: payload.timestamp,
        metadata: {
          chatId: payload.chatId,
        },
      };
    }

    // Default transformation
    return {
      type: 'generic.event',
      data: payload,
      timestamp: new Date(),
    };
  }

  /**
   * Type guard for Telegram events
   */
  private isTelegramEvent(payload: any): boolean {
    return (
      payload &&
      typeof payload.eventType === 'string' &&
      typeof payload.userId === 'string' &&
      payload.eventData !== undefined
    );
  }

  /**
   * Type guard for Telegram messages
   */
  private isTelegramMessage(payload: any): boolean {
    return (
      payload &&
      typeof payload.messageId === 'string' &&
      typeof payload.chatId === 'string' &&
      typeof payload.userId === 'string'
    );
  }
}
