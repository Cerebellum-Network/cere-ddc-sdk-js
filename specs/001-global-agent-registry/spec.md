# Feature Specification: Global Agent Registry Agreement & Signatures

**Feature Branch**: `001-global-agent-registry`  
**Created**: 2026-02-09  
**Status**: Draft  
**Input**: raw-prompt.md – Global Agent Registry agreement/revoke and required signatures on events/streams

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Register agreement with Global Agent Registry (Priority: P1)

As a developer I register an agreement so that an agent service is authorized for a user’s workspace/streams. I connect wallet, resolve data wallet, get user public key, then call the registry with userPublicKey, agentServiceId, workspaceId, streamId (or in metadata), optional metadata including TTL.

**Why this priority**: Core consent flow for agent access.

**Independent Test**: Call add-agreement API with signer and config; verify registry receives agreement (or mock).

**Acceptance Scenarios**:

1. **Given** signer and config (agentServiceId, workspaceId, streamId, cluster), **When** add agreement is called with optional TTL in metadata, **Then** registry stores agreement and returns success (or agreement id).
2. **Given** missing signer, **When** add agreement is called, **Then** initialization/wallet step fails or signer is required.

---

### User Story 2 - Revoke agreement (Priority: P2)

As a developer I revoke a previously registered agreement so the agent is no longer authorized for that scope. I use the same identity and scope (or agreement id).

**Why this priority**: Required for consent lifecycle.

**Independent Test**: After registering, call revoke with same identity/scope; verify registry revokes.

**Acceptance Scenarios**:

1. **Given** an existing agreement, **When** revoke is called with same user identity and scope (or agreement id), **Then** registry revokes and agent is no longer authorized.
2. **Given** no agreement, **When** revoke is called, **Then** appropriate error or no-op per contract.

---

### User Story 3 - Signatures on events and stream create/manage (Priority: P1)

As a developer I store events (DAG nodes) or create/update stream heads (CNS records) so that every such request includes a signature and the storage layer can verify identity and tie operations to agreements.

**Why this priority**: Constitution requires signatures; audit and agreement compliance.

**Independent Test**: Store a DAG node (event) and/or CNS record (stream head) with signer; verify signed activity request (and record signature for CNS) is sent.

**Acceptance Scenarios**:

1. **Given** DdcClient.store(bucketId, dagNode, { name }) with signer, **When** request is sent, **Then** DagApi.putNode receives signer and sends signed activity request in gRPC meta.
2. **Given** storeCnsRecord with signer, **When** request is sent, **Then** CnsApi.putRecord continues to require signer and send record signature (no regression).

### Edge Cases

- Agreement TTL expires: registry MAY expire agreement after metadata.ttl; client/agent handles expired agreement.
- Revoke by agreement id vs (userPublicKey, agentServiceId, scope): document and support one or both per registry contract.
- DagApi.putNode without signer (non-event path): decide whether signer remains optional for non-stream DAG stores or becomes required everywhere.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: SDK MUST provide a function to add agreement to Global Agent Registry (userPublicKey, agentServiceId, workspaceId, streamId or list, metadata including optional TTL).
- **FR-002**: SDK MUST provide a function to revoke agreement (same identity and scope or agreement id).
- **FR-003**: Agreement registration/revocation MUST be configurable with agentServiceId, workspaceId, streamId, environment/cluster; workspaceId and streamId MAY be in metadata; TTL in metadata (e.g. metadata.ttl seconds).
- **FR-004**: Before add/revoke agreement, client MUST follow init flow: connect wallet → create/resolve data wallet → get user public key → call registry.
- **FR-005**: When sending events (storing DAG nodes) or creating/managing streams (CNS records), requests MUST include signatures: DagApi.putNode MUST require signer for event/stream path and send signed activity request; CnsApi.putRecord MUST keep signer required and record signature.
- **FR-006**: SDK MUST reuse existing Signer, createSdkToken, createSignature, createActivityRequest; no new signing mechanism without justification.

### Key Entities

- **Agreement**: userPublicKey, agentServiceId, workspaceId, streamId(s), metadata (incl. optional TTL), optional agreement id returned by registry.
- **Registry client/config**: agentServiceId, workspaceId, streamId (or in metadata), cluster/environment, metadata (incl. TTL).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Developer can add and revoke agreements with Global Agent Registry from the SDK using existing signer/wallet.
- **SC-002**: All event and stream create/manage operations send signatures (activity request for putNode; record signature for putRecord).
- **SC-003**: Agreement TTL can be supplied in metadata and registry can expire agreements after that duration.
