# Drone Telemetry Use Case Diagram Explanation

## Diagram Overview

This sequence diagram demonstrates how **drone telemetry data** (GPS coordinates, sensor readings, flight status) flows through the Unified Data Ingestion SDK/API system. It shows the most complex use case requiring **parallel writes** to both Data Cloud and Indexing Layer simultaneously.

## What This Diagram Shows

### Current vs. New Data Flow

**Current Approach**: Drone → Parallel calls to Data Cloud SDK + Activity SDK  
**New Approach**: Drone → Unified SDK/API → Orchestrated parallel execution

This use case demonstrates the **most significant complexity reduction** for developers, as it eliminates the need to manually coordinate parallel writes.

### Metadata Configuration for This Use Case

```json
{
  "processing": {
    "dataCloudWriteMode": "direct", // Write directly to Data Cloud
    "indexWriteMode": "realtime" // Also index for real-time monitoring
  }
}
```

### Key Innovation: Parallel Execution

The diagram shows the Orchestrator executing two actions **in parallel**:

1. **Data Cloud Write**: Direct storage for compliance and immutable records
2. **Index Write**: Real-time indexing for monitoring dashboards and alerts

### Step-by-Step Process Flow

1. **Telemetry Generation**: Drone collects sensor data (GPS, altitude, battery, etc.)
2. **Data Preparation**: Drone client formats telemetry with processing metadata
3. **Unified Ingestion**: Single call to Unified SDK instead of dual SDK calls
4. **Parallel Dispatch**: Orchestrator initiates parallel writes to both systems
5. **Dual Storage**: Data Cloud SDK and Activity SDK execute simultaneously
6. **Response Coordination**: Success only when both writes complete successfully

## Assignment Requirements Addressed

### Functional Requirements

- **FR-1: Single Entry Point**: Drone only calls Unified SDK, not multiple SDKs
- **FR-3: Support All Existing Use Cases**: UC-3 (Drone Telemetry) requirement fulfilled
- **Complex Coordination**: System handles parallel write complexity automatically

### Use Case Requirements

- **UC-3: Drone Telemetry**: This diagram specifically addresses this requirement
- **Dual Storage**: Telemetry must be in both systems for compliance and monitoring
- **Real-time Processing**: Monitoring systems need immediate access to telemetry data

### Non-Functional Requirements

- **Performance**: Parallel execution maintains existing latency characteristics
- **Reliability**: Built-in coordination prevents partial failures from causing issues

## Design Decisions Made

### 1. "direct" Data Cloud Write Mode

**Decision**: Use `dataCloudWriteMode: "direct"` instead of `viaIndex`  
**Rationale**:

- **Compliance Requirements**: Telemetry must be in Data Cloud immediately for regulatory compliance
- **Performance**: Avoid double-write through Indexing Layer
- **Data Integrity**: Ensure exact telemetry data is preserved without transformation
- **Parallel Efficiency**: Both systems can write simultaneously

### 2. Parallel Execution Strategy

**Decision**: Execute Data Cloud and Index writes in parallel, not sequentially  
**Rationale**:

- **Performance**: Maintains current latency characteristics
- **Efficiency**: Doesn't increase total processing time
- **Fault Tolerance**: Independent execution reduces cascade failures
- **Scalability**: Better resource utilization

### 3. Atomicity vs. Performance Trade-off

**Decision**: Accept partial success scenarios with proper error handling  
**Rationale**:

- **Performance Priority**: Telemetry systems need low latency
- **Error Recovery**: Implement retry and reconciliation mechanisms
- **Operational Reality**: Current systems already handle partial failures
- **Monitoring**: Enhanced observability helps detect and resolve issues

### 4. Optional Batching Support

**Decision**: Provide batching alternative for high-volume telemetry  
**Rationale**:

- **Scalability**: High-frequency telemetry may benefit from batching
- **Resource Efficiency**: Reduce load on Data Cloud for high-volume drones
- **Flexibility**: Allow optimization based on telemetry patterns

## Process Description

### Telemetry Processing Workflow

This diagram describes the **drone telemetry ingestion process**:

1. **Data Collection**: Drone sensors collect GPS, altitude, speed, battery, system status
2. **Data Aggregation**: Drone client packages telemetry into structured payload
3. **Unified Ingestion**: Single SDK call replaces complex dual-write logic
4. **Parallel Execution**: System simultaneously writes to Data Cloud and Indexing Layer
5. **Compliance Storage**: Data Cloud provides immutable record for regulatory compliance
6. **Real-time Availability**: Indexing Layer enables immediate monitoring and alerts

### Data Characteristics

- **Volume**: High frequency (every 1-10 seconds during flight)
- **Content**: Structured telemetry (coordinates, sensors, status)
- **Requirements**: Immediate storage for compliance, real-time indexing for monitoring
- **Criticality**: High - flight safety and regulatory compliance depend on this data

## Open Questions and Design Challenges

### 1. Partial Failure Handling

