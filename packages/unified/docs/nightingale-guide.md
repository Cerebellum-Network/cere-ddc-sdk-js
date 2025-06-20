# Nightingale Drone Data Integration Guide

## Overview

The Unified SDK provides comprehensive support for Nightingale drone data ingestion, including video streams, KLV metadata, telemetry data, and frame analysis results. This guide covers how to integrate drone operations with the Cere ecosystem for storage, indexing, and analytics.

## Supported Nightingale Data Types

### 1. Video Streams
High-resolution video data from drone cameras (RGB and thermal)

### 2. KLV Metadata
Key-Length-Value metadata following STANAG 4609 standards

### 3. Telemetry Data
Real-time drone status, positioning, and sensor data

### 4. Frame Analysis
AI-processed frame data with object detection results

## Data Type Interfaces

### NightingaleVideoStream

```typescript
interface NightingaleVideoStream {
  droneId: string;
  streamId: string;
  timestamp: Date;
  videoMetadata: {
    duration: number;        // Duration in milliseconds
    fps: number;            // Frames per second
    resolution: string;     // e.g., "1920x1080"
    codec: string;          // e.g., "h264"
    streamType?: 'thermal' | 'rgb';
  };
  chunks: Array<{
    chunkId: string;
    startTime: number;      // Start time in milliseconds
    endTime: number;        // End time in milliseconds
    data: Buffer | string;  // Video chunk data
    offset?: number;        // Byte offset in stream
    size?: number;          // Chunk size in bytes
  }>;
}
```

### NightingaleKLVData

```typescript
interface NightingaleKLVData {
  droneId: string;
  streamId: string;
  chunkCid?: string;       // Reference to associated video chunk
  timestamp: Date;
  pts: number;             // Presentation timestamp
  klvMetadata: {
    type: string;          // e.g., "ST 0601"
    missionId?: string;
    platform: {
      headingAngle: number;
      pitchAngle: number;
      rollAngle: number;
    };
    sensor: {
      latitude: number;
      longitude: number;
      trueAltitude: number;
      horizontalFieldOfView: number;
      verticalFieldOfView: number;
      relativeAzimuth: number;
      relativeElevation: number;
      relativeRoll: number;
    };
    frameCenter: {
      latitude: number;
      longitude: number;
      elevation: number;
    };
    offsetCorners?: Array<{
      latitude: number;
      longitude: number;
    }>;
    fields: Record<string, any>; // Additional KLV fields
  };
}
```

### NightingaleTelemetry

```typescript
interface NightingaleTelemetry {
  droneId: string;
  timestamp: Date;
  telemetryData: {
    gps: { lat: number; lng: number; alt: number };
    orientation: { pitch: number; roll: number; yaw: number };
    velocity: { x: number; y: number; z: number };
    battery: number;         // Battery percentage (0-100)
    signalStrength: number;  // Signal strength percentage (0-100)
  };
  coordinates: {
    latitude: number;
    longitude: number;
    altitude: number;
  };
  missionId?: string;
  platformData?: Record<string, any>;
}
```

### NightingaleFrameAnalysis

```typescript
interface NightingaleFrameAnalysis {
  droneId: string;
  streamId: string;
  frameId: string;
  chunkCid?: string;       // Reference to source video chunk
  timestamp: Date;
  pts: number;             // Presentation timestamp
  frameData: {
    base64EncodedData: string; // Base64 encoded frame image
    metadata: {
      width: number;
      height: number;
      format: string;        // e.g., "jpeg", "png"
    };
  };
  analysisResults: {
    objects: Array<{
      type: string;          // Object type (e.g., "person", "vehicle")
      confidence: number;    // Confidence score (0-1)
      boundingBox: [number, number, number, number]; // [x, y, width, height]
    }>;
    features: Record<string, any>; // Additional analysis features
  };
}
```

## Configuration

### Basic Nightingale Configuration

