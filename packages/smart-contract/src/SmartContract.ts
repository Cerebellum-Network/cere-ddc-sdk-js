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
    Permission,
} from './types';

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

    async accountGet(accountAddress: AccountId) {
        const account = await this.queryOne<Account>(this.contract.query.accountGet, accountAddress);

        account.bonded.value = BigInt(account.bonded.value);
        account.deposit.value = BigInt(account.deposit.value);
        account.negative.value = BigInt(account.negative.value);
        account.unbondedAmount.value = BigInt(account.unbondedAmount.value);
        account.unbondedTimestamp = BigInt(account.unbondedTimestamp);
        account.payableSchedule.offset = BigInt(account.payableSchedule.offset);
        account.payableSchedule.rate = BigInt(account.payableSchedule.rate);

        return account;
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
            bucket.params = JSON.parse(bucket.params as any);
        });

        return [buckets, total] as ListResult<BucketStatus>;
    }

    async bucketGet(bucketId: BucketId) {
        const bucketStatus = await this.queryOne<BucketStatus>(this.contract.query.bucketGet, bucketId);

        bucketStatus.bucketId = BigInt(bucketStatus.bucketId);
        bucketStatus.params = JSON.parse(bucketStatus.params as any);

        return bucketStatus;
    }

    async bucketCreate(ownerAddress: AccountId, clusterId: ClusterId, bucketParams: BucketParams = {replication: 1}) {
        if (bucketParams.replication > 3) {
            throw new Error(`Exceed bucket limits: ${JSON.stringify(bucketParams)}`);
        }

        const params = JSON.stringify(bucketParams);
        const {contractEvents} = await this.submit(this.contract.tx.bucketCreate, params, clusterId, ownerAddress);
        const {bucketId} = this.pullContractEventArgs(contractEvents, 'BucketCreated');

        return BigInt(bucketId);
    }

    async bucketAllocIntoCluster(bucketId: BucketId, resource: Resource) {
        if (resource <= 0) {
            throw new Error('Invalid bucket size');
        }

        await this.submit(this.contract.tx.bucketAllocIntoCluster, bucketId, resource);
    }

    async bucketSetAvailability(bucketId: BucketId, isPublic: boolean) {
        await this.submit(this.contract.tx.bucketSetAvailability, bucketId, isPublic);
    }

    async accountDeposit(value: Balance) {
        await this.submitWithOptions(this.contract.tx.accountDeposit, {value: this.toUnits(value)});
    }

    async accountBond(value: Balance) {
        await this.submit(this.contract.tx.accountBond, this.toUnits(value));
    }

    async grantTrustedManagerPermission(managerAddress: AccountId) {
        await this.submit(this.contract.tx.grantTrustedManagerPermission, managerAddress);
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

        return this.pullContractEventArgs(contractEvents, 'NodeCreated').nodeKey;
    }

    async nodeRemove(nodeKey: NodeKey) {
        await this.submit(this.contract.tx.nodeRemove, nodeKey);
    }

    async cdnNodeCreate(cdnNodeKey: NodeKey, cdnNodeParams: CdnNodeParams) {
        const params = JSON.stringify(cdnNodeParams);

        const {contractEvents} = await this.submit(this.contract.tx.cdnNodeCreate, cdnNodeKey, params);

        return this.pullContractEventArgs(contractEvents, 'CdnNodeCreated').cdnNodeKey;
    }

    async cdnNodeRemove(nodeKey: NodeKey) {
        await this.submit(this.contract.tx.cdnNodeRemove, nodeKey);
    }

    async clusterCreate(clusterParams: ClusterParams = {}, resourcePerVNode: Resource = 0n) {
        const params = JSON.stringify(clusterParams);

        const {contractEvents} = await this.submit(this.contract.tx.clusterCreate, params, resourcePerVNode);

        return this.pullContractEventArgs(contractEvents, 'ClusterCreated').clusterId;
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

    async clusterSetResourcePerVNode(clusterId: ClusterId, newResourcePerVNode: Resource) {
        await this.submit(this.contract.tx.clusterSetResourcePerVNode, clusterId, newResourcePerVNode);
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
            cluster.cluster.clusterParams = JSON.parse(cluster.cluster.clusterParams as any);
            cluster.clusterVNodes.forEach((info) => {
                info.vNodes = info.vNodes.map(BigInt);
            });
        });

        return [clusters, total] as ListResult<ClusterInfo>;
    }

    async clusterGet(clusterId: number) {
        const clusterInfo: ClusterInfo = await this.queryOne<ClusterInfo>(this.contract.query.clusterGet, clusterId);

        clusterInfo.cluster.clusterParams = JSON.parse(clusterInfo.cluster.clusterParams as any);
        clusterInfo.clusterVNodes.forEach((info) => {
            info.vNodes = info.vNodes.map(BigInt);
        });

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
            node.node.nodeParams = JSON.parse(node.node.nodeParams as any);
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
            node.cdnNode.cdnNodeParams = JSON.parse(node.cdnNode.cdnNodeParams as any);
        });

        return [nodes, total] as ListResult<CdnNodeInfo>;
    }

    async cdnNodeGet(nodeKey: NodeKey) {
        const nodeInfo = await this.queryOne<CdnNodeInfo>(this.contract.query.cdnNodeGet, nodeKey);

        nodeInfo.cdnNode.cdnNodeParams = JSON.parse(nodeInfo.cdnNode.cdnNodeParams as any);

        return nodeInfo;
    }

    async nodeGet(nodeKey: NodeKey) {
        const nodeInfo = await this.queryOne<NodeInfo>(this.contract.query.nodeGet, nodeKey);

        nodeInfo.node.nodeParams = JSON.parse(nodeInfo.node.nodeParams as any);
        nodeInfo.vNodes = nodeInfo.vNodes.map(BigInt);

        return nodeInfo;
    }

    async revokeTrustedManagerPermission(managerAddress: AccountId) {
        await this.submit(this.contract.tx.revokeTrustedManagerPermission, managerAddress);
    }

    async hasPermission(accountId: AccountId, permission: Permission) {
        return this.query(this.contract.query.hasPermission, accountId, permission);
    }
}
