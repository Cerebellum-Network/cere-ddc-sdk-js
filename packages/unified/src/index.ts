// Main SDK class
export { UnifiedSDK } from './UnifiedSDK';

// Core components (for advanced usage)
export { RulesInterpreter } from './RulesInterpreter';
export { Dispatcher } from './Dispatcher';
export { Orchestrator } from './Orchestrator';

// Types and interfaces
export type {
  UnifiedSDKConfig,
  UnifiedMetadata,
  UnifiedResponse,
  ProcessingMetadata,
  DataCloudWriteMode,
  IndexWriteMode,
  TelegramEventData,
  TelegramMessageData,
} from './types';

export type { ProcessingRules } from './RulesInterpreter';
export type { Action, DispatchPlan } from './Dispatcher';
export type { ExecutionResult, OrchestrationResult } from './Orchestrator';

// Error classes
export { UnifiedSDKError, ValidationError } from './types';

// Schema exports for validation
export { DataCloudWriteModeSchema, IndexWriteModeSchema, ProcessingMetadataSchema, MetadataSchema } from './types';