```typescript
import { UnifiedSDK } from '@cere-ddc-sdk/unified';

const config = {
  ddcConfig: {
    signer: process.env.DDC_SIGNER!,
    bucketId: BigInt(process.env.DDC_BUCKET_ID!),
    clusterId: BigInt(process.env.DDC_CLUSTER_ID!),
    network: 'mainnet' as const,
  },
  activityConfig: {
    endpoint: 'https://api.stats.cere.network',
    keyringUri: process.env.ACTIVITY_KEYRING_URI!,
    appId: 'nightingale-drone-system',
    appPubKey: process.env.APP_PUBLIC_KEY!,
    dataServicePubKey: process.env.DATA_SERVICE_PUBLIC_KEY!,
  },
  nightingaleConfig: {
    videoProcessing: {
      chunkSize: 2 * 1024 * 1024, // 2MB chunks for high-quality video
      timelinePreservation: true,
      compression: false, // Keep original quality for analysis
    },
    klvProcessing: {
      coordinateIndexing: true,
      metadataValidation: true,
    },
    telemetryProcessing: {
      timeSeries: true,
      coordinateTracking: true,
    },
  },
  processing: {
    enableBatching: true,
    defaultBatchSize: 50, // Moderate batching for drone data
    defaultBatchTimeout: 5000,
    maxRetries: 5, // Higher retries for mission-critical data
    retryDelay: 1000,
  },
  logging: {
    level: 'info' as const,
    enableMetrics: true,
    logRequests: false, // Disable for high-volume video data
  },
};

const sdk = new UnifiedSDK(config);
await sdk.initialize();
```

### Advanced Configuration Options

```typescript
const advancedConfig = {
  // ... basic config
  nightingaleConfig: {
    videoProcessing: {
      chunkSize: 5 * 1024 * 1024,     // 5MB chunks for 4K video
      timelinePreservation: true,      // Maintain temporal relationships
      compression: true,               // Enable compression for storage efficiency
      qualitySettings: {
        rgb: { bitrate: 5000, quality: 'high' },
        thermal: { bitrate: 2000, quality: 'medium' },
      },
    },
    klvProcessing: {
      coordinateIndexing: true,        // Enable geospatial search
      metadataValidation: true,        // Validate KLV structure
      standardCompliance: 'STANAG_4609', // KLV standard
      fieldExtraction: ['timestamp', 'coordinates', 'sensor_data'],
    },
    telemetryProcessing: {
      timeSeries: true,                // Enable time series analysis
      coordinateTracking: true,        // Track coordinate changes
      alertThresholds: {
        batteryLow: 20,               // Battery warning threshold
        signalWeak: 30,               // Signal strength warning
        altitudeMax: 400,             // Maximum altitude alert
      },
    },
    missionManagement: {
      autoMissionDetection: true,      // Detect mission boundaries
      missionMetadata: true,           // Include mission context
      flightPathReconstruction: true, // Reconstruct flight paths
    },
  },
  performance: {
    connectionTimeout: 60000,          // Longer timeout for large video uploads
    requestTimeout: 300000,            // 5 minute timeout for video processing
    maxConcurrentRequests: 5,          // Limit concurrent video uploads
  },
  errorHandling: {
    enableFallbacks: true,
    circuitBreakerThreshold: 3,        // Lower threshold for video processing
    fallbackToDataCloud: true,
    retryStrategies: {
      videoUpload: 'exponential_backoff',
      telemetry: 'immediate_retry',
      klv: 'immediate_retry',
    },
  },
};
```

## Usage Examples

### 1. Video Stream Ingestion

```typescript
// RGB Video Stream
const rgbVideoStream: NightingaleVideoStream = {
  droneId: 'drone_001',
  streamId: 'stream_rgb_123',
  timestamp: new Date(),
  videoMetadata: {
    duration: 300000, // 5 minutes
    fps: 30,
    resolution: '1920x1080',
    codec: 'h264',
    streamType: 'rgb',
  },
  chunks: [
    {
      chunkId: 'chunk_001',
      startTime: 0,
      endTime: 10000, // 10 seconds
      data: videoBuffer1,
      offset: 0,
      size: 2048000, // 2MB
    },
    {
      chunkId: 'chunk_002',
      startTime: 10000,
      endTime: 20000,
      data: videoBuffer2,
      offset: 2048000,
      size: 2048000,
    },
  ],
};

// Ingest video stream (automatically detected as nightingale_video_stream)
const result = await sdk.writeData(rgbVideoStream);
console.log('Video stream stored:', result.dataCloudHash);
```

