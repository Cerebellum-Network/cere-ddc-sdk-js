# Quickstart: Global Agent Registry & Signatures (001-global-agent-registry)

**Feature**: 001-global-agent-registry  
**Date**: 2026-02-09

## Prerequisites

- Node.js and npm (see repo root .nvmrc).
- Built SDK: `npm run build` at repo root.
- Signer (e.g. from `@cere-ddc-sdk/blockchain`): UriSigner, KeyringSigner, or CereWalletSigner.
- Global Agent Registry endpoint/config for your environment (e.g. Dragon3); not yet implemented in repo – use mock or stub for local dev.

## 1. Add and revoke agreement (planned API)

```typescript
import { createSdkToken } from '@cere-ddc-sdk/ddc'; // or from auth module
import { UriSigner } from '@cere-ddc-sdk/blockchain';
// When implemented:
// import { addAgreement, revokeAgreement } from '@cere-ddc-sdk/ddc';

const signer = new UriSigner('your mnemonic or uri');
await signer.isReady();

const config = {
  agentServiceId: 'my-agent-id',
  workspaceId: 'workspace-1',
  streamId: 'stream-1',
  cluster: 'Dragon3',
  metadata: { ttl: 3600 }, // optional, seconds
};

// Add agreement (user authorizes agent for scope)
// const result = await addAgreement(signer, config);
// const agreementId = result.agreementId;

// Later: revoke
// await revokeAgreement(signer, config);
// or: await revokeAgreement(signer, { agreementId });
```

## 2. Initialization flow (before registry calls)

1. Connect wallet: use Signer (e.g. UriSigner), call `await signer.isReady()`.
2. Data wallet: create or resolve via existing DDC patterns (e.g. createSdkToken(signer) for auth token).
3. User public key: `signer.publicKey` (bytes) after isReady().
4. Call registry: addAgreement(signer, config) or revokeAgreement(signer, config).

## 3. Events and streams (signatures required)

When storing events (DAG nodes) or updating stream heads (CNS records), the SDK will require a signer and send signatures:

- **Store event (DAG node)** and optional stream name:
  - Use DdcClient or StorageNode with signer configured.
  - `client.store(bucketId, dagNode, { name: streamCnsName })` will require signer; DagApi.putNode will always send signed activity request.

- **CNS (stream head)**:
  - CnsApi.putRecord already requires signer and signs the record; no change.

Example (existing pattern; signer will be required for store(DagNode)):

```typescript
const client = await DdcClient.create(mnemonicOrSigner, { ...TESTNET, signer });
const rootEvent = new DagNode(JSON.stringify({ type: 'event', time: new Date().toISOString() }), []);
const uri = await client.store(bucketId, rootEvent, { name: 'my-stream' });
```

## 4. Running tests

From repo root:

- `npm run test` – run all package tests.
- Tests for this feature (when added): in `tests/specs/` or under `packages/ddc`; mock the registry for unit tests.

## 5. Implementation status

- **Spec and plan**: Done (spec.md, plan.md, research.md, data-model.md, contracts/, this quickstart).
- **Code**: Not yet implemented; registry client and DagApi.putNode signer requirement are pending implementation and tasks breakdown (/speckit.tasks).
