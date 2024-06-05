[@cere-ddc-sdk/blockchain](../README.md) / DDCClusterGovPallet

# Class: DDCClusterGovPallet

This class provides methods to interact with the DDC Cluster Goverment pallet on the blockchain.

**`Example`**

```typescript
const clusterId = '0x...';
const protocolParams = { ... };
const member = ClusterMember.ClusterManager;

const tx = blockchain.ddcClusterGov.proposeUpdateClusterProtocol(clusterId, protocolParams, member);

await blockchain.send(tx, { account });
```

## Methods

### closeProposal

▸ **closeProposal**(`clusterId`, `member`, `podePublicKey?`): `Sendable`

This method allows to retract a local proposal within a cluster. Only the proposal's author can submit it.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `clusterId` | \`0x$\{string}\` | The ID of the cluster. |
| `member` | `ClusterMember` | The member who is retracting the proposal. |
| `podePublicKey?` | `string` | The public key of the node provider. Needed in case the member is ClusterMember.NodeProvider. |

#### Returns

`Sendable`

An extrinsic to retract the proposal.

**`Example`**

```typescript
const clusterId = '0x...';
const member = ClusterMember.ClusterManager;

const tx = blockchain.ddcClusterGov.retractProposal(clusterId, member);

await blockchain.send(tx, { account });
```

___

### proposeActivateClusterProtocol

▸ **proposeActivateClusterProtocol**(`clusterId`, `protocolParams`): `Sendable`

Creates a local proposal within a cluster, intended to activate the cluster in the network with specific protocol parameters such as validators, treasury fees, and pricing for stored and streamed bytes.
Only cluster members, namely the cluster manager and node providers, have voting rights on this proposal.
Furthermore, only the cluster manager has the authority to create this type of proposal.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `clusterId` | \`0x$\{string}\` | The ID of the cluster. |
| `protocolParams` | `ClusterProtocolParams` | - |

#### Returns

`Sendable`

___

### proposeUpdateClusterProtocol

▸ **proposeUpdateClusterProtocol**(`clusterId`, `protocolParams`, `member`, `nodePublicKey?`): `Sendable`

Creates a local proposal within a cluster, intended to update protocol parameters (like validators, treasury fee, pricing for stored and streamed bytes, etc.) of a previously activated cluster in the network.
Only cluster members, such as the cluster manager and node providers, can vote on this type of proposal.
Any cluster member has the ability to create this type of proposal.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `clusterId` | \`0x$\{string}\` | The ID of the cluster. |
| `protocolParams` | `ClusterProtocolParams` | The new protocol parameters. |
| `member` | `ClusterMember` | The member who is creating the proposal. |
| `nodePublicKey?` | `string` | - |

#### Returns

`Sendable`

An extrinsic to propose the update of the cluster protocol.

**`Example`**

```typescript
const clusterId = '0x...';
const protocolParams = { ... };
const member = ClusterMember.ClusterManager;

const tx = blockchain.ddcClusterGov.proposeUpdateClusterProtocol(clusterId, protocolParams, member);

await blockchain.send(tx, { account });
```

___

### refundSubmissionDeposit

▸ **refundSubmissionDeposit**(`referendaIndex`): `Sendable`

Refunds the submission deposit made by the proposal's author when creating a local proposal.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `referendaIndex` | `number` | The index of the referendum. |

#### Returns

`Sendable`

An extrinsic to refund the submission deposit.

**`Example`**

```typescript
const referendaIndex = 0;
const tx = blockchain.ddcClusterGov.refundSubmissionDeposit(referendaIndex);

await blockchain.send(tx, { account });
```

___

### retractProposal

▸ **retractProposal**(`clusterId`): `Sendable`

Closes a local proposal within a cluster. If the required approval threshold is met, it will automatically initiate a public referendum in the OpenGov.
Here, any CERE token holder can vote on the cluster's proposal, thereby influencing the network's economics.
If the required approval threshold is not met, the local (internal) proposal will be withdrawn without initiating a public referendum.
Any cluster member can close the proposal once the approval threshold or expiration time is reached.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `clusterId` | \`0x$\{string}\` | The ID of the cluster. |

#### Returns

`Sendable`

An extrinsic to retract the proposal.

**`Example`**

```typescript
const clusterId = '0x...';
const tx = blockchain.ddcClusterGov.retractProposal(clusterId);

await blockchain.send(tx, { account });
```

___

### voteProposal

▸ **voteProposal**(`clusterId`, `approve`, `member`, `podePublicKey?`): `Sendable`

Votes for a local proposal within a cluster. Only cluster members, such as the cluster manager and node providers, are permitted to vote.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `clusterId` | \`0x$\{string}\` | The ID of the cluster. |
| `approve` | `boolean` | Whether to approve the proposal. |
| `member` | `ClusterMember` | The member who is voting. |
| `podePublicKey?` | `string` | The public key of the node provider. Needed in case the member is ClusterMember.NodeProvider. |

#### Returns

`Sendable`

An extrinsic to vote on the proposal.

**`Example`**

```typescript
const clusterId = '0x...';
const approve = true;
const member = ClusterMember.ClusterManager;

const tx = blockchain.ddcClusterGov.voteProposal(clusterId, approve, member);

await blockchain.send(tx, { account });
```
