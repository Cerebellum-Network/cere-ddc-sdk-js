# Drone Video Use Case Diagram Explanation

## Diagram Overview

This sequence diagram shows how **drone video streams** are processed through the Unified Data Ingestion SDK/API system. It demonstrates a **two-phase processing pattern** where large video chunks are stored separately from searchable video metadata, illustrating the most sophisticated use case in the system.

## What This Diagram Shows

### Two-Phase Processing Pattern

**Phase 1: Video Chunk Storage**

- **Purpose**: Store large video chunk in Data Cloud only
- **Metadata**: `{ "dataCloudWriteMode": "direct", "indexWriteMode": "skip" }`
- **Result**: Video chunk stored with hash returned

**Phase 2: Video Event Indexing**

- **Purpose**: Index video metadata with reference to chunk
- **Metadata**: `{ "dataCloudWriteMode": "skip", "indexWriteMode": "realtime" }`
- **Additional Field**: `"streamDataCloudHash"` links to Phase 1 chunk

### Current vs. New Data Flow

**Current Approach**:

1. Drone → Data Cloud SDK (for video chunks)
2. Drone → Activity SDK (for video events with hash reference)

**New Approach**:

1. Drone → Unified SDK/API (direct + skip metadata)
2. Drone → Unified SDK/API (skip + realtime metadata)

### Step-by-Step Process Flow

#### Phase 1: Video Chunk Storage

1. **Video Capture**: Drone records video chunk during flight
2. **Direct Storage**: Client calls Unified SDK with "direct" + "skip" metadata
3. **Data Cloud Only**: System routes only to Data Cloud SDK
4. **Hash Return**: Client receives Data Cloud hash for reference

#### Phase 2: Video Metadata Indexing

1. **Event Creation**: Client creates video event with metadata and hash reference
2. **Index Only**: Client calls Unified SDK with "skip" + "realtime" metadata
3. **Event Storage**: System routes only to Activity SDK/Indexing Layer
4. **Confirmation**: Video event becomes searchable with link to video chunk

## Assignment Requirements Addressed

### Functional Requirements

- **FR-1: Single Entry Point**: Both phases use Unified SDK, not separate SDKs
- **FR-3: Support All Existing Use Cases**: UC-4 (Drone Video) requirement fulfilled
- **Flexible Processing**: Demonstrates full power of metadata-driven routing

### Use Case Requirements

- **UC-4: Drone Video Streaming**: This diagram specifically addresses this requirement
- **Storage Optimization**: Large video chunks avoid indexing overhead
- **Search Capability**: Video events remain searchable with chunk references
- **Resource Efficiency**: Separates storage concerns for optimal performance

### Non-Functional Requirements

- **Storage Efficiency**: Video chunks don't consume indexing resources
- **Query Performance**: Video events searchable without large binary data
- **Cost Optimization**: Indexing Layer not burdened with video storage

## Design Decisions Made

### 1. Two-Phase Processing Pattern

**Decision**: Split video processing into chunk storage + event indexing  
**Rationale**:

- **Storage Optimization**: Large video files shouldn't be indexed
- **Query Performance**: Metadata searches don't scan video binary data
- **Cost Efficiency**: Indexing Layer optimized for searchable data, not large binaries
- **Flexibility**: Events can reference multiple chunks or streaming segments

### 2. Hash-Based Reference System

**Decision**: Use Data Cloud hash to link events to video chunks  
**Rationale**:

- **Immutable Reference**: Data Cloud hashes provide permanent links
- **Integrity**: Hash verifies chunk hasn't been modified
- **Efficiency**: Small hash reference instead of embedding large video
- **Existing Pattern**: Leverages Data Cloud's built-in hash system

### 3. Skip Mode Utilization

**Decision**: Use "skip" mode for unused storage systems  
**Rationale**:

- **Resource Efficiency**: Don't process data where it's not needed
- **Performance**: Avoid unnecessary writes and latency
- **Cost Savings**: Don't pay for unused storage operations
- **Clear Intent**: Explicit about what processing is needed

### 4. Same Interface for Both Phases

**Decision**: Use Unified SDK for both video chunks and events  
**Rationale**:

- **Consistency**: Developers use same interface for all drone data
- **Flexibility**: Easy to change processing logic without client changes
- **Monitoring**: Unified observability for all video processing
- **Simplicity**: Single SDK to learn and configure

## Process Description

### Video Processing Workflow

This diagram describes the **drone video streaming process**:

#### Phase 1: Raw Video Storage

1. **Video Recording**: Drone captures video during flight operations
2. **Chunk Preparation**: Client segments video into manageable chunks
3. **Direct Storage**: Chunk sent to Unified SDK with storage-only metadata
4. **Data Cloud Write**: System stores chunk directly to Data Cloud
5. **Hash Retrieval**: Client receives hash for linking and verification

#### Phase 2: Video Event Creation

