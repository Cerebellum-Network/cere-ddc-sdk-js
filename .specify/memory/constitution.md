<!--
Sync Impact Report
==================
Version change: 1.0.0 → 1.1.0
Modified principles: I (Agreement Lifecycle) – add TTL in metadata; IV (Configuration for Agreements) – add TTL in metadata
Added sections: none
Removed sections: none
Templates requiring updates:
  - .specify/templates/plan-template.md: ✅ no change needed
  - .specify/templates/spec-template.md: ✅ no change needed
  - .specify/templates/tasks-template.md: ✅ no change needed
Follow-up TODOs: none
-->

# Cere DDC SDK Constitution

## Core Principles

### I. Agreement Lifecycle with Global Agent Registry

The SDK MUST support registering and revoking agreements with the Global Agent Registry Service. Agreements bind the user (via public key) to an agent service and scope.

- Provide a function to **add agreement**: register with the registry `userPublicKey`, `agentServiceId`, `workspaceId`, `streamId` (or list), and optional `metadata` (e.g. cluster). `workspaceId` and `streamId` MAY be supplied as part of `metadata` where the registry supports it. **TTL (time-to-live)** for the agreement MUST be includable in `metadata` (e.g. `metadata.ttl` in seconds); when set, the registry MAY expire the agreement after that duration.
- Provide a function to **revoke agreement**: first-class operation using the same identity (public key / signer) and scope (or agreement id) so the registry can locate and revoke the correct agreement.
- Rationale: Enables consent and authorization for agent access to user data and streams.

### II. Signatures Required for Events and Streams

When the client sends events or creates/manages streams, requests MUST include signatures so the storage/node layer can verify identity and tie operations to agreements.

- **DagApi.putNode** (event/DAG store): Signer MUST be required for the event/stream path; a signed activity request MUST always be sent in gRPC meta.
- **CnsApi.putRecord** (stream head / CNS): Signer is already required; keep required and ensure used for all stream head updates (name → CID).
- Reuse existing `createSignature`, `createActivityRequest`, and gRPC meta; do not introduce new signing mechanisms without justification.
- Rationale: Audit and agreement compliance require every event/stream operation to be attributable to a signed identity.

### III. Initialization Flow Before Registry Operations

Before calling add or revoke agreement, the client MUST follow this initialization flow:

1. Connect to wallet API (existing wallet/signer integration).
2. Create or resolve data wallet (using existing wallet/DDC patterns).
3. Obtain user public key from the signer (e.g. after `signer.isReady()`).
4. Call Global Agent Registry to register or revoke with the same identity.

Rationale: Ensures the registry always receives a resolved identity and data wallet context.

### IV. Configuration for Agreements

Agreement registration and revocation MUST require or accept configuration for: `agentServiceId`, `workspaceId`, `streamId` (single or list), and environment/cluster (e.g. Dragon3). `workspaceId` and `streamId` MAY be provided as part of `metadata` when the registry contract allows. **TTL** for the agreement MUST be passable in `metadata` (e.g. `metadata.ttl` in seconds); optional; when set, the registry MAY expire the agreement after that duration.

Rationale: Enables correct targeting of registry and scope for consent and revocation, and allows time-bounded agreements via TTL in metadata.

### V. Reuse of Signing and Identity Infrastructure

New features involving identity or signing MUST reuse the existing Signer abstraction (`@cere-ddc-sdk/blockchain`), `createSdkToken`, `AuthToken`, `createSignature`, and `createActivityRequest` where applicable. New signing paths or token types require explicit justification.

Rationale: Keeps identity and audit behavior consistent and avoids fragmentation.

## Additional Constraints

- Event/stream operations MUST be tied to a signed identity; the storage/node layer MUST be able to verify the requester and relate operations to agreements.
- Global Agent Registry is a new capability; no existing types in the repo implement it—new code MUST integrate with existing signer/token patterns.
- At least the existing activity-request signature MUST be sent for event/stream operations; if the backend later requires a payload signature (e.g. on DAG node), the spec MUST require it and the API MAY be extended.

## Development Workflow

- Changes that affect events, streams, or the Global Agent Registry MUST comply with principles I (Agreement Lifecycle), II (Signatures Required), and III (Initialization Flow).
- PRs and reviews MUST verify compliance with these principles where the change touches `DagApi.putNode`, `CnsApi.putRecord`, `DdcClient.store` (DagNode), or any new registry/agreement API.
- Complexity that relaxes signature requirements or bypasses the initialization flow MUST be justified and documented.

## Governance

- This constitution supersedes ad-hoc practice for agreement, signature, and initialization behavior.
- Amendments require a version bump (semantic: MAJOR = backward-incompatible principle removal/redefinition; MINOR = new principle or material expansion; PATCH = clarifications, typos), documentation of the change, and updated Sync Impact Report.
- All PRs and reviews MUST verify compliance with the constitution where the change touches the areas above.
- Use the feature spec and plan templates in `.specify/templates/` for new features; Constitution Check in plans MUST reference this file for gates.

**Version**: 1.1.0 | **Ratified**: 2026-02-09 | **Last Amended**: 2026-02-09
