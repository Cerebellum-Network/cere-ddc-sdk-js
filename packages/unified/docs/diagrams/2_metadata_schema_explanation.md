# Metadata Schema Diagram Explanation

## Diagram Overview

This diagram defines the **core data structure** that drives the entire Unified Data Ingestion SDK/API system. The metadata schema is the "instruction manual" that tells the system how to process each piece of data, making this the most critical design decision in the project.

## What This Diagram Shows

### Metadata-Driven Processing Concept

The diagram illustrates how **metadata replaces complex client-side decision making**:

- Instead of clients choosing which SDK to use, they provide metadata
- The metadata contains processing instructions in a standardized format
- The system interprets these instructions to route data appropriately

### Core Schema Structure

#### MetadataProcessing Class

The main class that every request must include:

- **dataCloudWriteMode**: Controls how/if data goes to Data Cloud storage
- **indexWriteMode**: Controls how/if data goes to Indexing Layer
- **Optional fields**: Additional processing parameters for advanced use cases

#### Processing Mode Enumerations

Two key enums that define all possible routing combinations:

**DataCloudWriteMode Options:**

- `direct`: Write immediately to Data Cloud (bypassing Indexing Layer)
- `batch`: Buffer data and write to Data Cloud in batches
- `viaIndex`: Let the Indexing Layer handle Data Cloud storage
- `skip`: Don't store in Data Cloud at all

**IndexWriteMode Options:**

- `realtime`: Write to Indexing Layer immediately
- `skip`: Don't index this data

## Assignment Requirements Addressed

### Functional Requirements

1. **FR-2: Metadata-Driven Processing**: This diagram defines the exact structure of processing metadata
2. **FR-3: Support All Existing Use Cases**: The enum combinations cover all current data ingestion patterns
3. **Metadata Schema Specification**: Required deliverable for the architecture document

### Use Case Coverage

The schema enables all existing use cases through different combinations:

| Use Case          | dataCloudWriteMode | indexWriteMode | Current Equivalent                         |
| ----------------- | ------------------ | -------------- | ------------------------------------------ |
| Telegram Events   | viaIndex           | realtime       | Activity SDK → Indexing Layer → Data Cloud |
| Telegram Messages | viaIndex           | realtime       | HTTP API → Indexing Layer → Data Cloud     |
| Drone Telemetry   | direct             | realtime       | Parallel: Data Cloud SDK + Activity SDK    |
| Video Chunks      | direct             | skip           | Data Cloud SDK only                        |
| Video Events      | skip               | realtime       | Activity SDK only                          |

## Design Decisions Made

### 1. Declarative vs. Imperative Processing

**Decision**: Use declarative metadata instead of imperative API calls  
**Rationale**:

- Separates "what to do" from "how to do it"
- Allows processing logic changes without client updates
- Makes system behavior predictable and testable
- Enables future optimizations without breaking clients

### 2. Enum-Based Processing Modes

**Decision**: Use restricted enums rather than free-form strings  
**Rationale**:

- Prevents invalid combinations and typos
- Makes validation straightforward
- Provides clear contract between client and server
- Enables compile-time checking in strongly-typed languages

### 3. Required vs. Optional Fields

**Decision**: Only dataCloudWriteMode and indexWriteMode are required  
**Rationale**:

- Minimizes complexity for basic use cases
- Optional fields provide advanced capabilities
- Follows principle of "simple things should be simple"
- Allows gradual adoption of advanced features

### 4. Validation Rules

**Decision**: Implement business rules in the schema layer  
**Key Rule**: Both modes cannot be "skip" (data must go somewhere)  
**Rationale**:

- Catches configuration errors early
- Prevents data loss scenarios
- Makes invalid states unrepresentable

## Open Questions and Notes

### Optional Fields Design

The diagram includes a question about additional optional fields:

- **Question**: Are there other optional metadata fields needed?
- **Resolution**: Added fields for priority, TTL, encryption, and batching based on use case analysis
- **Future Extension**: Schema can be extended without breaking existing clients

## Process Description

This schema enables the following **metadata processing workflow**:

1. **Client Preparation**: Client application prepares payload and metadata
2. **Metadata Validation**: Rules Interpreter validates schema and business rules
3. **Rule Extraction**: System extracts processing instructions from metadata
4. **Action Planning**: Dispatcher maps processing rules to concrete actions
5. **Execution**: Orchestrator executes actions based on metadata instructions

### Example Processing Flow

```json
// Client sends this metadata:
{
  "processing": {
    "dataCloudWriteMode": "direct",
    "indexWriteMode": "realtime"
  }
}

// System interprets as:
// 1. Write to Data Cloud immediately using Data Cloud SDK
// 2. Write to Indexing Layer immediately using Activity SDK
// 3. Execute both actions in parallel
```

## Technical Implementation Details

### Validation Logic

The schema includes built-in validation:

- **Required field check**: Both processing modes must be specified
- **Business rule validation**: Cannot skip both storage locations
- **Enum validation**: Only allowed values accepted
- **Optional field validation**: Type and format checking for optional fields

### Extensibility Design

The schema is designed for future growth:

- **Backward Compatibility**: New optional fields don't break existing clients
- **Forward Compatibility**: Unknown fields are ignored (depending on implementation)
- **Version Evolution**: Schema can evolve while maintaining compatibility

## Relevance to Project

### Core Innovation

This metadata schema **is the key innovation** that makes the project possible:

- **Before**: Clients must understand and choose between 3 different SDKs
- **After**: Clients provide simple metadata and the system handles routing

### Business Impact

- **Developer Productivity**: Eliminates need to learn multiple SDK interfaces
- **Operational Flexibility**: Change routing logic without client updates
- **System Reliability**: Validation prevents common configuration errors
- **Future Growth**: Easy to add new processing modes or storage systems

### Integration with Other Components

This schema is used by every other component in the system:

- **Rules Interpreter**: Validates and processes this metadata
- **Dispatcher**: Uses processing modes to create actions
- **Use Case Diagrams**: Show how different metadata values create different flows
- **Testing Matrix**: Validates all valid metadata combinations

## Next Steps

After understanding this metadata schema:

1. Review **Use Case Diagrams** (3-5) to see how different metadata values create different data flows
2. Study **Component Descriptions** to understand how Rules Interpreter processes this schema
3. Examine **Testing Matrix** (Diagram 9) to see validation scenarios
4. Look at **Implementation Guide** for schema validation code examples

This metadata schema is the foundation that enables metadata-driven processing and makes the Unified Data Ingestion SDK/API both powerful and simple to use.
