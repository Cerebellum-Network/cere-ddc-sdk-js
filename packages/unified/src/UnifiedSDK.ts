import { RulesInterpreter } from './RulesInterpreter';
import { Dispatcher } from './Dispatcher';
import { Orchestrator } from './Orchestrator';
import {
  UnifiedSDKConfig,
  UnifiedMetadata,
  UnifiedResponse,
  UnifiedSDKError,
  TelegramEventData,
  TelegramMessageData,
  BullishCampaignEvent,
  NightingaleVideoStream,
  NightingaleKLVData,
  NightingaleTelemetry,
  NightingaleFrameAnalysis,
} from './types';

/**
 * Unified Data Ingestion SDK
 *
 * Single entry point for all data ingestion operations.
 * Provides a unified interface that hides complexity from clients
 * and automatically routes data to appropriate backend systems.
 *
 * Based on architecture document: diagrams/0_1_component_descriptions.md
 */

export class UnifiedSDK {
  private rulesInterpreter: RulesInterpreter;
  private dispatcher: Dispatcher;
  private orchestrator: Orchestrator;
  private logger: (level: string, message: string, ...args: any[]) => void;
  private config: UnifiedSDKConfig;
  private initialized: boolean = false;

  constructor(config: UnifiedSDKConfig) {
    this.config = config;
    this.logger = this.createLogger();

    // Initialize components
    this.rulesInterpreter = new RulesInterpreter(this.logger);
    this.dispatcher = new Dispatcher(this.logger);
    this.orchestrator = new Orchestrator(config, this.logger);

    this.logger('info', 'UnifiedSDK created', { config: this.sanitizeConfig(config) });
  }

  /**
   * Initialize the SDK and all its components
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      this.logger('warn', 'SDK already initialized');
      return;
    }

    this.logger('info', 'Initializing UnifiedSDK');

    try {
      await this.orchestrator.initialize();
      this.initialized = true;
      this.logger('info', 'UnifiedSDK initialized successfully');
    } catch (error) {
      this.logger('error', 'Failed to initialize UnifiedSDK', error);
      throw error;
    }
  }

  /**
   * Unified data ingestion method - automatically detects data type and routes appropriately
   * This is the single entry point for all data ingestion operations
   */
  async writeData(
    payload: any,
    options?: {
      priority?: 'low' | 'normal' | 'high';
      encryption?: boolean;
      writeMode?: 'realtime' | 'batch';
      metadata?: Partial<UnifiedMetadata>;
    },
  ): Promise<UnifiedResponse> {
    if (!this.initialized) {
      throw new UnifiedSDKError('SDK not initialized. Call initialize() first.', 'NOT_INITIALIZED', 'UnifiedSDK');
    }

    const startTime = Date.now();
    this.logger('info', 'Processing unified data ingestion request', {
      payloadType: typeof payload,
      dataType: this.detectDataType(payload),
      options,
    });

    try {
      // Step 1: Detect data type and create appropriate metadata
      const metadata = this.createMetadataForPayload(payload, options);

      // Step 2: Validate metadata
      const validatedMetadata = this.rulesInterpreter.validateMetadata(metadata);

      // Step 3: Extract processing rules
      const rules = this.rulesInterpreter.extractProcessingRules(validatedMetadata);

      // Step 4: Optimize rules based on context
      const optimizedRules = this.rulesInterpreter.optimizeProcessingRules(rules, {
        payloadSize: this.estimatePayloadSize(payload),
      });

      // Step 5: Create dispatch plan
      const plan = this.dispatcher.routeRequest(payload, optimizedRules);

      // Step 6: Execute the plan
      const orchestrationResult = await this.orchestrator.execute(plan);

      // Step 7: Transform to unified response
      const response = this.createUnifiedResponse(orchestrationResult, startTime);

      this.logger('info', 'Unified data ingestion completed', {
        transactionId: response.transactionId,
        status: response.status,
        dataType: this.detectDataType(payload),
        processingTime: response.metadata.processingTime,
        cloudHash: response.dataCloudHash,
        indexId: response.indexId,
      });

      return response;
    } catch (error) {
      this.logger('error', 'Unified data ingestion failed', error);

      if (error instanceof UnifiedSDKError) {
        throw error;
      }

      throw new UnifiedSDKError('Data ingestion failed', 'INGESTION_ERROR', 'UnifiedSDK', true, error as Error);
    }
  }

  /**
   * Get SDK status and health information
   */
  getStatus(): {
    initialized: boolean;
    config: any;
    components: {
      rulesInterpreter: boolean;
      dispatcher: boolean;
      orchestrator: boolean;
    };
  } {
    return {
      initialized: this.initialized,
      config: this.sanitizeConfig(this.config),
      components: {
        rulesInterpreter: !!this.rulesInterpreter,
        dispatcher: !!this.dispatcher,
        orchestrator: !!this.orchestrator,
      },
    };
  }

