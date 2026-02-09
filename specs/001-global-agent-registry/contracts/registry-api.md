# Global Agent Registry API Contract

**Feature**: 001-global-agent-registry  
**Date**: 2026-02-09  
**Status**: SDK-facing contract; backend protocol (REST/gRPC) TBD.

## Overview

The Global Agent Registry is an external service that stores and revokes user–agent agreements. The SDK will call it after the initialization flow (wallet → data wallet → user public key). This document defines the **logical** operations and payloads; the actual HTTP/gRPC surface will align with the backend when available.

## Operations

### Add Agreement

**Purpose**: Register that a user (identified by public key) has authorized an agent service for a given scope.

**Input** (logical payload):

| Field           | Type                    | Required | Description |
|-----------------|-------------------------|----------|-------------|
| userPublicKey   | bytes                   | Yes      | User's public key. |
| agentServiceId  | string                  | Yes      | Agent service identifier. |
| workspaceId     | string                  | No*      | Workspace scope (or in metadata). |
| streamId        | string \| string[]      | No*      | Stream ID(s) (or in metadata). |
| metadata        | object                  | No       | Optional; MUST allow `ttl` (number, seconds). May include cluster, workspaceId, streamId. |

**Output**: Success; optionally `agreementId` (string) for later revocation.

**Errors**: Network/registry errors surfaced to caller (e.g. invalid scope, duplicate, rate limit).

---

### Revoke Agreement

**Purpose**: Revoke a previously registered agreement so the agent is no longer authorized for that scope.

**Input** (one of):

- **By agreement id**: `agreementId` (string) returned from add agreement; identity may still be required for auth.
- **By composite**: `userPublicKey`, `agentServiceId`, and scope (workspaceId, streamId, or equivalent in metadata).

**Output**: Success.

**Errors**: Not found, unauthorized, network/registry errors.

## SDK interface (TypeScript)

The SDK will expose:

- `addAgreement(signer, config): Promise<{ agreementId?: string }>`  
  Resolves signer to userPublicKey, builds payload (config + metadata including optional TTL), calls registry.

- `revokeAgreement(signer, config | { agreementId }): Promise<void>`  
  Revokes by agreement id if provided, else by composite key from config and signer.

Config type: `AgreementConfig` (see data-model.md); must include agentServiceId; workspaceId, streamId, cluster, metadata (with optional ttl) as needed.

## Transport and discovery

- **Endpoint**: Discovered via config (e.g. cluster/environment: Dragon3). Exact URL or service name TBD with backend.
- **Auth**: Registry may require proof of user identity (signature over payload using signer); details TBD with backend.
- **Protocol**: REST or gRPC to be decided; SDK will abstract behind `GlobalAgentRegistryClient` so implementation can be swapped.