### 2. Thermal Video Stream

```typescript
// Thermal Video Stream
const thermalVideoStream: NightingaleVideoStream = {
  droneId: 'drone_thermal_001',
  streamId: 'stream_thermal_456',
  timestamp: new Date(),
  videoMetadata: {
    duration: 180000, // 3 minutes
    fps: 60,
    resolution: '640x480',
    codec: 'flir',
    streamType: 'thermal',
  },
  chunks: [
    {
      chunkId: 'thermal_chunk_001',
      startTime: 0,
      endTime: 5000,
      data: thermalBuffer,
      size: 1024000, // 1MB
    },
  ],
};

const thermalResult = await sdk.writeData(thermalVideoStream, {
  priority: 'high', // High priority for thermal data
  metadata: {
    processing: {
      dataCloudWriteMode: 'direct',
      indexWriteMode: 'skip', // Skip indexing for large thermal data
    },
  },
});
```

### 3. KLV Metadata Ingestion

```typescript
// KLV Metadata
const klvData: NightingaleKLVData = {
  droneId: 'drone_001',
  streamId: 'stream_rgb_123',
  chunkCid: result.dataCloudHash, // Link to video chunk
  timestamp: new Date(),
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
      longitude: -74.0060,
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
      timestamp: new Date().toISOString(),
      securityClassification: 'UNCLASSIFIED',
      targetCoordinates: { lat: 40.713, lng: -74.0062 },
    },
  },
};

// Ingest KLV metadata (automatically detected as nightingale_klv_data)
const klvResult = await sdk.writeData(klvData);
console.log('KLV metadata indexed:', klvResult.indexId);
```

### 4. Telemetry Data Ingestion

```typescript
// Real-time Telemetry
const telemetryData: NightingaleTelemetry = {
  droneId: 'drone_001',
  timestamp: new Date(),
  telemetryData: {
    gps: { lat: 40.7128, lng: -74.0060, alt: 150.5 },
    orientation: { pitch: 2.1, roll: -1.3, yaw: 45.5 },
    velocity: { x: 10.5, y: 2.3, z: 0.1 },
    battery: 85,
    signalStrength: 92,
  },
  coordinates: {
    latitude: 40.7128,
    longitude: -74.0060,
    altitude: 150.5,
  },
  missionId: 'mission_alpha_001',
  platformData: {
    temperature: 25.5,
    humidity: 60,
    windSpeed: 5.2,
    visibility: 10000,
  },
};

// Ingest telemetry (automatically detected as nightingale_telemetry)
const telemetryResult = await sdk.writeData(telemetryData, {
  priority: 'high', // High priority for real-time data
});
```

### 5. Frame Analysis Results

```typescript
// AI Analysis Results
const frameAnalysis: NightingaleFrameAnalysis = {
  droneId: 'drone_001',
  streamId: 'stream_rgb_123',
  frameId: 'frame_001_1000',
  chunkCid: result.dataCloudHash, // Link to source video chunk
  timestamp: new Date(),
  pts: 1000,
  frameData: {
    base64EncodedData: frameImageBase64,
    metadata: {
      width: 1920,
      height: 1080,
      format: 'jpeg',
    },
  },
  analysisResults: {
    objects: [
      {
        type: 'person',
        confidence: 0.95,
        boundingBox: [100, 200, 150, 300],
      },
      {
        type: 'vehicle',
        confidence: 0.87,
        boundingBox: [500, 400, 200, 100],
      },
    ],
    features: {
      sceneType: 'urban',
      lightingConditions: 'daylight',
      weatherConditions: 'clear',
      crowdDensity: 'medium',
    },
  },
};

// Ingest frame analysis (automatically detected as nightingale_frame_analysis)
const analysisResult = await sdk.writeData(frameAnalysis);
console.log('Frame analysis stored and indexed:', {
  cid: analysisResult.dataCloudHash,
  indexId: analysisResult.indexId,
});
```