  /**
   * Cleanup resources and disconnect
   */
  async cleanup(): Promise<void> {
    this.logger('info', 'Cleaning up UnifiedSDK');

    if (this.orchestrator) {
      await this.orchestrator.cleanup();
    }

    this.initialized = false;
    this.logger('info', 'UnifiedSDK cleanup completed');
  }

  /**
   * Detect the type of data being ingested
   */
  private detectDataType(payload: any): string {
    if (!payload || typeof payload !== 'object') {
      return 'generic';
    }

    // ✅ PRESERVE: Existing Telegram Event Detection (CRITICAL - MUST NOT BREAK)
    if (payload.eventType && payload.userId && (payload.timestamp || payload.createdAt)) {
      return 'telegram_event';
    }

    // ✅ PRESERVE: Existing Telegram Message Detection (CRITICAL - MUST NOT BREAK)
    if (payload.messageId && payload.chatId && payload.userId && payload.messageType) {
      return 'telegram_message';
    }

    // 🔄 ADD: Bullish Campaign Event Detection (NEW - COPY TELEGRAM PATTERN)
    if (payload.eventType && payload.campaignId && payload.accountId) {
      const bullishEventTypes = ['SEGMENT_WATCHED', 'QUESTION_ANSWERED', 'JOIN_CAMPAIGN', 'CUSTOM_EVENTS'];
      if (bullishEventTypes.includes(payload.eventType)) {
        return 'bullish_campaign';
      }
    }

    // 🔄 ENHANCED: Nightingale-specific detection patterns (NEW)
    if (this.isNightingaleVideoStream(payload)) {
      return 'nightingale_video_stream';
    }

    if (this.isNightingaleKLVData(payload)) {
      return 'nightingale_klv_data';
    }

    if (this.isNightingaleTelemetry(payload)) {
      return 'nightingale_telemetry';
    }

    if (this.isNightingaleFrameAnalysis(payload)) {
      return 'nightingale_frame_analysis';
    }

    // ✅ PRESERVE: Existing Drone Telemetry Detection (CRITICAL - MUST NOT BREAK)
    if (payload.droneId && payload.telemetry && (payload.latitude || payload.longitude)) {
      return 'drone_telemetry';
    }

    // ✅ PRESERVE: Existing Drone Video Detection (CRITICAL - MUST NOT BREAK)
    if (payload.droneId && (payload.videoChunk || payload.frameData)) {
      return 'drone_video';
    }

    return 'generic';
  }

  /**
   * Nightingale-specific type guards for enhanced detection
   */
  private isNightingaleVideoStream(payload: any): boolean {
    return !!(
      payload.droneId &&
      payload.streamId &&
      payload.videoMetadata &&
      payload.chunks &&
      Array.isArray(payload.chunks) &&
      payload.chunks.length > 0 &&
      payload.chunks[0].chunkId
    );
  }

  private isNightingaleKLVData(payload: any): boolean {
    return !!(
      payload.droneId &&
      payload.streamId &&
      payload.klvMetadata &&
      payload.klvMetadata.platform &&
      payload.klvMetadata.sensor &&
      payload.klvMetadata.frameCenter &&
      typeof payload.pts === 'number'
    );
  }

  private isNightingaleTelemetry(payload: any): boolean {
    return !!(
      payload.droneId &&
      payload.telemetryData &&
      payload.coordinates &&
      payload.coordinates.latitude !== undefined &&
      payload.coordinates.longitude !== undefined &&
      payload.telemetryData.gps &&
      payload.telemetryData.orientation
    );
  }

  private isNightingaleFrameAnalysis(payload: any): boolean {
    return !!(
      payload.droneId &&
      payload.streamId &&
      payload.frameId &&
      payload.frameData &&
      payload.frameData.base64EncodedData &&
      payload.analysisResults &&
      payload.analysisResults.objects &&
      typeof payload.pts === 'number'
    );
  }

