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
    CdnClusterStatus,
    ClusterId,
    ClusterStatus,
    NodeId,
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
        return this.queryList<ClusterStatus>(this.contract.query.clusterList, offset, limit, filterManagerId);
    }

    async cdnClusterList(offset?: Offset | null, limit?: Offset | null, filterManagerId?: AccountId) {
        return this.queryList<CdnClusterStatus>(this.contract.query.cdnClusterList, offset, limit, filterManagerId);
    }

    async clusterCreate(vNodes: VNodeId[][] = [], nodeIds: NodeId[] = [], clusterParams: ClusterParams = {}) {
        const {contractEvents} = await this.submit(
            this.contract.tx.clusterCreate,
            this.address,
            vNodes,
            nodeIds,
            JSON.stringify(clusterParams),
        );

        return this.getContractEventArgs(contractEvents, 'ClusterCreated').clusterId;
    }

    async cdnClusterCreate(cdnNodesIds: NodeId[] = []) {
        const {contractEvents} = await this.submit(this.contract.tx.cdnClusterCreate, cdnNodesIds);

        return this.getContractEventArgs(contractEvents, 'CdnClusterCreated').clusterId;
    }

    async nodeCreate(
        rentPerMonth: Balance,
        nodeParams: NodeParams,
        capacity: Resource,
        nodeTag: NodeTag,
        pubkey: AccountId,
    ) {
        const params = JSON.stringify(nodeParams);

        const {contractEvents} = await this.submit(
            this.contract.tx.nodeCreate,
            rentPerMonth,
            params,
            capacity,
            nodeTag,
            pubkey,
        );

        return this.getContractEventArgs(contractEvents, 'NodeCreated').nodeId;
    }

    async cdnNodeCreate(nodeParams: CdnNodeParams) {
        const params = JSON.stringify(nodeParams);
        const nodeId = await this.query<NodeId>(this.contract.query.cdnNodeCreate, params); // Dry run

        await this.submit(this.contract.tx.cdnNodeCreate, params);

        return nodeId;
    }

    async nodeList(offset?: Offset | null, limit?: Offset | null, filterProviderId?: AccountId) {
        return this.queryList<NodeStatus>(this.contract.query.nodeList, offset, limit, filterProviderId);
    }

    async cdnNodeList(offset?: Offset | null, limit?: Offset | null, filterProviderId?: AccountId) {
        return this.queryList<CdnNodeStatus>(this.contract.query.cdnNodeList, offset, limit, filterProviderId);
    }

    async cdnNodeGet(nodeId: NodeId) {
        return this.queryOne<CdnNodeStatus>(this.contract.query.cdnNodeGet, nodeId);
    }

    async nodeGet(nodeId: NodeId) {
        return this.queryOne<NodeStatus>(this.contract.query.nodeGet, nodeId);
    }

    async accountGet(address: string) {
        return this.queryOne<Account>(this.contract.query.accountGet, address);
    }

    async clusterGet(clusterId: number) {
        const output = await this.queryOne<ClusterStatus>(this.contract.query.clusterGet, clusterId);

        output.cluster.vNodes = output.cluster.vNodes.map((vNode) => vNode.map(BigInt));

        return output;
    }

    async cdnClusterGet(clusterId: number) {
        return this.queryOne<CdnClusterStatus>(this.contract.query.cdnClusterGet, clusterId);
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

    async clusterAddNode(clusterId: ClusterId, nodeId: NodeId, vNodes: VNodeId[]) {
        const {cluster} = await this.clusterGet(clusterId);

        if (cluster.nodeIds.includes(nodeId)) {
            throw new Error(`Cluster ${clusterId} already has node ${nodeId}`);
        }

        const newNodeIds = [...cluster.nodeIds, nodeId];
        const newVNodes = [...cluster.vNodes, vNodes];

        await this.submit(this.contract.tx.clusterAddNode, clusterId, newNodeIds, newVNodes);
    }

    async clusterRemoveNode(clusterId: ClusterId, nodeId: NodeId) {
        const {cluster} = await this.clusterGet(clusterId);
        const nodeIndex = cluster.nodeIds.indexOf(nodeId);

        if (nodeIndex < 0) {
            throw new Error(`Node ${nodeId} is not found in cluster ${clusterId}`);
        }

        const newNodeIds = [...cluster.nodeIds];
        const newVNodes = [...cluster.vNodes];

        newNodeIds.splice(nodeIndex, 1);
        newVNodes.splice(nodeIndex, 1);

        await this.submit(this.contract.tx.clusterRemoveNode, clusterId, newNodeIds, newVNodes);
    }

    async clusterReserveResource(clusterId: ClusterId, amount: Resource) {
        await this.submit(this.contract.tx.clusterReserveResource, clusterId, amount);
    }

    async clusterChangeNodeTag(nodeId: NodeId, nodeTag: NodeTag) {
        await this.submit(this.contract.tx.clusterChangeNodeTag, nodeId, nodeTag);
    }

    async nodeChangeParams(nodeId: NodeId, params: NodeParams) {
        await this.submit(this.contract.tx.nodeChangeParams, nodeId, JSON.stringify(params));
    }

    // Smart Contract v1.0.0 methods

    async grantTrustedManagerPermission(manager: AccountId) {
        await this.submit(this.contract.tx.grantTrustedManagerPermission, manager);
    }

    // Depricated methods

    /**
     * Use `grantTrustedManagerPermission` instead
     *
     * @deprecated
     */
    async nodeTrustManager(manager: AccountId) {
        return this.grantTrustedManagerPermission(manager);
    }
}