## Data Flow and Routing

### Automatic Routing Behavior

The SDK automatically routes different Nightingale data types optimally:

#### Video Streams
- **Storage**: Direct DDC storage for video chunks
- **Indexing**: Skipped (performance optimization for large data)
- **Priority**: Normal
- **Use Case**: Long-term storage, later retrieval for analysis

#### KLV Metadata
- **Storage**: Skipped (metadata-only)
- **Indexing**: Real-time indexing for searchability
- **Priority**: High (critical for operations)
- **Use Case**: Geospatial search, mission reconstruction

#### Telemetry Data
- **Storage**: Direct DDC storage for compliance
- **Indexing**: Real-time indexing for monitoring
- **Priority**: High (operational awareness)
- **Use Case**: Real-time monitoring, historical analysis

#### Frame Analysis
- **Storage**: Direct DDC storage for analysis results
- **Indexing**: Real-time indexing for object search
- **Priority**: Normal
- **Use Case**: Object detection, scene analysis

### Custom Routing

You can override default routing behavior:

```typescript
// Store video with indexing enabled
const customVideoResult = await sdk.writeData(videoStream, {
  metadata: {
    processing: {
      dataCloudWriteMode: 'direct',
      indexWriteMode: 'realtime', // Override default 'skip'
      priority: 'high',
    },
  },
});

// Skip DDC storage for KLV (indexing only)
const indexOnlyKLV = await sdk.writeData(klvData, {
  metadata: {
    processing: {
      dataCloudWriteMode: 'skip', // Override default 'skip'
      indexWriteMode: 'realtime',
    },
  },
});
```

## Mission Management

### Mission Context

Include mission context in your data:

```typescript
const missionTelemetry: NightingaleTelemetry = {
  droneId: 'drone_001',
  timestamp: new Date(),
  missionId: 'search_and_rescue_001',
  telemetryData: {
    // ... telemetry data
  },
  coordinates: {
    latitude: 40.7128,
    longitude: -74.0060,
    altitude: 150.5,
  },
  platformData: {
    missionPhase: 'search',
    searchPattern: 'grid',
    targetArea: 'zone_alpha',
    operatorId: 'pilot_001',
  },
};
```

### Mission Reconstruction

Link related data using consistent identifiers:

```typescript
// Video stream with mission context
const missionVideo: NightingaleVideoStream = {
  droneId: 'drone_001',
  streamId: `mission_${missionId}_video`,
  // ... video data
};

// KLV data linked to video
const missionKLV: NightingaleKLVData = {
  droneId: 'drone_001',
  streamId: `mission_${missionId}_video`,
  chunkCid: videoResult.dataCloudHash,
  klvMetadata: {
    missionId: missionId,
    // ... KLV data
  },
};
```

## Performance Optimization

### Batch Processing

For high-volume telemetry data:

```typescript
const telemetryBatch = [
  telemetryData1,
  telemetryData2,
  telemetryData3,
  // ... more telemetry points
];

// Process multiple telemetry points efficiently
const batchResults = await Promise.all(
  telemetryBatch.map(data => sdk.writeData(data, {
    metadata: {
      processing: {
        dataCloudWriteMode: 'batch',
        indexWriteMode: 'realtime',
      },
    },
  }))
);
```

### Streaming Large Videos

For very large video files:

```typescript
// Process video in smaller chunks
const processVideoStream = async (videoFile: Buffer, droneId: string) => {
  const chunkSize = 2 * 1024 * 1024; // 2MB chunks
  const chunks = [];
  
  for (let offset = 0; offset < videoFile.length; offset += chunkSize) {
    const chunkData = videoFile.slice(offset, offset + chunkSize);
    const chunk = {
      chunkId: `chunk_${Math.floor(offset / chunkSize)}`,
      startTime: (offset / chunkSize) * 10000, // 10 seconds per chunk
      endTime: ((offset / chunkSize) + 1) * 10000,
      data: chunkData,
      offset,
      size: chunkData.length,
    };
    chunks.push(chunk);
  }
  
  const videoStream: NightingaleVideoStream = {
    droneId,
    streamId: `stream_${Date.now()}`,
    timestamp: new Date(),
    videoMetadata: {
      duration: chunks.length * 10000,
      fps: 30,
      resolution: '1920x1080',
      codec: 'h264',
      streamType: 'rgb',
    },
    chunks,
  };
  
  return await sdk.writeData(videoStream);
};
```

## Error Handling

### Retry Strategies

```typescript
const retryVideoUpload = async (videoStream: NightingaleVideoStream, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await sdk.writeData(videoStream, {
        priority: 'high',
        metadata: {
          processing: {
            dataCloudWriteMode: 'direct',
            indexWriteMode: 'skip',
          },
        },
      });
      
      console.log(`Video upload successful on attempt ${attempt}`);
      return result;
    } catch (error) {
      console.error(`Video upload attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        throw new Error(`Video upload failed after ${maxRetries} attempts`);
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
};
```

### Graceful Degradation

```typescript
const ingestWithFallback = async (data: any) => {
  try {
    // Try normal ingestion
    return await sdk.writeData(data);
  } catch (error) {
    console.warn('Normal ingestion failed, trying fallback:', error);
    
    // Fallback to DDC only
    return await sdk.writeData(data, {
      metadata: {
        processing: {
          dataCloudWriteMode: 'direct',
          indexWriteMode: 'skip', // Skip indexing if Activity SDK fails
        },
      },
    });
  }
};
```

## Monitoring and Analytics

### Telemetry Monitoring

```typescript
const monitorDroneHealth = async (droneId: string) => {
  const telemetry = await getCurrentTelemetry(droneId);
  
  // Check critical thresholds
  if (telemetry.telemetryData.battery < 20) {
    console.warn(`Low battery warning for ${droneId}: ${telemetry.telemetryData.battery}%`);
  }
  
  if (telemetry.telemetryData.signalStrength < 30) {
    console.warn(`Weak signal warning for ${droneId}: ${telemetry.telemetryData.signalStrength}%`);
  }
  
  // Ingest telemetry with monitoring context
  return await sdk.writeData({
    ...telemetry,
    platformData: {
      ...telemetry.platformData,
      healthStatus: calculateHealthStatus(telemetry),
      alertLevel: determineAlertLevel(telemetry),
    },
  });
};
```

### Mission Analytics

```typescript
const analyzeMissionData = async (missionId: string) => {
  // This would typically query indexed data
  console.log(`Analyzing mission ${missionId}:`);
  console.log('- Video streams processed');
  console.log('- KLV metadata indexed');
  console.log('- Telemetry data analyzed');
  console.log('- Frame analysis completed');
  
  // Generate mission summary
  const missionSummary = {
    missionId,
    status: 'completed',
    totalFlightTime: '45 minutes',
    dataVolume: '2.5 GB',
    objectsDetected: 127,
    alertsGenerated: 3,
  };
  
  return missionSummary;
};
```

## Best Practices

### 1. Data Organization
- Use consistent naming conventions for drone IDs and stream IDs
- Include mission context in all related data
- Link related data using CIDs and reference fields

### 2. Performance
- Use appropriate chunk sizes for video data (2-5MB recommended)
- Enable batching for high-volume telemetry data
- Skip indexing for large video streams unless needed

### 3. Security
- Encrypt sensitive mission data
- Use appropriate TTL values for temporary data
- Sanitize metadata before storage

### 4. Monitoring
- Monitor drone health through telemetry data
- Set up alerts for critical thresholds
- Track mission progress through data ingestion

### 5. Error Handling
- Implement retry logic for video uploads
- Use graceful degradation for critical operations
- Monitor and log all failures for analysis

This comprehensive guide covers all aspects of integrating Nightingale drone data with the Unified SDK, providing both basic usage patterns and advanced optimization techniques for production deployments. 