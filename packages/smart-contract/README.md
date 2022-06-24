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

Smart Contract options with required configuration for connecting to blockchain network.

- `rpcUrl` - blockchain url address
- `contractAddress` - contract address in ss58 format
- `abi` - contract ABI as object

```typescript
export class Options {
    rpcUrl: string;
    contractAddress: string;
    abi: any
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
const {bucketId} = await smartContract.bucketCreate(10n, '{"replication": 3}', clusterId);
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