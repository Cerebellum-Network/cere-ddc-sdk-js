# Research: Global Agent Registry Agreement & Signatures

**Feature**: 001-global-agent-registry  
**Date**: 2026-02-09

## 1. Global Agent Registry API surface

**Decision**: Define a minimal SDK-facing contract (add agreement, revoke agreement) and document the registry as an external service. Actual transport (REST, gRPC) and endpoint discovery (cluster/env, e.g. Dragon3) to be aligned with backend registry implementation.

**Rationale**: No Global Agent Registry exists in the repo today; the backend contract may not be final. SDK should depend on an abstract interface (e.g. `GlobalAgentRegistryClient`) so that the real endpoint and protocol can be wired in or mocked in tests.

**Alternatives considered**: (a) Assume REST from day one – rejected to avoid locking protocol. (b) Assume gRPC to match DDC nodes – possible later; not assumed until backend is defined.

## 2. When to require signer for DagApi.putNode

**Decision**: Require signer for **all** `putNode` calls (simplest and satisfies constitution: every event/stream operation must send signatures). If product requires optional signer for non-event DAG stores, introduce an explicit option (e.g. `requireSignature: boolean`) later; default MUST be true for event/stream usage.

**Rationale**: Constitution states "DagApi.putNode: Signer MUST be required for the event/stream path; a signed activity request MUST always be sent." Requiring signer for all putNode avoids path ambiguity (whether a node is an "event" or not) and keeps audit consistent.

**Alternatives considered**: (a) Require signer only when `options.name` is set (stream head update) – rejected because the event itself is stored via putNode without name; the name is set on the following storeCnsRecord. (b) Require signer only when a "stream mode" is enabled – adds complexity; can be revisited if non-event DAG stores must remain signer-optional.

## 3. TTL semantics for agreements

**Decision**: TTL is optional; when present, supplied in `metadata` (e.g. `metadata.ttl`). Unit: seconds. Registry MAY expire the agreement after that duration. SDK does not enforce TTL locally; it is a hint to the registry. Max/min TTL values are registry-specific and can be documented in contracts when backend is known.

**Rationale**: Raw-prompt and constitution specify TTL in metadata; seconds are a common choice. Keeps SDK agnostic of registry expiry implementation.

**Alternatives considered**: (a) TTL as top-level parameter – rejected; raw-prompt and constitution say TTL in metadata. (b) SDK enforces max TTL – deferred to registry; SDK passes value through.

## 4. Revocation: by agreement id vs (user, agentServiceId, scope)

**Decision**: Support both if the registry API allows: revoke by **agreement id** (when registration returns one) and/or by **(userPublicKey, agentServiceId, scope)**. Document in contracts which the registry accepts; SDK can offer overloads or a single function with optional agreementId.

**Rationale**: Raw-prompt says "by agreement id, or by same key set". Flexibility avoids forcing registry to persist agreement ids if it uses composite key only.

**Alternatives considered**: (a) Only agreement id – rejected; some registries may not return ids. (b) Only composite key – acceptable; add agreement-id path when backend supports it.

## 5. Placement of registry client

**Decision**: Implement the registry client inside `packages/ddc` (e.g. `packages/ddc/src/registry/` or `GlobalAgentRegistry.ts`) so it can use the same transport and auth patterns (signer, token). If it grows and has no DDC storage dependency, it could be moved to a separate package later.

**Rationale**: Reuse of Signer and init flow is constitution-mandated; ddc already has signer, auth, and transport. Keeps dependency graph simple.

**Alternatives considered**: (a) New package `@cere-ddc-sdk/registry` – possible later; not needed for initial scope. (b) In ddc-client only – rejected; client is high-level; registry is a distinct capability that may be used without DdcClient.

## 6. Best practices referenced

- **Identity**: Reuse `signer.publicKey` after `signer.isReady()`; do not introduce new key derivation for registry.
- **Errors**: Registry errors (network, 4xx/5xx or gRPC status) must be surfaced to the caller; avoid swallowing errors.
- **Testing**: Mock the registry in unit tests; integration tests can use a stub or real registry when available.
