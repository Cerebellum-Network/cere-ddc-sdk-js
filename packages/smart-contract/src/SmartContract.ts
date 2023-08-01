import {ApiPromise, WsProvider} from '@polkadot/api';
import {ContractPromise} from '@polkadot/api-contract';
import {Keyring} from '@polkadot/keyring';
import {AddressOrPair, Signer} from '@polkadot/api/types';
import {cryptoWaitReady, isAddress} from '@polkadot/util-crypto';

import {SmartContractBase, ListResult} from './SmartContractBase';
import {SmartContractOptions, TESTNET} from './options/SmartContractOptions';
import {cereTypes} from './types/cere_types';

import {
    Account,
    AccountId,
    BucketId,
    BucketStatus,
    ClusterId,
    ClusterInfo,
    NodeKey,
    Resource,
    VNodeId,
    BucketParams,
    Balance,
    NodeParams,
    CdnNodeParams,
    ClusterParams,
    Offset,
    NodeInfo,
    CdnNodeInfo,
    NodeStatusInCluster,
} from './types';

const CERE = 10_000_000_000n;

export class SmartContract extends SmartContractBase {
    private shouldDisconnectAPI = false;

    static async buildAndConnect(
        secretPhraseOrAddress: AddressOrPair,
        options: SmartContractOptions = TESTNET,
        signer?: Signer,
    ) {
        await cryptoWaitReady();

        let api = options.api;
        let addressOrPair = secretPhraseOrAddress;

        if (!api) {
            const provider = new WsProvider(options.rpcUrl);

            api = await ApiPromise.create({provider, types: cereTypes});
        }

        if (typeof secretPhraseOrAddress === 'string') {
            addressOrPair = isAddress(secretPhraseOrAddress)
                ? secretPhraseOrAddress
                : new Keyring({type: 'sr25519'}).addFromMnemonic(secretPhraseOrAddress);
        }

        const contract = new ContractPromise(api, options.abi, options.contractAddress);
        const smartContract = new SmartContract(addressOrPair, contract, signer);

        /**
         * In case an external API instance is used - don't diconnect it
         */
        smartContract.shouldDisconnectAPI = !options.api;

        return smartContract.connect();
    }

    async connect() {
        const api = this.contract.api as ApiPromise;
        await api.isReady;

        return this;
    }

    async disconnect() {
        if (this.shouldDisconnectAPI) {
            await this.contract.api.disconnect();
        }
    }

    async cdnClusterList(offset?: Offset | null, limit?: Offset | null, filterManagerId?: AccountId) {
        return this.queryList<ClusterInfo>(this.contract.query.cdnClusterList, offset, limit, filterManagerId);
    }

    async accountGet(address: string) {
        return this.queryOne<Account>(this.contract.query.accountGet, address);
    }

    async bucketList(offset?: Offset | null, limit?: Offset | null, filterOwnerId?: AccountId) {
        const [buckets, total] = await this.queryList<BucketStatus>(
            this.contract.query.bucketList,
            offset,
            limit,
            filterOwnerId,
        );

        buckets.forEach((bucket) => {
            bucket.bucketId = BigInt(bucket.bucketId);
        });

        return [buckets, total] as ListResult<BucketStatus>;
    }

    async bucketGet(bucketId: BucketId) {
        const bucketStatus = await this.queryOne<BucketStatus>(this.contract.query.bucketGet, bucketId);

        bucketStatus.bucketId = BigInt(bucketStatus.bucketId);

        return bucketStatus;
    }

    async bucketCreate(owner: AccountId, clusterId: ClusterId, bucketParams: BucketParams = {replication: 1}) {
        if (bucketParams.replication > 3) {
            throw new Error(`Exceed bucket limits: ${JSON.stringify(bucketParams)}`);
        }

        const params = JSON.stringify(bucketParams);
        const {contractEvents} = await this.submitWithOptions(
            this.contract.tx.bucketCreate,
            {value: 10n * CERE},
            params,
            clusterId,
            owner,
        );

        const {bucketId} = this.getContractEventArgs(contractEvents, 'BucketCreated');

        return BigInt(bucketId);
    }

    async bucketAllocIntoCluster(bucketId: BucketId, resource: Resource) {
        if (resource <= 0) {
            throw new Error('Invalid bucket size');
        }

        await this.submit(this.contract.tx.bucketAllocIntoCluster, bucketId, resource);
    }

    async accountDeposit(value: Balance) {
        await this.submitWithOptions(this.contract.tx.accountDeposit, {value: value * CERE});
    }

    async accountBond(value: Balance) {
        await this.submit(this.contract.tx.accountBond, value * CERE);
    }

    async grantTrustedManagerPermission(manager: AccountId) {
        await this.submit(this.contract.tx.grantTrustedManagerPermission, manager);
    }

    async nodeCreate(nodeKey: NodeKey, nodeParams: NodeParams, capacity: Resource, rentPerMonth: Balance) {
        const params = JSON.stringify(nodeParams);

        const {contractEvents} = await this.submit(
            this.contract.tx.nodeCreate,
            nodeKey,
            params,
            capacity,
            rentPerMonth,
        );

        return this.getContractEventArgs(contractEvents, 'NodeCreated').nodeKey;
    }

    async nodeRemove(nodeKey: NodeKey) {
        await this.submit(this.contract.tx.nodeRemove, nodeKey);
    }

    async cdnNodeCreate(cdnNodeKey: NodeKey, nodeParams: CdnNodeParams) {
        const params = JSON.stringify(nodeParams);

        const {contractEvents} = await this.submit(this.contract.tx.cdnNodeCreate, cdnNodeKey, params);

        return this.getContractEventArgs(contractEvents, 'CdnNodeCreated').cdnNodeKey;
    }

