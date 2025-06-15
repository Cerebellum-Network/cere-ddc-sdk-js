import { UnifiedSDK } from '../../UnifiedSDK';
import {
  NightingaleVideoStream,
  NightingaleKLVData,
  NightingaleTelemetry,
  NightingaleFrameAnalysis,
} from '../../types';
import { createInitializedSDK, setupMockComponents } from '../helpers/test-utils';

// Mock all dependencies
jest.mock('../../RulesInterpreter');
jest.mock('../../Dispatcher');
jest.mock('../../Orchestrator');

describe('UnifiedSDK - Nightingale Integration', () => {
  let sdk: UnifiedSDK;

  beforeEach(async () => {
    sdk = await createInitializedSDK();
  });

  describe('Nightingale Video Stream Processing', () => {
    it('should detect and process Nightingale video streams', async () => {
      const videoStreamData: NightingaleVideoStream = {
        droneId: 'drone_001',
        streamId: 'stream_video_123',
        timestamp: new Date('2024-01-01T12:00:00Z'),
        videoMetadata: {
          duration: 300, // 5 minutes
          fps: 30,
          resolution: '1920x1080',
          codec: 'h264',
          streamType: 'rgb',
        },
        chunks: [
          {
            chunkId: 'chunk_001',
            startTime: 0,
            endTime: 10,
            data: Buffer.from('video_chunk_data_001'),
            offset: 0,
            size: 1024000, // 1MB
          },
          {
            chunkId: 'chunk_002',
            startTime: 10,
            endTime: 20,
            data: Buffer.from('video_chunk_data_002'),
            offset: 1024000,
            size: 1024000,
          },
        ],
      };

      const { mockRulesInterpreter, mockDispatcher, mockOrchestrator } = setupMockComponents(sdk);

      mockRulesInterpreter.validateMetadata = jest.fn().mockReturnValue({
        processing: {
          dataCloudWriteMode: 'batch',
          indexWriteMode: 'realtime',
        },
      });
      mockRulesInterpreter.extractProcessingRules = jest.fn().mockReturnValue({
        dataCloudAction: 'write_batch',
        indexAction: 'write_realtime',
        batchingRequired: true,
        additionalParams: { priority: 'high', encryption: false },
      });
      mockDispatcher.routeRequest = jest.fn().mockReturnValue({
        actions: [
          { target: 'ddc-client', method: 'storeBatch' },
          { target: 'activity-sdk', method: 'sendEvent' },
        ],
        executionMode: 'sequential',
        rollbackRequired: false,
      });
      mockOrchestrator.execute = jest.fn().mockResolvedValue({
        results: [
          { target: 'ddc-client', success: true, response: { cid: '0xvideo123' } },
          { target: 'activity-sdk', success: true, response: { eventId: 'evt_video_123' } },
        ],
        overallStatus: 'success',
        transactionId: 'txn_video_123',
      });

      const result = await sdk.writeData(videoStreamData);

      expect(result.status).toBe('success');
      expect(result.transactionId).toBe('txn_video_123');
      expect(result.dataCloudHash).toBe('0xvideo123');
      expect(result.indexId).toBe('evt_video_123');

      // Verify Nightingale-specific metadata was generated
      expect(mockRulesInterpreter.validateMetadata).toHaveBeenCalledWith(
        expect.objectContaining({
          processing: expect.objectContaining({
            dataCloudWriteMode: 'direct', // Direct storage for video chunks (actual implementation)
            indexWriteMode: 'skip', // Skip indexing for large video data (actual implementation)
          }),
          userContext: expect.objectContaining({
            source: 'nightingale',
            droneId: videoStreamData.droneId,
            streamId: videoStreamData.streamId,
            dataType: 'video_stream',
            streamType: 'rgb',
          }),
        }),
      );
    });

    it('should handle thermal video streams', async () => {
      const thermalVideoData: NightingaleVideoStream = {
        droneId: 'drone_thermal_001',
        streamId: 'stream_thermal_456',
        timestamp: new Date(),
        videoMetadata: {
          duration: 180,
          fps: 60,
          resolution: '640x480',
          codec: 'flir',
          streamType: 'thermal',
        },
        chunks: [
          {
            chunkId: 'thermal_chunk_001',
            startTime: 0,
            endTime: 5,
            data: Buffer.from('thermal_data'),
            size: 512000,
          },
        ],
      };

      const { mockRulesInterpreter, mockOrchestrator } = setupMockComponents(sdk);

      mockRulesInterpreter.validateMetadata = jest.fn().mockReturnValue({
        processing: { dataCloudWriteMode: 'batch', indexWriteMode: 'realtime' },
      });
      mockOrchestrator.execute = jest.fn().mockResolvedValue({
        results: [{ target: 'ddc-client', success: true, response: { cid: '0xthermal123' } }],
        overallStatus: 'success',
        transactionId: 'txn_thermal_123',
      });

      const result = await sdk.writeData(thermalVideoData);

      expect(result.status).toBe('success');
      expect(mockRulesInterpreter.validateMetadata).toHaveBeenCalledWith(
        expect.objectContaining({
          userContext: expect.objectContaining({
            source: 'nightingale',
            dataType: 'video_stream',
            streamType: 'thermal',
          }),
        }),
      );
    });
  });

  describe('Nightingale KLV Data Processing', () => {
    it('should detect and process Nightingale KLV data', async () => {
      const klvData: NightingaleKLVData = {
        droneId: 'drone_001',
        streamId: 'stream_klv_789',
        chunkCid: '0xchunk_ref_123',
        timestamp: new Date('2024-01-01T12:00:00Z'),
        pts: 1000, // Presentation timestamp
        klvMetadata: {
          type: 'ST 0601',
          missionId: 'mission_alpha_001',
          platform: {
            headingAngle: 45.5,
            pitchAngle: -2.1,
            rollAngle: 1.3,
          },
          sensor: {
            latitude: 40.7128,
            longitude: -74.006,
            trueAltitude: 1500.0,
            horizontalFieldOfView: 60.0,
            verticalFieldOfView: 45.0,
            relativeAzimuth: 90.0,
            relativeElevation: 15.0,
            relativeRoll: 0.5,
          },
          frameCenter: {
            latitude: 40.7129,
            longitude: -74.0061,
            elevation: 100.0,
          },
          offsetCorners: [
            { latitude: 40.7127, longitude: -74.0059 },
            { latitude: 40.7131, longitude: -74.0063 },
          ],
          fields: {
            timestamp: '2024-01-01T12:00:00Z',
            securityClassification: 'UNCLASSIFIED',
            targetCoordinates: { lat: 40.713, lng: -74.0062 },
          },
        },
      };

      const { mockRulesInterpreter, mockDispatcher, mockOrchestrator } = setupMockComponents(sdk);

      mockRulesInterpreter.validateMetadata = jest.fn().mockReturnValue({
        processing: {
          dataCloudWriteMode: 'direct',
          indexWriteMode: 'realtime',
        },
      });
      mockRulesInterpreter.extractProcessingRules = jest.fn().mockReturnValue({
        dataCloudAction: 'write_direct',
        indexAction: 'write_realtime',
        batchingRequired: false,
        additionalParams: { priority: 'high', encryption: false },
      });
      mockDispatcher.routeRequest = jest.fn().mockReturnValue({
        actions: [{ target: 'activity-sdk', method: 'sendEvent' }],
        executionMode: 'sequential',
        rollbackRequired: false,
      });
      mockOrchestrator.execute = jest.fn().mockResolvedValue({
        results: [{ target: 'activity-sdk', success: true, response: { eventId: 'evt_klv_789' } }],
        overallStatus: 'success',
        transactionId: 'txn_klv_789',
      });

      const result = await sdk.writeData(klvData);

      expect(result.status).toBe('success');
      expect(result.indexId).toBe('evt_klv_789');

      // Verify KLV-specific metadata
      expect(mockRulesInterpreter.validateMetadata).toHaveBeenCalledWith(
        expect.objectContaining({
          processing: expect.objectContaining({
            dataCloudWriteMode: 'skip', // Skip data cloud for metadata (actual implementation)
            indexWriteMode: 'realtime', // Real-time indexing for searchability (actual implementation)
            priority: 'high', // High priority for metadata (actual implementation)
          }),
          userContext: expect.objectContaining({
            source: 'nightingale',
            droneId: klvData.droneId,
            streamId: klvData.streamId,
            dataType: 'klv_metadata',
            missionId: klvData.klvMetadata.missionId,
          }),
        }),
      );
    });

    it('should handle KLV data without optional fields', async () => {
      const minimalKlvData: NightingaleKLVData = {
        droneId: 'drone_minimal',
        streamId: 'stream_minimal',
        timestamp: new Date(),
        pts: 500,
        klvMetadata: {
          type: 'ST 0601',
          platform: {
            headingAngle: 0,
            pitchAngle: 0,
            rollAngle: 0,
          },
          sensor: {
            latitude: 0,
            longitude: 0,
            trueAltitude: 0,
            horizontalFieldOfView: 30,
            verticalFieldOfView: 20,
            relativeAzimuth: 0,
            relativeElevation: 0,
            relativeRoll: 0,
          },
          frameCenter: {
            latitude: 0,
            longitude: 0,
            elevation: 0,
          },
          fields: {},
        },
      };

      const { mockOrchestrator } = setupMockComponents(sdk);
      mockOrchestrator.execute = jest.fn().mockResolvedValue({
        results: [{ target: 'activity-sdk', success: true, response: { eventId: 'evt_minimal' } }],
        overallStatus: 'success',
        transactionId: 'txn_minimal',
      });

      const result = await sdk.writeData(minimalKlvData);
      expect(result.status).toBe('success');
    });
  });

  describe('Nightingale Telemetry Processing', () => {
    it('should detect and process Nightingale telemetry', async () => {
      const telemetryData: NightingaleTelemetry = {
        droneId: 'drone_telem_001',
        timestamp: new Date('2024-01-01T12:00:00Z'),
        telemetryData: {
          gps: { lat: 40.7128, lng: -74.006, alt: 1500.0 },
          orientation: { pitch: -2.1, roll: 1.3, yaw: 45.5 },
          velocity: { x: 10.5, y: 2.1, z: -0.5 },
          battery: 85.5,
          signalStrength: 90,
        },
        coordinates: {
          latitude: 40.7128,
          longitude: -74.006,
          altitude: 1500.0,
        },
        missionId: 'mission_bravo_002',
        platformData: {
          model: 'DJI_Mavic_Pro',
          serialNumber: 'DJI123456789',
          firmwareVersion: '1.4.2',
          sensors: ['camera', 'gps', 'imu', 'barometer'],
        },
      };

      const { mockRulesInterpreter, mockOrchestrator } = setupMockComponents(sdk);

      mockRulesInterpreter.validateMetadata = jest.fn().mockReturnValue({
        processing: {
          dataCloudWriteMode: 'direct',
          indexWriteMode: 'realtime',
        },
      });
      mockOrchestrator.execute = jest.fn().mockResolvedValue({
        results: [{ target: 'activity-sdk', success: true, response: { eventId: 'evt_telem_001' } }],
        overallStatus: 'success',
        transactionId: 'txn_telem_001',
      });

      const result = await sdk.writeData(telemetryData);

      expect(result.status).toBe('success');
      expect(result.indexId).toBe('evt_telem_001');

      // Verify telemetry-specific metadata
      expect(mockRulesInterpreter.validateMetadata).toHaveBeenCalledWith(
        expect.objectContaining({
          processing: expect.objectContaining({
            dataCloudWriteMode: 'direct', // Direct storage for compliance (actual implementation)
            indexWriteMode: 'realtime', // Real-time indexing for monitoring (actual implementation)
            priority: 'high', // High priority for telemetry (actual implementation)
          }),
          userContext: expect.objectContaining({
            source: 'nightingale',
            droneId: telemetryData.droneId,
            dataType: 'telemetry',
            missionId: telemetryData.missionId,
          }),
        }),
      );
    });
  });

  describe('Nightingale Frame Analysis Processing', () => {
    it('should detect and process Nightingale frame analysis', async () => {
      const frameAnalysisData: NightingaleFrameAnalysis = {
        droneId: 'drone_analysis_001',
        streamId: 'stream_analysis_456',
        frameId: 'frame_001',
        chunkCid: '0xframe_chunk_123',
        timestamp: new Date('2024-01-01T12:00:00Z'),
        pts: 3000,
        frameData: {
          base64EncodedData:
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          metadata: {
            width: 1920,
            height: 1080,
            format: 'jpeg',
          },
        },
        analysisResults: {
          objects: [
            {
              type: 'vehicle',
              confidence: 0.92,
              boundingBox: [100, 200, 150, 250],
            },
            {
              type: 'person',
              confidence: 0.87,
              boundingBox: [300, 400, 350, 500],
            },
          ],
          features: {
            motionDetected: true,
            anomalyScore: 0.15,
            classificationTags: ['urban', 'daytime', 'clear_weather'],
            processingTime: 250, // milliseconds
          },
        },
      };

      const { mockRulesInterpreter, mockOrchestrator } = setupMockComponents(sdk);

      mockRulesInterpreter.validateMetadata = jest.fn().mockReturnValue({
        processing: {
          dataCloudWriteMode: 'viaIndex',
          indexWriteMode: 'realtime',
        },
      });
      mockOrchestrator.execute = jest.fn().mockResolvedValue({
        results: [{ target: 'activity-sdk', success: true, response: { eventId: 'evt_analysis_456' } }],
        overallStatus: 'success',
        transactionId: 'txn_analysis_456',
      });

      const result = await sdk.writeData(frameAnalysisData);

      expect(result.status).toBe('success');
      expect(result.indexId).toBe('evt_analysis_456');

      // Verify frame analysis-specific metadata
      expect(mockRulesInterpreter.validateMetadata).toHaveBeenCalledWith(
        expect.objectContaining({
          processing: expect.objectContaining({
            dataCloudWriteMode: 'direct', // Direct storage for analysis results (actual implementation)
            indexWriteMode: 'realtime', // Real-time indexing for searchability (actual implementation)
            priority: 'normal', // Normal priority for analysis (actual implementation)
          }),
          userContext: expect.objectContaining({
            source: 'nightingale',
            droneId: frameAnalysisData.droneId,
            streamId: frameAnalysisData.streamId,
            dataType: 'frame_analysis',
            frameId: frameAnalysisData.frameId,
          }),
        }),
      );
    });
  });

  describe('Mixed Nightingale Workload Processing', () => {
    it('should handle mixed Nightingale workload', async () => {
      const videoData: NightingaleVideoStream = {
        droneId: 'drone_mixed_001',
        streamId: 'stream_mixed_001',
        timestamp: new Date(),
        videoMetadata: {
          duration: 60,
          fps: 30,
          resolution: '1280x720',
          codec: 'h264',
        },
        chunks: [
          {
            chunkId: 'mixed_chunk_001',
            startTime: 0,
            endTime: 30,
            data: Buffer.from('mixed_video_data'),
            size: 512000,
          },
        ],
      };

      const telemetryData: NightingaleTelemetry = {
        droneId: 'drone_mixed_001',
        timestamp: new Date(),
        telemetryData: {
          gps: { lat: 37.7749, lng: -122.4194, alt: 800.0 },
          orientation: { pitch: 0, roll: 0, yaw: 180 },
          velocity: { x: 0, y: 0, z: 0 },
          battery: 75,
          signalStrength: 85,
        },
        coordinates: {
          latitude: 37.7749,
          longitude: -122.4194,
          altitude: 800.0,
        },
      };

      const { mockOrchestrator } = setupMockComponents(sdk);

      mockOrchestrator.execute = jest
        .fn()
        .mockResolvedValueOnce({
          results: [{ target: 'ddc-client', success: true, response: { cid: '0xvideo_mixed' } }],
          overallStatus: 'success',
          transactionId: 'txn_video_mixed',
        })
        .mockResolvedValueOnce({
          results: [{ target: 'activity-sdk', success: true, response: { eventId: 'evt_telem_mixed' } }],
          overallStatus: 'success',
          transactionId: 'txn_telem_mixed',
        });

      const [videoResult, telemetryResult] = await Promise.all([
        sdk.writeData(videoData),
        sdk.writeData(telemetryData),
      ]);

      expect(videoResult.status).toBe('success');
      expect(telemetryResult.status).toBe('success');
      expect(videoResult.dataCloudHash).toBe('0xvideo_mixed');
      expect(telemetryResult.indexId).toBe('evt_telem_mixed');
    });

    it('should preserve existing drone functionality with legacy data', async () => {
      const legacyDroneData = {
        droneId: 'legacy_drone_001',
        missionId: 'legacy_mission',
        timestamp: new Date(),
        data: {
          type: 'legacy_format',
          payload: 'legacy_payload_data',
        },
      };

      const { mockRulesInterpreter, mockOrchestrator } = setupMockComponents(sdk);

      mockRulesInterpreter.validateMetadata = jest.fn().mockReturnValue({
        processing: {
          dataCloudWriteMode: 'direct',
          indexWriteMode: 'skip', // Legacy data might skip indexing
        },
      });
      mockOrchestrator.execute = jest.fn().mockResolvedValue({
        results: [{ target: 'ddc-client', success: true, response: { cid: '0xlegacy123' } }],
        overallStatus: 'success',
        transactionId: 'txn_legacy_123',
      });

      const result = await sdk.writeData(legacyDroneData);

      expect(result.status).toBe('success');
      expect(result.dataCloudHash).toBe('0xlegacy123');

      // Should handle as generic data (actual implementation uses default generic metadata)
      expect(mockRulesInterpreter.validateMetadata).toHaveBeenCalledWith(
        expect.objectContaining({
          processing: expect.objectContaining({
            dataCloudWriteMode: 'viaIndex', // Default for generic data
            indexWriteMode: 'realtime', // Default for generic data
            priority: 'normal', // Default priority
          }),
          userContext: expect.objectContaining({
            source: 'generic',
            dataType: 'unknown',
          }),
        }),
      );
    });
  });

  describe('Nightingale Configuration Optimization', () => {
    it('should handle Nightingale configuration appropriately', async () => {
      // Test with standard configuration - simplified test without complex mocking
      const videoData: NightingaleVideoStream = {
        droneId: 'config_test_drone',
        streamId: 'config_test_stream',
        timestamp: new Date(),
        videoMetadata: {
          duration: 120,
          fps: 60,
          resolution: '4K',
          codec: 'h265',
        },
        chunks: [
          {
            chunkId: 'config_chunk',
            startTime: 0,
            endTime: 10,
            data: Buffer.from('config_test_data'),
            size: 2 * 1024 * 1024, // 2MB
          },
        ],
      };

      const { mockOrchestrator } = setupMockComponents(sdk);
      mockOrchestrator.execute = jest.fn().mockResolvedValue({
        results: [{ target: 'ddc-client', success: true, response: { cid: '0xconfig123' } }],
        overallStatus: 'success',
        transactionId: 'txn_config_123',
      });

      const result = await sdk.writeData(videoData);

      expect(result.status).toBe('success');
      expect(result.transactionId).toBe('txn_config_123');
    });
  });
});
