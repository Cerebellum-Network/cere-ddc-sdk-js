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
    VNode,
    BucketParams,
    Balance,
    NodeTag,
    NodeParams,
    CdnNodeParams,
    CdnNodeStatus,
    NodeStatus,
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

    async clusterList(offset?: number | null, limit?: number | null, filterManagerId?: AccountId) {
        return this.queryList<ClusterStatus>(this.contract.query.clusterList, offset, limit, filterManagerId);
    }

    async cdnClusterList(offset?: number | null, limit?: number | null, filterManagerId?: AccountId) {
        return this.queryList<CdnClusterStatus>(this.contract.query.clusterList, offset, limit, filterManagerId);
    }

    async clusterCreate(vNodes: VNode[] = [], nodeIds: NodeId[] = [], clusterParams: Record<string, unknown> = {}) {
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

    async clusterRemoveNode() {
        throw new Error('Not implemented');
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

    async nodeList(offset?: number | null, limit?: number | null, filterProviderId?: AccountId) {
        return this.queryList<NodeStatus>(this.contract.query.nodeList, offset, limit, filterProviderId);
    }

    async cdnNodeList(offset?: number | null, limit?: number | null, filterProviderId?: AccountId) {
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
        return this.queryOne<ClusterStatus>(this.contract.query.clusterGet, clusterId);
    }

    async cdnClusterGet(clusterId: number) {
        return this.queryOne<CdnClusterStatus>(this.contract.query.cdnClusterGet, clusterId);
    }

    async bucketList(offset?: number | null, limit?: number | null, filterOwnerId?: AccountId) {
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

    async accountDeposit(value: bigint) {
        await this.submitWithOptions(this.contract.tx.accountDeposit, {value: value * CERE});
    }

    async accountBond(value: bigint) {
        await this.submit(this.contract.tx.accountBond, value * CERE);
    }

    // Not yet implemented

    async clusterAddNode() {
        throw new Error('Not implemented');
    }

    async cdnClusterAddNode() {
        throw new Error('Not implemented');
    }

    async nodeChangeParams() {
        throw new Error('Not implemented');
    }

    async clusterChangeNodeTag() {
        throw new Error('Not implemented');
    }

    async cdnClusterChangeNodeTag() {
        throw new Error('Not implemented');
    }

    async clusterChangeParams() {
        throw new Error('Not implemented');
    }

    async cdnClusterRemoveNode() {
        throw new Error('Not implemented');
    }
}
