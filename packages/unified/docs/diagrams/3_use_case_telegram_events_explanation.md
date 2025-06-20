# Telegram Events Use Case Diagram Explanation

## Diagram Overview

This sequence diagram demonstrates how **Telegram Mini-App events** (like quest completions, achievements, user actions) flow through the Unified Data Ingestion SDK/API system. It shows the first concrete example of how the metadata-driven architecture handles a real-world use case.

## What This Diagram Shows

### Current vs. New Data Flow

**Current Approach**: Telegram Mini-App → Activity SDK → Indexing Layer → Data Cloud  
**New Approach**: Telegram Mini-App → Unified SDK/API → (same underlying flow)

The key insight is that the **underlying data path remains identical**, but the client experience is dramatically simplified.

### Metadata Configuration for This Use Case

```json
{
  "processing": {
    "dataCloudWriteMode": "viaIndex", // Let Indexing Layer handle Data Cloud
    "indexWriteMode": "realtime" // Index immediately for real-time access
  }
}
```

### Step-by-Step Process Flow

1. **Client Request**: Telegram Mini-App calls `writeData()` with event payload and metadata
2. **Metadata Processing**: Rules Interpreter parses the metadata and determines routing
3. **Action Dispatching**: Dispatcher creates instructions to use Activity SDK
4. **Execution**: Orchestrator calls Activity SDK with the payload
5. **Storage Chain**: Activity SDK → Indexing Layer → Data Cloud (existing behavior)
6. **Response**: Success confirmation with transaction ID and Data Cloud hash

## Assignment Requirements Addressed

### Functional Requirements

- **FR-1: Single Entry Point**: Telegram app only calls the Unified SDK, not Activity SDK directly
- **FR-3: Support All Existing Use Cases**: This preserves the exact current behavior for Telegram events
- **FR-4: Idempotency Support**: Transaction ID enables request tracking and retry safety

### Use Case Requirements

- **UC-1: Telegram Mini App Events**: This diagram specifically addresses this requirement
- **Preservation of Behavior**: Same data ends up in same locations with same performance characteristics
- **Backward Compatibility**: Existing event processing logic is preserved

## Design Decisions Made

### 1. "viaIndex" Processing Mode

**Decision**: Use `dataCloudWriteMode: "viaIndex"` instead of `direct`  
**Rationale**:

- Preserves existing Indexing Layer → Data Cloud logic
- Maintains any business rules or transformations in the Indexing Layer
- Avoids changing data processing semantics during migration
- Keeps performance characteristics identical

### 2. "realtime" Index Mode

**Decision**: Use `indexWriteMode: "realtime"` for immediate indexing  
**Rationale**:

- Telegram events need to be searchable immediately for real-time features
- User activities should appear in dashboards without delay
- Aligns with current Activity SDK behavior

### 3. Preserve Activity SDK Path

**Decision**: Route through Activity SDK rather than HTTP API  
**Rationale**:

- Maintains existing event semantics and formatting
- Preserves any Activity SDK-specific logic
- Minimizes risk during migration
- Keeps the same error handling patterns

### 4. Transaction ID Response

**Decision**: Return transaction ID along with existing response fields  
**Rationale**:

- Enables request tracking and debugging
- Supports idempotency checking
- Provides correlation for monitoring and logging
- Maintains backward compatibility with additional info

## Process Description

### Event Processing Workflow

This diagram describes the **Telegram event ingestion process**:

1. **Event Generation**: User completes quest, achievement, or other activity in Telegram Mini-App
2. **Data Preparation**: Client app formats event data and processing metadata
3. **Unified Ingestion**: Single call to Unified SDK replaces Activity SDK call
4. **Metadata Interpretation**: System determines to use Activity SDK path
5. **Event Storage**: Data flows through existing Activity SDK → Indexing Layer → Data Cloud path
6. **Confirmation**: Client receives success confirmation with tracking information

### Data Flow Characteristics

- **Latency**: Same as current Activity SDK approach (sub-200ms target)
- **Reliability**: Same reliability guarantees as current system
- **Consistency**: Data appears in same locations with same timing
- **Monitoring**: Enhanced with transaction ID tracking

## Open Questions and Decisions Made

### Metadata Standardization

- **Question**: Should event metadata be standardized across Telegram apps?
- **Decision**: Allow flexible event payloads while standardizing processing metadata
- **Impact**: Easier migration, maintains existing event schemas

### Error Handling Strategy

- **Question**: How should Activity SDK errors be mapped to Unified SDK responses?
- **Decision**: Preserve existing error semantics while adding transaction context
- **Impact**: Consistent error handling experience for clients

## Relevance to Project

### Migration Strategy Validation

This use case demonstrates the **migration approach**:

- **Zero Breaking Changes**: Existing Telegram apps can migrate with minimal code changes
- **Performance Preservation**: Same underlying performance characteristics
- **Feature Preservation**: All existing features continue to work
- **Enhanced Observability**: Added transaction tracking without functional changes

### Developer Experience Improvement

**Before Migration**:

```typescript
// Client needs to know about Activity SDK
const activitySDK = new ActivitySDK(config);
const result = await activitySDK.writeEvent(eventData);
```

**After Migration**:

```typescript
// Client uses unified interface
const unifiedSDK = new UnifiedSDK(config);
const result = await unifiedSDK.writeData(eventData, {
  processing: {
    dataCloudWriteMode: "viaIndex",
    indexWriteMode: "realtime",
  },
});
```

### Business Value

- **Simplified Integration**: New Telegram Mini-Apps don't need to learn Activity SDK
- **Consistent Patterns**: Same interface for all data types
- **Better Monitoring**: Transaction IDs enable better tracking
- **Future Flexibility**: Easy to modify processing without client changes

## Integration with Other Diagrams

### Related Use Cases

- **Telegram Messages** (Diagram 3.1): Similar pattern but via HTTP API
- **Architecture Overview** (Diagram 1): Shows how this flow fits into overall system
- **Metadata Schema** (Diagram 2): Defines the metadata structure used here

### Testing Implications

- **Performance Testing**: Must match current Activity SDK performance
- **Integration Testing**: Verify end-to-end flow works identically
- **Migration Testing**: Ensure seamless transition from Activity SDK

## Next Steps

After understanding this use case:

1. Review **Telegram Messages Use Case** (Diagram 3.1) to see HTTP API variant
2. Compare with **Drone Telemetry Use Case** (Diagram 4) to understand parallel writes
3. Study **Error Handling Diagram** (Diagram 7) to understand failure scenarios
4. Examine **Migration Plan** (Diagram 13) to understand rollout strategy

This use case proves that the Unified SDK can preserve existing behavior while dramatically simplifying the client experience, making it a cornerstone validation of the entire project approach.
