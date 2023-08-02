# @cere-ddc-sdk/smart-contract

The package provides API for interacting with DDC Smart Contract on the Cere blockchain.

# Installation

Using `NPM`:

```bash
npm install @cere-ddc-sdk/smart-contract --save
```

Using `yarn`:

```bash
yarn add @cere-ddc-sdk/smart-contract
```

# Create an instance

The `SmartContract` instance can be created in two ways:

1.  Using the class constructor

    ```ts
    import {ApiPromise, WsProvider} from '@polkadot/api';
    import {ContractPromise} from '@polkadot/api-contract';
    import {SmartContract, DEVNET} from '@cere-ddc-sdk/smart-contract';

    const {rpcUrl, contractAddress, abi} = DEVNET;

    const provider = new WsProvider(rpcUrl);
    const api = await ApiPromise.create({provider});
    const contract = new ContractPromise(api, abi, contractAddress);
    const keyringPair = new Keyring({type: 'sr25519'}).addFromUri('//Alice');

    const smartContractInstance = new SmartContract(keyringPair, contract);
    ```

    This approach is quite verbose and requires several extra packages. It can be used if you already have `api` and blockchain `contract` instances in your app.

2.  Using the `SmartContract.buildAndConnect` static method

    ```ts
    import {SmartContract, DEVNET} from '@cere-ddc-sdk/smart-contract';

    const seedOrPair = '...'; // Seed phrase or keyring pair
    const smartContractInstance = await SmartContract.buildAndConnect(seedOrPair, DEVNET);
    ```

    or with external signer

    ```ts
    import { Signer } from '@polkadot/api/types';
    import { SmartContract, DEVNET } from '@cere-ddc-sdk/smart-contract';

    const address = '...'; // Account address
    const signer: Signer = {...}: // External signer
    const smartContractInstance = await SmartContract.buildAndConnect(address, DEVNET, signer);
    ```

    `buildAndConnect` takes care of the following boilerplate that otherwise needs to be provided.

# API

`SmartContract` instance methods