1. **Event Metadata**: Client creates searchable event with video context
2. **Hash Reference**: Event includes hash from Phase 1 for chunk linking
3. **Index-Only Processing**: Event sent to Unified SDK with index-only metadata
4. **Searchable Storage**: Event stored in Indexing Layer for queries
5. **Reference Completion**: Video chunk now discoverable through event queries

### Data Characteristics

- **Video Chunks**: Large binary data (MB to GB per chunk)
- **Video Events**: Small metadata records (KB) with hash references
- **Volume**: High storage volume, moderate event frequency
- **Access Patterns**: Chunks accessed by hash, events accessed by search queries

## Open Questions and Design Considerations

### Video Chunk Size Optimization

- **Question**: What's the optimal chunk size for video segments?
- **Considerations**: Balance between storage efficiency and streaming performance
- **Impact**: Affects both storage costs and retrieval latency

### Hash Reference Validation

- **Question**: Should the system validate hash references exist?
- **Considerations**: Performance vs. data integrity trade-offs
- **Impact**: Determines complexity of reference management

### Multi-Chunk Event Support

- **Question**: Can a single event reference multiple video chunks?
- **Considerations**: Support for longer video sessions or multi-angle recording
- **Impact**: Schema design for event metadata

## Comparison with Other Use Cases

### Unique Characteristics

This use case is unique because it:

- **Uses "skip" mode**: Only use case that deliberately skips storage systems
- **Two-phase pattern**: Requires coordination between separate API calls
- **Reference linking**: Creates relationships between separate data items
- **Binary data handling**: Optimizes for large file storage vs. searchable metadata

### Pattern Reusability

This pattern applies to other scenarios:

- **Photo storage**: Large images with searchable metadata
- **Document storage**: Large files with searchable document information
- **Sensor data**: Raw sensor dumps with processed event summaries

## Current Implementation Complexity

### Before Unified SDK

```typescript
// Complex dual-SDK coordination
const dataCloudSDK = new DataCloudSDK(config);
const activitySDK = new ActivitySDK(config);

async function processVideoChunk(videoChunk, metadata) {
  // Phase 1: Store video chunk
  const chunkResult = await dataCloudSDK.writeData(videoChunk);

  // Phase 2: Create searchable event
  const eventResult = await activitySDK.writeEvent({
    type: "drone_video",
    metadata: metadata,
    dataCloudHash: chunkResult.hash,
    timestamp: new Date(),
  });

  return { chunkHash: chunkResult.hash, eventId: eventResult.id };
}
```

### With Unified SDK

```typescript
// Simplified two-phase pattern
const unifiedSDK = new UnifiedSDK(config);

async function processVideoChunk(videoChunk, metadata) {
  // Phase 1: Store video chunk
  const chunkResult = await unifiedSDK.writeData(videoChunk, {
    processing: {
      dataCloudWriteMode: "direct",
      indexWriteMode: "skip",
    },
  });

  // Phase 2: Create searchable event
  const eventResult = await unifiedSDK.writeData(metadata, {
    streamDataCloudHash: chunkResult.dataCloudHash,
    processing: {
      dataCloudWriteMode: "skip",
      indexWriteMode: "realtime",
    },
  });

  return {
    chunkHash: chunkResult.dataCloudHash,
    eventId: eventResult.transactionId,
  };
}
```

## Relevance to Project

### Architecture Validation

This use case demonstrates the **full flexibility** of the metadata-driven architecture:

- **Complete Processing Control**: Uses all four processing mode combinations
- **Resource Optimization**: Efficiently handles different data types
- **Reference Management**: Supports complex data relationships
- **Performance Tuning**: Optimizes each phase for its specific requirements

### Business Value

- **Cost Optimization**: Reduces indexing costs for large binary data
- **Query Performance**: Maintains fast searches on video metadata
- **Storage Efficiency**: Optimizes storage strategy per data type
- **Developer Simplicity**: Single SDK handles complex two-phase pattern

### Technical Innovation

- **Skip Mode Usage**: Demonstrates deliberate non-processing of data
- **Reference Patterns**: Shows how to link related data across storage systems
- **Binary Data Handling**: Optimizes for large file storage scenarios
- **Flexible Metadata**: Supports complex processing requirements

## Integration with Other Diagrams

### Related Components

- **Metadata Schema** (Diagram 2): Shows how "skip" mode works
- **Architecture Overview** (Diagram 1): Shows routing to different systems
- **Performance Benchmarks** (Diagram 11): Shows latency targets for video

### Testing Requirements

- **Testing Matrix** (Diagram 9): Must validate two-phase processing
- **Error Handling** (Diagram 7): Must handle failures in multi-phase workflows

## Next Steps

After understanding this use case:

1. Review **Batch Mode Diagram** (Diagram 6) for alternative video processing patterns
2. Study **Error Handling Diagram** (Diagram 7) for multi-phase failure scenarios
3. Examine **Performance Benchmarks** (Diagram 11) for video processing targets
4. Review **Testing Matrix** (Diagram 9) for two-phase validation scenarios

This use case demonstrates the **most sophisticated processing pattern** in the system, proving that the Unified SDK can handle complex workflows while maintaining simplicity for developers.