**Question**: How should partial failures be handled?  
**Options**:

- **Accept Partial Success**: Continue with warnings/alerts
- **Require Full Success**: Retry until both succeed
- **Configurable Policy**: Allow per-client configuration

**Decision Made**: Accept partial success with comprehensive monitoring and automated reconciliation

### 2. Atomicity Requirements

**Question**: Is atomicity required across both storage systems?  
**Considerations**:

- **Performance Impact**: True atomicity would require distributed transactions
- **Complexity**: Would significantly complicate the architecture
- **Current Behavior**: Existing systems don't guarantee atomicity

**Decision Made**: Prioritize performance and simplicity, implement eventual consistency

### 3. Batching Strategy

**Question**: When should telemetry use batching vs. real-time processing?  
**Factors**:

- **Flight Phase**: Take-off/landing need real-time, cruise can batch
- **Data Volume**: High-frequency sensors benefit from batching
- **Emergency Situations**: Critical alerts need immediate processing

**Decision Made**: Support both modes, default to real-time with batching option

## Current Implementation Complexity

### Before Unified SDK

```typescript
// Drone client must coordinate dual writes
const dataCloudSDK = new DataCloudSDK(config);
const activitySDK = new ActivitySDK(config);

async function sendTelemetry(telemetryData) {
  try {
    // Complex parallel coordination
    const [dataCloudResult, indexResult] = await Promise.all([
      dataCloudSDK.writeData(telemetryData),
      activitySDK.writeEvent({
        type: "telemetry",
        data: telemetryData,
        timestamp: new Date(),
      }),
    ]);

    // Manual error handling for partial failures
    if (!dataCloudResult.success && !indexResult.success) {
      throw new Error("Both writes failed");
    } else if (!dataCloudResult.success) {
      console.warn("Data Cloud write failed, telemetry only in index");
    } else if (!indexResult.success) {
      console.warn("Index write failed, telemetry only in Data Cloud");
    }

    return { dataCloudHash: dataCloudResult.hash, indexId: indexResult.id };
  } catch (error) {
    // Complex retry logic needed
    console.error("Telemetry write failed:", error);
    throw error;
  }
}
```

### With Unified SDK

```typescript
// Simplified single call
const unifiedSDK = new UnifiedSDK(config);

async function sendTelemetry(telemetryData) {
  const result = await unifiedSDK.writeData(telemetryData, {
    processing: {
      dataCloudWriteMode: "direct",
      indexWriteMode: "realtime",
    },
  });

  return {
    transactionId: result.transactionId,
    dataCloudHash: result.dataCloudHash,
    indexId: result.indexId,
    status: result.status,
  };
}
```

## Advanced Use Case: Batched Telemetry

For high-frequency telemetry during cruise flight:

```json
{
  "processing": {
    "dataCloudWriteMode": "batch", // Batch for efficiency
    "indexWriteMode": "realtime" // Still monitor in real-time
  },
  "batchOptions": {
    "maxBatchSize": 50, // 50 telemetry points per batch
    "maxWaitTime": 30000 // Maximum 30 seconds delay
  },
  "priority": "normal" // Normal priority during cruise
}
```

## Relevance to Project

### Complexity Reduction

This use case demonstrates the **greatest developer benefit**:

- **Before**: Complex dual-write coordination in every drone client
- **After**: Simple single call with automatic coordination
- **Result**: Reduced bugs, easier testing, consistent error handling

### Architecture Validation

**Proves the Architecture Can Handle**:

- **Parallel Execution**: Multiple downstream systems simultaneously
- **Error Coordination**: Partial failure handling across systems
- **Performance Requirements**: Maintains low latency for critical telemetry

### Migration Value

**High-Impact Migration**:

- **Risk Reduction**: Eliminates complex client-side coordination code
- **Operational Benefits**: Centralized monitoring and error handling
- **Developer Productivity**: Significantly simplified telemetry integration

## Integration with Other Diagrams

### Related Components

- **Orchestrator** (Architecture Diagram 1): Shows how parallel execution is handled
- **Error Handling** (Diagram 7): Shows how partial failures are managed
- **Performance Benchmarks** (Diagram 11): Shows latency targets for telemetry

### Testing Requirements

- **Testing Matrix** (Diagram 9): Must validate parallel execution scenarios
- **Performance Testing**: Must verify latency meets telemetry requirements
- **Failure Testing**: Must validate partial failure handling

## Next Steps

After understanding this use case:

1. Review **Error Handling Diagram** (Diagram 7) to understand partial failure strategies
2. Study **Performance Benchmarks** (Diagram 12) to see telemetry latency requirements
3. Examine **Batch Mode Diagram** (Diagram 6) to understand batching alternatives
4. Review **Testing Matrix** (Diagram 9) for parallel execution validation

This use case represents the **most complex data flow** in the system and demonstrates that the Unified SDK can handle sophisticated coordination while dramatically simplifying the developer experience.
