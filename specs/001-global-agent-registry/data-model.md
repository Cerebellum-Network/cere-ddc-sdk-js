# Data Model: Global Agent Registry Agreement & Signatures

**Feature**: 001-global-agent-registry  
**Date**: 2026-02-09

## Entities

### Agreement (registry payload / SDK view)

Represents the consent record sent to or returned by the Global Agent Registry.

| Field            | Type                    | Required | Description |
|------------------|-------------------------|----------|--------------|
| userPublicKey    | bytes / Uint8Array      | Yes      | User's public key from signer. |
| agentServiceId   | string                  | Yes      | Identifier of the agent service being authorized. |
| workspaceId      | string                  | No*      | Workspace scope; may be in metadata. |
| streamId         | string \| string[]      | No*      | Single stream ID or list; may be in metadata. |
| metadata         | Record<string, unknown> | No       | Optional; must support `ttl` (number, seconds). May include workspaceId, streamId, cluster, etc. |
| agreementId      | string                  | No       | Set when registry returns it after registration; used for revoke by id. |

*Required for semantic scope but may be supplied inside `metadata` if registry accepts.

**Validation**: userPublicKey and agentServiceId MUST be non-empty. If TTL is in metadata, it MUST be a non-negative number (seconds). workspaceId/streamId either top-level or in metadata per registry contract.

**State**: Agreement is created when sent to registry; it may expire after metadata.ttl seconds (registry behavior). Revocation removes or marks it revoked.

### AgreementConfig (SDK input for add/revoke)

Configuration used when calling add agreement or revoke agreement.

| Field          | Type                    | Required | Description |
|----------------|------------------------|----------|-------------|
| agentServiceId | string                 | Yes      | Agent service identifier. |
| workspaceId    | string                 | No*      | Workspace scope. |
| streamId       | string \| string[]     | No*      | Stream ID(s). |
| cluster        | string                 | No       | Environment/cluster (e.g. Dragon3) for registry endpoint. |
| metadata       | Record<string, unknown>| No       | Optional; must allow `ttl` (seconds). |

*At least one of workspaceId/streamId or equivalent in metadata typically required for scope.

### No new persistent storage in SDK

Agreements are stored by the Global Agent Registry (external). SDK holds config and optionally caches agreement id for revocation; no local DB.

## Relationships

- **Signer → userPublicKey**: One signer yields one userPublicKey (after isReady()). Used in every add/revoke and in event/stream signatures.
- **AgreementConfig → Agreement**: Config (plus userPublicKey from signer) is the payload for add agreement. Same identity + config used to revoke (or agreementId if available).

## Existing entities (unchanged, referenced)

- **CnsRecord**: name, cid; already has signature (CnsApi.putRecord). Stream head = CNS record with stream name.
- **ActivityRequest**: requestType, bucketId, size, signature, etc.; sent in gRPC meta for putNode/putRecord. Must be sent for every putNode when signer is required.
- **Signer** (blockchain package): type, address, publicKey, sign(); used for createSignature and createActivityRequest.
