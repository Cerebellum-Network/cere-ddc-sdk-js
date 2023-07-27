import {ApiPromise, WsProvider} from '@polkadot/api';
import {ContractPromise} from '@polkadot/api-contract';
import {Keyring} from '@polkadot/keyring';
import {Signer} from '@polkadot/api/types';
import {cryptoWaitReady, isAddress} from '@polkadot/util-crypto';

import {SmartContractBase} from './SmartContractBase';
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
    NodeTag,
    NodeParams,
    CdnNodeParams,
    CdnNodeStatus,
    NodeStatus,
    ClusterParams,
    Offset,
} from './types';

const CERE = 10_000_000_000n;

export class SmartContract extends SmartContractBase {
    static async buildAndConnect(
        secretPhraseOrAddress: string,
        options: SmartContractOptions = TESTNET,
        signer?: Signer,
    ): Promise<SmartContract> {
        await cryptoWaitReady();

        const provider = new WsProvider(options.rpcUrl);
        const api = await ApiPromise.create({provider, types: cereTypes});
        await api.isReady;

        const contract = new ContractPromise(api, options.abi, options.contractAddress);
        const keyring = new Keyring({type: 'sr25519'});
        const addressOrPair = isAddress(secretPhraseOrAddress)
            ? secretPhraseOrAddress
            : keyring.addFromMnemonic(secretPhraseOrAddress);

        return new SmartContract(addressOrPair, contract, signer);
    }

    async connect(): Promise<SmartContract> {
        const api = this.contract.api as ApiPromise;
        await api.isReady;

        return this;
    }

    async disconnect() {
        return this.contract.api.disconnect();
    }

    async clusterList(offset?: Offset | null, limit?: Offset | null, filterManagerId?: AccountId) {
        return this.queryList<ClusterInfo>(this.contract.query.clusterList, offset, limit, filterManagerId);
    }

    async cdnClusterList(offset?: Offset | null, limit?: Offset | null, filterManagerId?: AccountId) {
        return this.queryList<ClusterInfo>(this.contract.query.cdnClusterList, offset, limit, filterManagerId);
    }

    async nodeList(offset?: Offset | null, limit?: Offset | null, filterProviderId?: AccountId) {
        return this.queryList<NodeStatus>(this.contract.query.nodeList, offset, limit, filterProviderId);
    }

    async cdnNodeList(offset?: Offset | null, limit?: Offset | null, filterProviderId?: AccountId) {
        return this.queryList<CdnNodeStatus>(this.contract.query.cdnNodeList, offset, limit, filterProviderId);
    }

    async cdnNodeGet(nodeId: NodeKey) {
        return this.queryOne<CdnNodeStatus>(this.contract.query.cdnNodeGet, nodeId);
    }

    async nodeGet(nodeId: NodeKey) {
        return this.queryOne<NodeStatus>(this.contract.query.nodeGet, nodeId);
    }

    async accountGet(address: string) {
        return this.queryOne<Account>(this.contract.query.accountGet, address);
    }

    async bucketList(offset?: Offset | null, limit?: Offset | null, filterOwnerId?: AccountId) {
        return this.queryList<BucketStatus>(this.contract.query.bucketList, offset, limit, filterOwnerId);
    }

    async bucketGet(bucketId: BucketId) {
        return this.queryOne<BucketStatus>(this.contract.query.bucketGet, bucketId);
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

        return this.getContractEventArgs(contractEvents, 'BucketCreated').bucketId;
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

    async clusterAddNode(clusterId: ClusterId, nodeId: NodeKey, vNodes: VNodeId[]) {
        // const {cluster} = await this.clusterGet(clusterId);
        // if (cluster.nodeIds.includes(nodeId)) {
        //     throw new Error(`Cluster ${clusterId} already has node ${nodeId}`);
        // }
        // const newNodeIds = [...cluster.nodeIds, nodeId];
        // const newVNodes = [...cluster.vNodes, vNodes];
        // await this.submit(this.contract.tx.clusterAddNode, clusterId, newNodeIds, newVNodes);
    }

    async clusterRemoveNode(clusterId: ClusterId, nodeId: NodeKey) {
        // const {cluster} = await this.clusterGet(clusterId);
        // const nodeIndex = cluster.nodeIds.indexOf(nodeId);
        // if (nodeIndex < 0) {
        //     throw new Error(`Node ${nodeId} is not found in cluster ${clusterId}`);
        // }
        // const newNodeIds = [...cluster.nodeIds];
        // const newVNodes = [...cluster.vNodes];
        // newNodeIds.splice(nodeIndex, 1);
        // newVNodes.splice(nodeIndex, 1);
        // await this.submit(this.contract.tx.clusterRemoveNode, clusterId, newNodeIds, newVNodes);
    }

    async clusterReserveResource(clusterId: ClusterId, amount: Resource) {
        await this.submit(this.contract.tx.clusterReserveResource, clusterId, amount);
    }

    async clusterChangeNodeTag(nodeId: NodeKey, nodeTag: NodeTag) {
        await this.submit(this.contract.tx.clusterChangeNodeTag, nodeId, nodeTag);
    }

    async nodeChangeParams(nodeId: NodeKey, params: NodeParams) {
        await this.submit(this.contract.tx.nodeChangeParams, nodeId, JSON.stringify(params));
    }

    // Smart Contract v1.0.0 methods

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

    async cdnNodeCreate(cdnNodeKey: NodeKey, nodeParams: CdnNodeParams) {
        const params = JSON.stringify(nodeParams);

        const {contractEvents} = await this.submit(this.contract.tx.cdnNodeCreate, cdnNodeKey, params);

        return this.getContractEventArgs(contractEvents, 'CdnNodeCreated').cdnNodeKey;
    }

    async clusterCreate(clusterParams: ClusterParams = {}, resourcePerVNode: Resource = 0n) {
        const {contractEvents} = await this.submit(this.contract.tx.clusterCreate, clusterParams, resourcePerVNode);

        return this.getContractEventArgs(contractEvents, 'ClusterCreated').clusterId;
    }

    async clusterGet(clusterId: number) {
        return this.queryOne<ClusterInfo>(this.contract.query.clusterGet, clusterId);
    }
}
