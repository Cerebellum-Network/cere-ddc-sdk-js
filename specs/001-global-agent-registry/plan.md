# Implementation Plan: Global Agent Registry Agreement & Signatures

**Branch**: `001-global-agent-registry` | **Date**: 2026-02-09 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/001-global-agent-registry/spec.md` (from raw-prompt.md)

## Summary

Add two SDK capabilities: (1) **register and revoke agreements** with the Global Agent Registry Service (user public key, agentServiceId, workspaceId, streamId(s), metadata including optional TTL); (2) **require signatures** on event and stream create/manage operations (DagApi.putNode must require signer and send signed activity request for event/stream path; CnsApi.putRecord already requires signer). Initialization flow: connect wallet → create/resolve data wallet → get user public key → call registry. Reuse existing Signer, createSdkToken, createSignature, createActivityRequest. New code lives primarily in a registry client/module and in changes to DagApi/StorageNode/DdcClient for the signer requirement on putNode when used for events/streams.

## Technical Context

**Language/Version**: TypeScript (Node); see repo tsconfig and lerna packages  
**Primary Dependencies**: @cere-ddc-sdk/blockchain (Signer), @polkadot/api, existing ddc/grpc, auth (createSdkToken, AuthToken), signature and activity modules  
**Storage**: N/A (registry is external service; DDC storage unchanged)  
**Testing**: Jest (existing tests in tests/specs); add unit/integration for registry client and signature behavior  
**Target Platform**: Node.js and browser (existing SDK targets)  
**Project Type**: Monorepo (lerna); packages: ddc, ddc-client, blockchain, file-storage, cli  
**Performance Goals**: Registry add/revoke latency acceptable for consent flows; no regression on store/stream throughput  
**Constraints**: MUST reuse existing signing and identity infrastructure; MUST comply with constitution (agreement lifecycle, signatures required, init flow, config, reuse)  
**Scale/Scope**: New registry client + config types; changes to DagApi.putNode (require signer for event path) and possibly DdcClient/StorageNode; CnsApi.putRecord unchanged

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify compliance with principles in `.specify/memory/constitution.md`: Agreement Lifecycle (I), Signatures Required for Events/Streams (II), Initialization Flow (III), Configuration for Agreements (IV), Reuse of Signing Infrastructure (V). Gates are determined from these principles.

- **I Agreement Lifecycle**: Spec adds add-agreement and revoke-agreement functions; TTL in metadata. PASS.
- **II Signatures Required**: Spec requires DagApi.putNode to require signer and send signed activity request for event/stream path; CnsApi.putRecord remains required. PASS.
- **III Initialization Flow**: Spec requires wallet → data wallet → user public key → registry. PASS.
- **IV Configuration**: Spec requires agentServiceId, workspaceId, streamId, cluster, TTL in metadata. PASS.
- **V Reuse**: Spec requires reuse of Signer, createSdkToken, createSignature, createActivityRequest. PASS.

No violations. Re-check after Phase 1 design.

## Project Structure

### Documentation (this feature)

```text
specs/001-global-agent-registry/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (registry API contract)
└── tasks.md             # Phase 2 output (/speckit.tasks – not created by plan)
```

### Source Code (repository root)

```text
packages/
├── blockchain/          # Signer, wallet – no change
├── ddc/                 # DagApi, CnsApi, StorageNode, activity, signature, auth
│   └── src/
│       ├── DagApi/      # Change: require signer for putNode (event/stream path or always)
│       ├── CnsApi/      # No change (already requires signer)
│       ├── nodes/       # StorageNode, BalancedNode – pass signer requirement through
│       ├── activity/    # Reuse createActivityRequest
│       ├── signature/   # Reuse createSignature
│       └── [new]        # Registry client/module (add/revoke agreement) – TBD under ddc or new package
├── ddc-client/          # DdcClient.store(DagNode) – ensure signer required for event path
├── file-storage/        # No change
└── cli/                 # Optional: CLI for add/revoke agreement

tests/
├── specs/               # Add/expand tests for registry and putNode signer requirement
└── helpers/             # Existing
```

**Structure Decision**: Monorepo unchanged. New Global Agent Registry client can live in `packages/ddc/src/registry/` (or a new `packages/registry` if preferred). Signature changes are confined to `packages/ddc` (DagApi, nodes) and `packages/ddc-client` (store for DagNode). Contracts directory will describe the registry API (REST or gRPC) and SDK function signatures.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations. Leave table empty or omit.
