# SDK Signature Changes (Events & Streams)

**Feature**: 001-global-agent-registry  
**Date**: 2026-02-09

## Required behavior (constitution)

- **DagApi.putNode**: Signer MUST be required (for all putNode calls per research); signed activity request MUST be sent in gRPC meta.
- **CnsApi.putRecord**: Signer already required; no change; keep record signature and activity request.

## Current vs target

| API / layer           | Current                         | Target |
|-----------------------|----------------------------------|--------|
| DagApi.putNode        | signer optional; if set, send activity request | signer **required**; always send signed activity request |
| StorageNode.storeDagNode | passes options to DagApi         | Ensure signer is required when calling putNode (node must have signer) |
| BalancedNode.storeDagNode | same                             | same |
| DdcClient.store(DagNode) | delegates to storeDagNode         | Ensure signer is required for store(DagNode) (client must be constructed with signer) |
| CnsApi.putRecord      | signer required; record + activity request     | No change |

## Contract (behavioral)

- **DagApi.putNode**: If `options.signer` is missing, throw (e.g. "Signer required for putNode") or ensure callers never invoke without signer. Always set `meta.request` from `createActivityRequest(..., { signer })` when node is present.
- **DdcClient**: When storing a DagNode, the client MUST have been constructed with a signer (or signer must be passed per call if that pattern exists); otherwise throw or refuse store(DagNode).
- **StorageNode / BalancedNode**: Constructed with signer; storeDagNode and storeCnsRecord already use it. No signature change for CNS; for DAG, putNode will require signer so the node must have signer in options.

## No new public function signatures

Existing functions gain a **requirement** (signer required) rather than new parameters. New functions are only for registry: `addAgreement`, `revokeAgreement` (see registry-api.md).