  /**
   * Create appropriate metadata based on payload type and options
   */
  private createMetadataForPayload(
    payload: any,
    options?: {
      priority?: 'low' | 'normal' | 'high';
      encryption?: boolean;
      writeMode?: 'realtime' | 'batch';
      metadata?: Partial<UnifiedMetadata>;
    },
  ): UnifiedMetadata {
    const dataType = this.detectDataType(payload);
    const baseMetadata: UnifiedMetadata = {
      processing: {
        dataCloudWriteMode: options?.writeMode === 'batch' ? 'batch' : 'viaIndex',
        indexWriteMode: 'realtime',
        priority: options?.priority || 'normal',
        encryption: options?.encryption || false,
      },
      userContext: {},
      traceId: this.generateTraceId(dataType, payload),
    };

    // Customize metadata based on detected data type
    switch (dataType) {
      case 'telegram_event':
        // eslint-disable-next-line no-case-declarations
        const eventData = payload as TelegramEventData;
        baseMetadata.userContext = {
          source: 'telegram',
          eventType: eventData.eventType,
          userId: eventData.userId,
        };
        break;

      case 'telegram_message':
        // eslint-disable-next-line no-case-declarations
        const messageData = payload as TelegramMessageData;
        baseMetadata.userContext = {
          source: 'telegram',
          messageType: messageData.messageType,
          userId: messageData.userId,
          chatId: messageData.chatId,
        };
        break;

      case 'bullish_campaign':
        // eslint-disable-next-line no-case-declarations
        const campaignData = payload as BullishCampaignEvent;
        baseMetadata.userContext = {
          source: 'bullish',
          eventType: campaignData.eventType,
          accountId: campaignData.accountId,
          campaignId: campaignData.campaignId,
        };
        // Set campaign-specific defaults
        baseMetadata.processing = {
          ...baseMetadata.processing,
          dataCloudWriteMode: 'direct', // CID tracking for quests
          indexWriteMode: 'realtime', // Real-time analytics
          priority: 'high', // Campaign events are important
        };
        break;

      case 'drone_telemetry':
        baseMetadata.userContext = {
          source: 'drone',
          dataType: 'telemetry',
          droneId: payload.droneId,
        };
        break;

      case 'drone_video':
        baseMetadata.userContext = {
          source: 'drone',
          dataType: 'video',
          droneId: payload.droneId,
        };
        break;

      case 'nightingale_video_stream':
        // eslint-disable-next-line no-case-declarations
        const videoStreamData = payload as NightingaleVideoStream;
        baseMetadata.userContext = {
          source: 'nightingale',
          dataType: 'video_stream',
          droneId: videoStreamData.droneId,
          streamId: videoStreamData.streamId,
          streamType: videoStreamData.videoMetadata.streamType,
        };
        // Set video stream-specific defaults
        baseMetadata.processing = {
          ...baseMetadata.processing,
          dataCloudWriteMode: 'direct', // Direct storage for video chunks
          indexWriteMode: 'skip', // Skip indexing for large video data
          priority: 'normal', // Normal priority for video chunks
        };
        break;

      case 'nightingale_klv_data':
        // eslint-disable-next-line no-case-declarations
        const klvData = payload as NightingaleKLVData;
        baseMetadata.userContext = {
          source: 'nightingale',
          dataType: 'klv_metadata',
          droneId: klvData.droneId,
          streamId: klvData.streamId,
          missionId: klvData.klvMetadata.missionId,
        };
        // Set KLV-specific defaults
        baseMetadata.processing = {
          ...baseMetadata.processing,
          dataCloudWriteMode: 'skip', // Skip data cloud for metadata
          indexWriteMode: 'realtime', // Real-time indexing for searchability
          priority: 'high', // High priority for metadata
        };
        break;

      case 'nightingale_telemetry':
        // eslint-disable-next-line no-case-declarations
        const telemetryData = payload as NightingaleTelemetry;
        baseMetadata.userContext = {
          source: 'nightingale',
          dataType: 'telemetry',
          droneId: telemetryData.droneId,
          missionId: telemetryData.missionId,
        };
        // Set telemetry-specific defaults
        baseMetadata.processing = {
          ...baseMetadata.processing,
          dataCloudWriteMode: 'direct', // Direct storage for compliance
          indexWriteMode: 'realtime', // Real-time indexing for monitoring
          priority: 'high', // High priority for telemetry
        };
        break;

      case 'nightingale_frame_analysis':
        // eslint-disable-next-line no-case-declarations
        const frameAnalysisData = payload as NightingaleFrameAnalysis;
        baseMetadata.userContext = {
          source: 'nightingale',
          dataType: 'frame_analysis',
          droneId: frameAnalysisData.droneId,
          streamId: frameAnalysisData.streamId,
          frameId: frameAnalysisData.frameId,
        };
        // Set frame analysis-specific defaults
        baseMetadata.processing = {
          ...baseMetadata.processing,
          dataCloudWriteMode: 'direct', // Direct storage for analysis results
          indexWriteMode: 'realtime', // Real-time indexing for searchability
          priority: 'normal', // Normal priority for analysis
        };
        break;

      default:
        baseMetadata.userContext = {
          source: 'generic',
          dataType: 'unknown',
        };
    }

    // Merge with any custom metadata provided
    if (options?.metadata) {
      return {
        ...baseMetadata,
        ...options.metadata,
        processing: {
          ...baseMetadata.processing,
          ...options.metadata.processing,
        },
        userContext: {
          ...baseMetadata.userContext,
          ...options.metadata.userContext,
        },
      };
    }

    return baseMetadata;
  }

