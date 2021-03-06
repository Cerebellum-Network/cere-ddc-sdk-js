# @cere-ddc-sdk/smart-contract

## Introduction

Client for interaction with DDC smart contract in blockchain.

## Smart contract API description

### Data model

#### Bucket status

```typescript
export class BucketStatus {
    bucket_id: bigint;
    bucket: Bucket;
    params: string;
    writer_ids: Array<string>;
    rent_covered_until_ms: string;
}

export class Bucket {
    owner_id: string;
    cluster_id: bigint;
    resource_reserved: bigint;
}
```

#### Cluster status

```typescript
export class ClusterStatus {
    cluster_id: bigint;
    cluster: Cluster;
    params: string;
}

export class Cluster {
    manager_id: string;
    vnodes: Array<bigint>;
    resource_per_vnode: bigint;
    resource_used: bigint;
    revenues: bigint;
    total_rent: bigint;
}
```

#### Node status

```typescript
export class NodeStatus {
    node_id: bigint;
    params: string
    node: Node
}

export class Node {
    provider_id: string;
    rent_per_month: number;
    free_resource: number;
}
```

### Options

#### Smart Contract
Smart Contract options with required configuration for connecting to blockchain network.

- `rpcUrl` - blockchain url address
- `contractAddress` - contract address in ss58 format
- `abi` - contract ABI as object

```typescript
export class SmartContractOptions {
    rpcUrl: string;
    contractAddress: string;
    abi: any
}
```

#### Bucket params

- `replication` - replication factor when store data in bucket
- `resource` - bucket size in GB

```typescript
export class BucketParams {
    replication: number;
    resource: number; // Resource reservation in GB
}
```

### Setup

Initialize and connect to blockchain TESTNET.

```typescript
import {SmartContract, TESTNET} from "@cere-ddc-sdk/smart-contract";

const secretPhrase = mnemonicGenerate();
const smartContract = await SmartContract.buildAndConnect(secretPhrase, TESTNET);
```

### Create bucket

Create new bucket in cluster 1 with replication factor 3.

```typescript
const clusterId = 1n;
const bucketParams = {replication: 3};
const {bucketId} = await smartContract.bucketCreate(clusterId, bucketParams);
```

### Get Bucket

Get bucket status.

```typescript
const bucketId = 1n;
const bucketStatus = await smartContract.bucketGet(bucketId);
```

### Get Bucket List

Get bucket status.

```typescript
const bucketId = 1n;
const bucketStatus = await smartContract.bucketGet(bucketId);
```

### Account Deposit

Deposit tokens to DDC account for bucket payment.

```typescript
const value = 10n;
await smartContract.accountDeposit(value);
```

### Bucket allocate into cluster

Add resources for bucket (bucket size)

```typescript
const bucketId = 1n;
const resource = 3n;
await smartContract.bucketAllocIntoCluster(bucketId, resource);
```

[### Grant Bucket permission

Grant write permission to user by public key.

```typescript
import {Permission} from "@cere-ddc-sdk/smart-contract";

const bucketId = 1n;
const partnerPublicKeyHex = "0xkldaf3a8as2109...";
await smartContract.bucketGrantPermission(bucketId, partnerPublicKeyHex, Permission.WRITE);
```

### Revoke Bucket permission

Revoke write permission for user

```typescript
import {Permission} from "@cere-ddc-sdk/smart-contract";

const bucketId = 1n;
const partnerPublicKeyHex = "0xkldaf3a8as2109...";
await smartContract.bucketRevokePermission(bucketId, partnerPublicKeyHex, Permission.WRITE);
```]: #

### Get Cluster

Get cluster status

```typescript
const clusterId = 1;
const clusterStatus = await smartContract.clusterGet(clusterId);
```

### Get Node

Get node status

```typescript
const nodeId = 1;
const clusterStatus = await smartContract.nodeGet(nodeId);
```