    async cdnNodeRemove(nodeKey: NodeKey) {
        await this.submit(this.contract.tx.cdnNodeRemove, nodeKey);
    }

    async clusterCreate(clusterParams: ClusterParams = {}, resourcePerVNode: Resource = 0n) {
        const params = JSON.stringify(clusterParams);

        const {contractEvents} = await this.submit(this.contract.tx.clusterCreate, params, resourcePerVNode);

        return this.getContractEventArgs(contractEvents, 'ClusterCreated').clusterId;
    }

    async clusterAddNode(clusterId: ClusterId, nodeKey: NodeKey, vNodes: VNodeId[]) {
        await this.submit(this.contract.tx.clusterAddNode, clusterId, nodeKey, vNodes);
    }

    async clusterRemoveNode(clusterId: ClusterId, nodeKey: NodeKey) {
        await this.submit(this.contract.tx.clusterRemoveNode, clusterId, nodeKey);
    }

    async clusterAddCdnNode(clusterId: ClusterId, nodeKey: NodeKey) {
        await this.submit(this.contract.tx.clusterAddCdnNode, clusterId, nodeKey);
    }

    async clusterRemoveCdnNode(clusterId: ClusterId, nodeKey: NodeKey) {
        await this.submit(this.contract.tx.clusterRemoveCdnNode, clusterId, nodeKey);
    }

    async clusterRemove(clusterId: ClusterId) {
        await this.submit(this.contract.tx.clusterRemove, clusterId);
    }

    async clusterSetNodeStatus(clusterId: ClusterId, nodeKey: NodeKey, statusInCluster: NodeStatusInCluster) {
        await this.submit(this.contract.tx.clusterSetNodeStatus, clusterId, nodeKey, statusInCluster);
    }

    async clusterSetCdnNodeStatus(clusterId: ClusterId, nodeKey: NodeKey, statusInCluster: NodeStatusInCluster) {
        await this.submit(this.contract.tx.clusterSetCdnNodeStatus, clusterId, nodeKey, statusInCluster);
    }

    async cdnNodeSetParams(nodeKey: NodeKey, params: CdnNodeParams) {
        await this.submit(this.contract.tx.cdnNodeSetParams, nodeKey, JSON.stringify(params));
    }

    async nodeSetParams(nodeKey: NodeKey, params: NodeParams) {
        await this.submit(this.contract.tx.nodeSetParams, nodeKey, JSON.stringify(params));
    }

    async clusterSetResourcePerVNode(clusterId: ClusterId, amount: Resource) {
        await this.submit(this.contract.tx.clusterSetResourcePerVNode, clusterId, amount);
    }

    async clusterSetParams(clusterId: ClusterId, params: ClusterParams) {
        await this.submit(this.contract.tx.clusterSetParams, clusterId, JSON.stringify(params));
    }

    async clusterList(offset?: Offset | null, limit?: Offset | null, filterManagerId?: AccountId) {
        const [clusters, total] = await this.queryList<ClusterInfo>(
            this.contract.query.clusterList,
            offset,
            limit,
            filterManagerId,
        );

        clusters.forEach((cluster) => {
            cluster.cluster.clusterParams = JSON.parse(cluster.cluster.clusterParams as string);
            cluster.clusterVNodes = cluster.clusterVNodes.map(BigInt);
        });

        return [clusters, total] as ListResult<ClusterInfo>;
    }

    async clusterGet(clusterId: number) {
        const clusterInfo: ClusterInfo = await this.queryOne<ClusterInfo>(this.contract.query.clusterGet, clusterId);

        clusterInfo.cluster.clusterParams = JSON.parse(clusterInfo.cluster.clusterParams as string);
        clusterInfo.clusterVNodes = clusterInfo.clusterVNodes.map(BigInt);

        return clusterInfo;
    }

    async nodeList(offset?: Offset | null, limit?: Offset | null, filterProviderId?: AccountId) {
        const [nodes, total] = await this.queryList<NodeInfo>(
            this.contract.query.nodeList,
            offset,
            limit,
            filterProviderId,
        );

        nodes.forEach((node) => {
            node.vNodes = node.vNodes.map(BigInt);
            node.node.nodeParams = JSON.parse(node.node.nodeParams as string);
        });

        return [nodes, total] as ListResult<NodeInfo>;
    }

    async cdnNodeList(offset?: Offset | null, limit?: Offset | null, filterProviderId?: AccountId) {
        const [nodes, total] = await this.queryList<CdnNodeInfo>(
            this.contract.query.cdnNodeList,
            offset,
            limit,
            filterProviderId,
        );

        nodes.forEach((node) => {
            node.cdnNode.cdnNodeParams = JSON.parse(node.cdnNode.cdnNodeParams as string);
        });

        return [nodes, total] as ListResult<CdnNodeInfo>;
    }

    async cdnNodeGet(nodeKey: NodeKey) {
        const nodeInfo = await this.queryOne<CdnNodeInfo>(this.contract.query.cdnNodeGet, nodeKey);

        nodeInfo.cdnNode.cdnNodeParams = JSON.parse(nodeInfo.cdnNode.cdnNodeParams as string);

        return nodeInfo;
    }

    async nodeGet(nodeKey: NodeKey) {
        const nodeInfo = await this.queryOne<NodeInfo>(this.contract.query.nodeGet, nodeKey);

        nodeInfo.node.nodeParams = JSON.parse(nodeInfo.node.nodeParams as string);
        nodeInfo.vNodes = nodeInfo.vNodes.map(BigInt);

        return nodeInfo;
    }
}