  /**
   * Generate trace ID based on data type and payload
   */
  private generateTraceId(dataType: string, payload: any): string {
    const timestamp = Date.now();

    switch (dataType) {
      case 'telegram_event':
        return `telegram_event_${payload.userId}_${timestamp}`;
      case 'telegram_message':
        return `telegram_message_${payload.messageId}_${timestamp}`;
      case 'bullish_campaign':
        return `bullish_campaign_${payload.accountId}_${payload.campaignId}_${timestamp}`;
      case 'drone_telemetry':
        return `drone_telemetry_${payload.droneId}_${timestamp}`;
      case 'drone_video':
        return `drone_video_${payload.droneId}_${timestamp}`;
      case 'nightingale_video_stream':
        return `nightingale_video_${payload.droneId}_${payload.streamId}_${timestamp}`;
      case 'nightingale_klv_data':
        return `nightingale_klv_${payload.droneId}_${payload.streamId}_${timestamp}`;
      case 'nightingale_telemetry':
        return `nightingale_telemetry_${payload.droneId}_${timestamp}`;
      case 'nightingale_frame_analysis':
        return `nightingale_frame_${payload.droneId}_${payload.frameId}_${timestamp}`;
      default:
        return `generic_data_${timestamp}`;
    }
  }

  /**
   * Create logger function based on configuration
   */
  private createLogger(): (level: string, message: string, ...args: any[]) => void {
    const logLevel = this.config.logging.level;
    const enableMetrics = this.config.logging.enableMetrics;

    const logLevels = { debug: 0, info: 1, warn: 2, error: 3 };
    const currentLevel = logLevels[logLevel] || 1;

    return (level: string, message: string, ...args: any[]) => {
      const messageLevel = logLevels[level as keyof typeof logLevels] || 1;

      if (messageLevel >= currentLevel) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [UnifiedSDK:${level.toUpperCase()}] ${message}`;

        if (level === 'error') {
          console.error(logMessage, ...args);
        } else if (level === 'warn') {
          console.warn(logMessage, ...args);
        } else {
          console.log(logMessage, ...args);
        }

        // TODO: Send metrics if enabled
        if (enableMetrics) {
          // Implement metrics collection
        }
      }
    };
  }

  /**
   * Estimate payload size for optimization
   */
  private estimatePayloadSize(payload: any): number {
    try {
      return JSON.stringify(payload).length;
    } catch {
      return 0;
    }
  }

  /**
   * Create unified response from orchestration result
   */
  private createUnifiedResponse(orchestrationResult: any, startTime: number): UnifiedResponse {
    const processingTime = Date.now() - startTime;

    // Extract data cloud hash and index ID from results
    let dataCloudHash: string | undefined;
    let indexId: string | undefined;
    const errors: UnifiedResponse['errors'] = [];
    const actionsExecuted: string[] = [];

    for (const result of orchestrationResult.results) {
      actionsExecuted.push(result.target);

      if (result.success) {
        if (result.target === 'ddc-client' && result.response?.cid) {
          dataCloudHash = result.response.cid;
        }
        if (result.target === 'activity-sdk' && result.response?.eventId) {
          indexId = result.response.eventId;
        }
      } else {
        errors.push({
          component: result.target,
          error: result.error || 'Unknown error',
          recoverable: true, // Most errors are recoverable by retry
        });
      }
    }

    return {
      transactionId: orchestrationResult.transactionId,
      status: orchestrationResult.overallStatus,
      dataCloudHash,
      indexId,
      errors: errors.length > 0 ? errors : undefined,
      metadata: {
        processedAt: new Date(),
        processingTime,
        actionsExecuted,
      },
    };
  }

  /**
   * Sanitize config for logging (remove sensitive data)
   */
  private sanitizeConfig(config: UnifiedSDKConfig): any {
    return {
      ddcConfig: {
        bucketId: config.ddcConfig.bucketId.toString(),
        clusterId: config.ddcConfig.clusterId?.toString(),
        network: config.ddcConfig.network,
        // Don't log the signer for security
      },
      activityConfig: config.activityConfig
        ? {
            endpoint: config.activityConfig.endpoint,
            // Don't log API key for security
          }
        : undefined,
      processing: config.processing,
      logging: config.logging,
    };
  }
}
