import { z } from 'zod';
import { UnifiedMetadata, ProcessingMetadata, MetadataSchema, ValidationError, UnifiedSDKError } from './types';

/**
 * Rules Interpreter Component
 *
 * Acts as the business logic engine that interprets client intentions
 * expressed through metadata and converts them into actionable processing rules.
 *
 * Based on architecture document: diagrams/0_1_component_descriptions.md
 */

export interface ProcessingRules {
  dataCloudAction: 'write_direct' | 'write_batch' | 'write_via_index' | 'skip';
  indexAction: 'write_realtime' | 'skip';
  batchingRequired: boolean;
  additionalParams: {
    priority: 'low' | 'normal' | 'high';
    ttl?: number;
    encryption: boolean;
    batchOptions?: {
      maxSize: number;
      maxWaitTime: number;
    };
  };
}

export class RulesInterpreter {
  private logger: (level: string, message: string, ...args: any[]) => void;

  constructor(logger?: (level: string, message: string, ...args: any[]) => void) {
    this.logger =
      logger || ((level, message, ...args) => console.log(`[RulesInterpreter:${level}] ${message}`, ...args));
  }

  /**
   * Validates metadata against the schema
   */
  validateMetadata(metadata: any): UnifiedMetadata {
    try {
      this.logger('debug', 'Validating metadata', metadata);
      const validated = MetadataSchema.parse(metadata);
      this.logger('debug', 'Metadata validation successful');
      return validated;
    } catch (error) {
      this.logger('error', 'Metadata validation failed', error);
      if (error instanceof z.ZodError) {
        throw new ValidationError('Invalid metadata provided', error);
      }
      throw new UnifiedSDKError(
        'Unexpected validation error',
        'VALIDATION_UNEXPECTED',
        'RulesInterpreter',
        false,
        error as Error,
      );
    }
  }

  /**
   * Extracts processing rules from validated metadata
   */
  extractProcessingRules(metadata: UnifiedMetadata): ProcessingRules {
    this.logger('debug', 'Extracting processing rules from metadata');

    const { processing } = metadata;

    // Map dataCloudWriteMode to action
    const dataCloudAction = this.mapDataCloudWriteMode(processing.dataCloudWriteMode);

    // Map indexWriteMode to action
    const indexAction = this.mapIndexWriteMode(processing.indexWriteMode);

    // Determine if batching is required
    const batchingRequired = this.determineBatchingRequirement(processing);

    // Extract additional parameters with defaults
    const additionalParams = this.extractAdditionalParams(processing);

    const rules: ProcessingRules = {
      dataCloudAction,
      indexAction,
      batchingRequired,
      additionalParams,
    };

    this.logger('debug', 'Processing rules extracted', rules);

    // Validate rule consistency
    this.validateRuleConsistency(rules);

    return rules;
  }

  /**
   * Maps dataCloudWriteMode to specific action
   */
  private mapDataCloudWriteMode(mode: string): ProcessingRules['dataCloudAction'] {
    switch (mode) {
      case 'direct':
        return 'write_direct';
      case 'batch':
        return 'write_batch';
      case 'viaIndex':
        return 'write_via_index';
      case 'skip':
        return 'skip';
      default:
        throw new UnifiedSDKError(`Invalid dataCloudWriteMode: ${mode}`, 'INVALID_DATA_CLOUD_MODE', 'RulesInterpreter');
    }
  }

  /**
   * Maps indexWriteMode to specific action
   */
  private mapIndexWriteMode(mode: string): ProcessingRules['indexAction'] {
    switch (mode) {
      case 'realtime':
        return 'write_realtime';
      case 'skip':
        return 'skip';
      default:
        throw new UnifiedSDKError(`Invalid indexWriteMode: ${mode}`, 'INVALID_INDEX_MODE', 'RulesInterpreter');
    }
  }

  /**
   * Determines if batching is required based on processing metadata
   */
  private determineBatchingRequirement(processing: ProcessingMetadata): boolean {
    // Batching is required if:
    // 1. dataCloudWriteMode is 'batch'
    // 2. OR if batchOptions are provided (indicates intent to batch)
    return processing.dataCloudWriteMode === 'batch' || !!processing.batchOptions;
  }

  /**
   * Extracts additional parameters with sensible defaults
   */
  private extractAdditionalParams(processing: ProcessingMetadata) {
    return {
      priority: processing.priority || 'normal',
      ttl: processing.ttl,
      encryption: processing.encryption || false,
      batchOptions: processing.batchOptions
        ? {
            maxSize: processing.batchOptions.maxSize || 1000,
            maxWaitTime: processing.batchOptions.maxWaitTime || 5000,
          }
        : undefined,
    };
  }

  /**
   * Validates that the extracted rules are consistent and feasible
   */
  private validateRuleConsistency(rules: ProcessingRules): void {
    // Check for impossible combinations
    if (rules.dataCloudAction === 'skip' && rules.indexAction === 'skip') {
      throw new UnifiedSDKError(
        'Both data cloud and index actions cannot be skip - data must go somewhere',
        'INVALID_RULE_COMBINATION',
        'RulesInterpreter',
      );
    }

    // Check batching consistency
    if (rules.batchingRequired && rules.dataCloudAction === 'skip') {
      this.logger('warn', 'Batching required but data cloud action is skip - batching will only affect index writes');
    }

    // Check encryption requirements
    if (rules.additionalParams.encryption && rules.dataCloudAction === 'skip') {
      this.logger('warn', 'Encryption specified but data cloud action is skip - encryption may not be applied');
    }
  }

  /**
   * Applies business rules and optimization hints
   */
  optimizeProcessingRules(rules: ProcessingRules, context?: any): ProcessingRules {
    this.logger('debug', 'Optimizing processing rules', { rules, context });

    // Clone rules to avoid mutation
    const optimizedRules = { ...rules };

    // Optimization 1: If writing via index, skip direct data cloud write to avoid duplication
    if (rules.dataCloudAction === 'write_via_index' && rules.indexAction === 'write_realtime') {
      this.logger('debug', 'Optimizing: Using index to handle data cloud writes');
    }

    // Optimization 2: Adjust batching based on payload size (if context provides size info)
    if (context?.payloadSize && rules.batchingRequired) {
      const payloadSize = context.payloadSize;
      if (payloadSize > 1024 * 1024) {
        // 1MB
        optimizedRules.additionalParams.batchOptions = {
          maxSize: Math.max(1, Math.floor(1000 / (payloadSize / (1024 * 1024)))),
          maxWaitTime: rules.additionalParams.batchOptions?.maxWaitTime || 5000,
        };
        this.logger('debug', 'Optimized batch size for large payload', optimizedRules.additionalParams.batchOptions);
      }
    }

    return optimizedRules;
  }
}