-   [connect()](#connect)
-   [disconnect()](#disconnect)
-   [accountGet()](#accountget)
-   [bucketList()](#accountget)
-   [bucketGet()](#bucketget)
-   [bucketCreate()](#bucketcreate)
-   [bucketAllocIntoCluster()](#bucketallocintocluster)
-   [accountDeposit()](#accountdeposit)
-   [accountBond()](#accountbond)
-   [grantTrustedManagerPermission()](#granttrustedmanagerpermission)
-   [nodeCreate()](#nodecreate)
-   [nodeRemove()](#noderemove)
-   [cdnNodeCreate()](#cdnnodecreate)
-   [cdnNodeRemove()](#cdnnoderemove)
-   [clusterCreate()](#clustercreate)
-   [clusterAddNode()](#clusteraddnode)
-   [clusterRemoveNode()](#clusterremovenode)
-   [clusterAddCdnNode()](#clusteraddndnnode)
-   [clusterRemoveCdnNode()](#clusterremovecdnNode)
-   [clusterRemove()](#clusterremove)
-   [clusterSetNodeStatus()](#clustersetnodestatus)
-   [clusterSetCdnNodeStatus()](#clustersetcdnnodestatus)
-   [cdnNodeSetParams()](#cdnnodesetparams)
-   [nodeSetParams()](#nodesetparams)
-   [clusterSetResourcePerVNode()](#clustersetresourcepervnode)
-   [clusterSetParams()](#clustersetparams)
-   [clusterList()](#clusterlist)
-   [clusterGet()](#clusterget)
-   [nodeList()](#nodelist)
-   [cdnNodeList()](#cdnnodelist)
-   [cdnNodeGet()](#cdnnodeget)
-   [nodeGet()](#nodeget)

## connect()

This method ensures that the blockchain connection is established and the instance is ready to be used.

```ts
await smartContractInstance.connect();
```

## disconnect()

Disconnects the blockchain connection in case the connection is established in `buildAndConnect`. If an external `api` instance has been provided - does nothing.

```ts
await smartContractInstance.disconnect();
```

## accountGet()

This method returns the current status of an account.

**Arguments**

-   `accountAddress` - the requested account address (`AccountId`)

**Usage example**

```ts
import {AccountId, Account} from '@cere-ddc-sdk/smart-contract/types';

const accountAddress: AccountId = '0x...';
const account: Account = await smartContractInstance.accountGet(accountAddress);
```

## bucketList()

This method returns paginated list of all buckets with optional filter by owner.

**Arguments**

-   `offset` - starting offset. The list will start from `0` offset if this argument is omitted or `null`
-   `limit` - limits the result list length. All items will be returned if this argument is omitted or `null`
-   `filterOwnerId` - optional filter by owner address

**Usage example**

```ts
import {AccountId, Offset} from '@cere-ddc-sdk/smart-contract/types';

const offset: Offset = 10n;
const limit: Offset = 100n;
const filterOwnerId: AccountId = '0x...';

const [bucketStatuses, totalCount] = await smartContractInstance.bucketList(offset, limit, filterOwnerId);
```

## bucketGet()

This method returns the current status of a bucket.

**Arguments**

-   `bucketId` - requested bucket ID

**Usage example**

```ts
import {BucketId, BucketStatus} from '@cere-ddc-sdk/smart-contract/types';

const bucketId: BucketId = 1n;

const bucketStatus: BucketStatus = await smartContractInstance.bucketGet(bucketId);
```

## bucketCreate()

This method creates a new bucket and returns its ID. The caller will be its first owner and payer of resources.

**Arguments**

-   `ownerAddress` - the bucket owner account address
-   `clusterId` - the ID of a cluster to which the bucket will be connected
-   `bucketParams` - the bucket configuration used by clients and nodes

**Usage example**

```ts
import {AccountId, ClusterId, BucketParams, BucketId} from '@cere-ddc-sdk/smart-contract/types';

const ownerAddress: AccountId = '0x...';
const clusterId: ClusterId = 1;
const bucketParams: BucketParams = {
    replication: 1,
};

const bucketId: BucketId = await smartContractInstance.bucketCreate(ownerAddress, clusterId, bucketParams);
```

## bucketAllocIntoCluster()

Allocate some resources of a cluster to a bucket. The amount of resources is given per vNode (total resources will be `resource` times the number of vNodes).

**Arguments**

-   `bucketId` - The ID of a bucket to allocate resources for
-   `resource` - The amount of allocated resources

**Usage example**

```ts
import {BucketId, Resource} from '@cere-ddc-sdk/smart-contract/types';

const bucketId: BucketId = 1n;
const resourcesToAllocate: Resource = 100n;

await smartContractInstance.bucketAllocIntoCluster(bucketId, resourcesToAllocate);
```

## accountDeposit()

This method deposits tokens on the account of the caller from the transaction value. This deposit can be used to pay for the services to buckets of the account.

**Arguments**

-   `value` - The amount of tokens to deposit

**Usage example**

```ts
import {Balance} from '@cere-ddc-sdk/smart-contract/types';

const value: Balance = 100n; // 100 CERE tokens

await smartContractInstance.accountDeposit(value);
```

## accountBond()

This method bonds some amount of tokens from the withdrawable balance. These funds will be used to pay for CDN node service.

**Arguments**

-   `value` - The amount of tokens to bond

**Usage example**

```ts
import {Balance} from '@cere-ddc-sdk/smart-contract/types';

const value: Balance = 10n; // 10 CERE tokens

await smartContractInstance.accountBond(value);
```

## grantTrustedManagerPermission()

This method grants grants permissions for a cluster manager to manage Storage or CDN node owner. After the permission is granted, the cluster manager can add nodes to the cluster. Permissions can be granted by Storage or CDN node owner.

**Arguments**

-   `managerAddress` - the manager account address to grant permissions to

**Usage example**

```ts
import {AccountId} from '@cere-ddc-sdk/smart-contract/types';

const managerAddress: AccountId = '0x...';

await smartContractInstance.grantTrustedManagerPermission(managerAddress);
```

## nodeCreate()

This method creates a storage node with specific parameters. The caller will be the node owner (node provider).

**Arguments**

-   `nodeKey` - public key of the storage node that is treated as the node identifier
-   `nodeParams` - the storage node params
-   `capacity` - measure used to evaluate physical node hardware resources
-   `rentPerMonth` - renting per month

**Usage example**

```ts
import {NodeKey, Resource, Balance, NodeParams} from '@cere-ddc-sdk/smart-contract/types';

const nodeKey: NodeKey = '0x...';
const capacity: Resource = 1000n;
const rentPerMonth: Balance = 100n;
const nodeParams: NodeParams = {
    url: 'https://...',
};

await smartContractInstance.nodeCreate(nodeKey, nodeParams, capacity, rentPerMonth);
```

## nodeRemove()

This method removes the targeting CDN Node if it is not added to some cluster. Only a node that is not a member of some cluster can be removed.

**Arguments**

-   `nodeKey` - public key associated with the CDN node

**Usage example**

```ts
import {NodeKey} from '@cere-ddc-sdk/smart-contract/types';

const nodeKey: NodeKey = '0x...';

await smartContractInstance.nodeRemove(nodeKey);
```

## cdnNodeCreate()

This method creates a CDN node with specific parameters. The caller will be the node owner (node provider).

**Arguments**

-   `cdnNodeKey` - public key of the CDN node that is treated as node identifier
-   `cdnNodeParams` - the CDN node params

**Usage example**

```ts
import {NodeKey, CdnNodeParams} from '@cere-ddc-sdk/smart-contract/types';

const cdnNodeKey: NodeKey = '0x...';
const cdnNodeParams: NodeParams = {
    url: 'https://...',
};

await smartContractInstance.cdnNodeCreate(cdnNodeKey, cdnNodeParams);
```

## cdnNodeRemove()

This method removes the targeting CDN Node if it is not added to some cluster. Only a node that is not a member of some cluster can be removed.

**Arguments**

-   `cdnNodeKey` - public key associated with the CDN node

**Usage example**

```ts
import {NodeKey} from '@cere-ddc-sdk/smart-contract/types';

const cdnNodeKey: NodeKey = '0x...';

await smartContractInstance.cdnNodeRemove(cdnNodeKey);
```

## clusterCreate()

This method creates a cluster of storage nodes and CDN nodes with specific parameters and returns its ID. The caller will be the cluster manager (cluster owner).

Returns ID of the created cluster.

**Arguments**

-   `clusterParams` - the cluster node params
-   `resourcePerVNode` - Resource value that will be allocated for every virtual node in the cluster

**Usage example**

```ts
import {ClusterParams, Resource, ClusterId} from '@cere-ddc-sdk/smart-contract/types';

const resourcePerVNode: Resource = 500n;
const clusterParams: ClusterParams = {
    replicationFactor: 3,
};

const clusterId: ClusterId = await smartContractInstance.clusterCreate(clusterParams, resourcePerVNode);
```

## clusterAddNode()

This method adds a physical storage node along with its virtual nodes to the targeting cluster. Virtual nodes determines a token (position) on the ring in terms of Consistent Hashing. The storage node can be added to the cluster by cluster manager only.

**Arguments**

-   `clusterId` - ID of the targeting cluster
-   `nodeKey` - public key associated with the storage node
-   `vNodes` - list of tokens (positions) related to the storage node

**Usage example**

```ts
import {ClusterId, VNodeId, NodeKey} from '@cere-ddc-sdk/smart-contract/types';

const clusterId: ClusterId = 1;
const nodeKey: NodeKey = '0x...';
const vNodes: VNodeId[] = [3074457345618258602n, 12297829382473034408n];

await smartContractInstance.clusterAddNode(clusterId, nodeKey, vNodes);
```

## clusterRemoveNode()

This method removes a physical storage node along with its virtual nodes from the targeting cluster. The storage node can be removed from the cluster either by cluster manager or by the node owner.

**Arguments**

-   `clusterId` - ID of the targeting cluster
-   `nodeKey` - public key associated with the storage node

**Usage example**

```ts
import {NodeKey, ClusterId} from '@cere-ddc-sdk/smart-contract/types';

const clusterId: ClusterId = 1n;
const nodeKey: NodeKey = '0x...';

await smartContractInstance.clusterRemoveNode(clusterId, nodeKey);
```

## clusterAddCdnNode()

This method adds a CDN node to the targeting cluster. The CDN node can be added to the cluster by cluster manager only.

**Arguments**

-   `clusterId` - ID of the targeting cluster
-   `cdnNodeKey` - public key associated with the CDN node

**Usage example**

```ts
import {NodeKey, ClusterId} from '@cere-ddc-sdk/smart-contract/types';

const clusterId: ClusterId = 1;
const cdnNodeKey: NodeKey = '0x...';

await smartContractInstance.clusterAddCdnNode(clusterId, cdnNodeKey);
```

## clusterRemoveCdnNode()

This method removes a CDN node the targeting cluster. The CDN node can be removed from the cluster either by cluster manager or by the node owner.

**Arguments**

-   `clusterId` - ID of the targeting cluster
-   `cdnNodeKey` - public key associated with the CDN node

**Usage example**

```ts
import {NodeKey, ClusterId} from '@cere-ddc-sdk/smart-contract/types';

const clusterId: ClusterId = 1n;
const cdnNodeKey: NodeKey = '0x...';

await smartContractInstance.clusterRemoveCdnNode(clusterId, cdnNodeKey);
```

## clusterRemove()

This method removes the cluster if it does not contain any nodes. Only an empty cluster can be removed.

**Arguments**

-   `clusterId` - ID of the targeting cluster

**Usage example**

```ts
import {ClusterId} from '@cere-ddc-sdk/smart-contract/types';

const clusterId: ClusterId = 1;

await smartContractInstance.clusterRemove(clusterId);
```

## clusterSetNodeStatus()

This method changes storage node status in a cluster.

**Arguments**

-   `clusterId` - ID of the targeting cluster
-   `nodeKey` - public key associated with the storage node
-   `status` - status for the targeting storage node

**Usage example**

```ts
import {ClusterId, NodeKey} from '@cere-ddc-sdk/smart-contract/types';

const clusterId: ClusterId = 1;
const nodeKey: NodeKey = '0x...';
const status: NodeStatusInCluster = NodeStatusInCluster.ACTIVE;

await smartContractInstance.clusterSetNodeStatus(clusterId, nodeKey, status);
```

## clusterSetCdnNodeStatus()

This method changes CDN node status in a cluster.

**Arguments**

-   `clusterId` - ID of the targeting cluster
-   `nodeKey` - public key associated with the storage node
-   `status` - status for the targeting storage node

**Usage example**

```ts
import {ClusterId, NodeKey} from '@cere-ddc-sdk/smart-contract/types';

const clusterId: ClusterId = 1;
const cdnNodeKey: NodeKey = '0x...';
const status: NodeStatusInCluster = NodeStatusInCluster.ACTIVE;

await smartContractInstance.clusterSetCdnNodeStatus(clusterId, cdnNodeKey, status);
```

## cdnNodeSetParams()

This method sets parameters for the targeting CDN node. All CDN node parameters must be specified as the endpoint works using SET approach.

**Arguments**

-   `cdnNodeKey` - public key associated with the CDN node
-   `cdnNodeParams` - new params for the CDN node

**Usage example**

```ts
import {NodeKey, CdnNodeParams} from '@cere-ddc-sdk/smart-contract/types';

const cdnNodeKey: NodeKey = '0x...';
const cdnNodeParams: CdnNodeParams = {
    url: 'https://...',
};

await smartContractInstance.cdnNodeSetParams(cdnNodeKey, cdnNodeParams);
```

## nodeSetParams()

This method sets parameters for the targeting storage node. All storage node parameters must be specified as the endpoint works using SET approach.

**Arguments**

-   `nodeKey` - public key associated with the storage node
-   `nodeParams` - new params for the storage node

**Usage example**

```ts
import {NodeKey, NodeParams} from '@cere-ddc-sdk/smart-contract/types';

const nodeKey: NodeKey = '0x...';
const nodeParams: NodeParams = {
    url: 'https://...',
};

await smartContractInstance.nodeSetParams(cdnNodeKey, nodeParams);
```

## clusterSetResourcePerVNode()

This method sets the resource value that is being used by each virtual node in the cluster. If there are existing virtual nodes in the cluster the resource for its physical nodes will be recalculated.

**Arguments**

-   `clusterId` - ID of the targeting cluster
-   `newResourcePerVNode` - resource value that will be allocated for every virtual node in the cluster

**Usage example**

```ts
import {ClusterId, Resource} from '@cere-ddc-sdk/smart-contract/types';

const clusterId: ClusterId = 1;
const newResourcePerVNode: Resource = 100n;

await smartContractInstance.clusterSetResourcePerVNode(clusterId, newResourcePerVNode);
```

## clusterSetParams()

This method sets parameters for the targeting cluster. All cluster parameters must be specified as the endpoint works using SET approach.

**Arguments**

-   `clusterId` - ID of the targeting cluster
-   `clusterParams` - new cluster params

**Usage example**

```ts
import {ClusterId, ClusterParams} from '@cere-ddc-sdk/smart-contract/types';

const clusterId: ClusterId = 1;
const newClusterParams: ClusterParams = {
    replicationFactor: 1;
};

await smartContractInstance.clusterSetParams(clusterId, newClusterParams);
```

## clusterList()

This method returns a paginated list of clusters along with their parameters, storage and CDN nodes.

**Arguments**

-   `offset` - starting offset. The list will start from `0` offset if this argument is omitted or `null`
-   `limit` - limits the result list length. All items will be returned if this argument is omitted or `null`
-   `filterManagerId` - optional filter by manager address

**Usage example**

```ts
import {AccountId, Offset} from '@cere-ddc-sdk/smart-contract/types';

const offset: Offset = 10n;
const limit: Offset = 100n;
const filterManagerId: AccountId = '0x...';

const [clusterInfoList, totalCount] = await smartContractInstance.clusterList(offset, limit, filterManagerId);
```

## clusterGet()

This method returns the targeting cluster along with its parameters, storage and CDN nodes.

**Arguments**

-   `clusterId` - ID of the targeting cluster

**Usage example**

```ts
import {ClusterId, ClusterInfo} from '@cere-ddc-sdk/smart-contract/types';

const clusterId: ClusterId = 1;

const clusterInfo: ClusterInfo = await smartContractInstance.clusterGet(clusterId);
```

## nodeList()

This method returns a paginated list of CDN nodes along with their parameters.

**Arguments**

-   `offset` - starting offset. The list will start from `0` offset if this argument is omitted or `null`
-   `limit` - limits the result list length. All items will be returned if this argument is omitted or `null`
-   `filterProviderId` - optional filter by provider address

**Usage example**

```ts
import {AccountId, Offset} from '@cere-ddc-sdk/smart-contract/types';

const offset: Offset = 10n;
const limit: Offset = 100n;
const filterProviderId: AccountId = '0x...';

const [nodeInfoList, totalCount] = await smartContractInstance.nodeList(offset, limit, filterProviderId);
```

## cdnNodeList()

This method returns a paginated list of CDN nodes along with their parameters.

**Arguments**

-   `offset` - starting offset. The list will start from `0` offset if this argument is omitted or `null`
-   `limit` - limits the result list length. All items will be returned if this argument is omitted or `null`
-   `filterProviderId` - optional filter by provider address

**Usage example**

```ts
import {AccountId, Offset} from '@cere-ddc-sdk/smart-contract/types';

const offset: Offset = 10n;
const limit: Offset = 100n;
const filterProviderId: AccountId = '0x...';

const [cdnNodeInfoList, totalCount] = await smartContractInstance.cdnNodeList(offset, limit, filterProviderId);
```

## cdnNodeGet()

This method returns the targeting CDN node along with its parameters.

**Arguments**

-   `cdnNodeKey` - public key associated with the CDN node

**Usage example**

```ts
import {NodeKey, CdnNodeInfo} from '@cere-ddc-sdk/smart-contract/types';

const cdnNodeKey: NodeKey = '0x...';

const cdnNodeInfo: CdnNodeInfo = await smartContractInstance.cdnNodeGet(cdnNodeKey);
```

## nodeGet()

This method returns the targeting Storage node along with its parameters.

**Arguments**

-   `nodeKey` - public key associated with the storage node

**Usage example**

```ts
import {NodeKey, NodeInfo} from '@cere-ddc-sdk/smart-contract/types';

const cdnNodeKey: NodeKey = '0x...';

const nodeInfo: NodeInfo = await smartContractInstance.cdnNodeGet(cdnNodeKey);
```
