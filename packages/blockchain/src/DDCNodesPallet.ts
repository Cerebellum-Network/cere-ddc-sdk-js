import {ApiPromise} from '@polkadot/api';
import {Sendable} from './Blockchain';
import {ClusterId} from './DDCClustersPallet';
import {AccountId} from './DDCCustomersPallet';

export class DDCNodesPallet {
    constructor(private apiPromise: ApiPromise) {}

    createCdnNode(cdnNodePublicKey: CdnNodePublicKey, cdnNodeParams: CdnNodeParams) {
        return this.apiPromise.tx.ddcNodes.createNode(
            {CDNPubKey: cdnNodePublicKey},
            {CDNParams: {params: cdnNodeParams}},
        ) as Sendable;
    }

    async findCdnNodeByPublicKey(cdnNodePublicKey: CdnNodePublicKey) {
        const result = await this.apiPromise.query.ddcNodes.cdnNodes(cdnNodePublicKey);
        return result.unwrapOr(undefined)?.toHuman() as unknown as CdnNode | undefined;
    }

    setCdnNodeParams(cdnNodePublicKey: CdnNodePublicKey, cdnNodeParams: CdnNodeParams) {
        return this.apiPromise.tx.ddcNodes.setNodeParams(
            {CDNPubKey: cdnNodePublicKey},
            {CDNParams: {params: cdnNodeParams}},
        ) as Sendable;
    }

    deleteCdnNode(cdnNodePublicKey: CdnNodePublicKey) {
        return this.apiPromise.tx.ddcNodes.deleteNode({CDNPubKey: cdnNodePublicKey}) as Sendable;
    }

    createStorageNode(storageNodePublicKey: StorageNodeParams, storageNodeParams: StorageNodeParams) {
        return this.apiPromise.tx.ddcNodes.createNode(
            {StoragePubKey: storageNodePublicKey},
            {StorageParams: {params: storageNodeParams}},
        ) as Sendable;
    }

    async findStorageNodeByPublicKey(storageNodePublicKey: StorageNodePublicKey) {
        const result = await this.apiPromise.query.ddcNodes.storageNodes(storageNodePublicKey);
        return result.unwrapOr(undefined)?.toJSON() as unknown as StorageNode | undefined;
    }

    setStorageNodeParams(storageNodePublicKey: StorageNodePublicKey, storageNodeParams: StorageNodeParams) {
        return this.apiPromise.tx.ddcNodes.setNodeParams(
            {StoragePubKey: storageNodePublicKey},
            {StorageParams: {params: storageNodeParams}},
        ) as Sendable;
    }

    deleteStorageNode(storageNodePublicKey: StorageNodePublicKey) {
        return this.apiPromise.tx.ddcNodes.deleteNode({StoragePubKey: storageNodePublicKey}) as Sendable;
    }
}

export type NodePublicKey = string;
export type CdnNodePublicKey = NodePublicKey;
export type StorageNodePublicKey = NodePublicKey;
export type NodeParams = string;
export type CdnNodeParams = NodeParams;
export type StorageNodeParams = NodeParams;
export type CdnNode = /*PalletDdcNodesCdnNode;*/ {
    readonly pubKey: CdnNodePublicKey;
    readonly providerId: AccountId;
    readonly clusterId: ClusterId;
    readonly props: {
        readonly params: CdnNodeParams;
    };
};
export type StorageNode = /*PalletDdcNodesStorageNode;*/ {
    readonly pubKey: StorageNodePublicKey;
    readonly providerId: AccountId;
    readonly clusterId: ClusterId;
    readonly props: {
        params: StorageNodeParams;
    };
};
