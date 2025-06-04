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

        // Telegram Event Detection
        if (payload.eventType && payload.userId && (payload.timestamp || payload.createdAt)) {
            return 'telegram_event';
        }

        // Telegram Message Detection
        if (payload.messageId && payload.chatId && payload.userId && payload.messageType) {
            return 'telegram_message';
        }

        // Drone Telemetry Detection
        if (payload.droneId && payload.telemetry && (payload.latitude || payload.longitude)) {
            return 'drone_telemetry';
        }

        // Drone Video Detection
        if (payload.droneId && (payload.videoChunk || payload.frameData)) {
            return 'drone_video';
        }

        return 'generic';
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
            case 'drone_telemetry':
                return `drone_telemetry_${payload.droneId}_${timestamp}`;
            case 'drone_video':
                return `drone_video_${payload.droneId}_${timestamp}`;
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
