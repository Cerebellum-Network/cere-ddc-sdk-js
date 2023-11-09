import {ApiPromise} from '@polkadot/api';
import {HexString, Sendable} from './Blockchain';
import {ClusterId} from './DDCClustersPallet';
import {AccountId} from './DDCCustomersPallet';
import {hexDecode, hexEncode} from './string-utils';

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
        return result.unwrapOr(undefined)?.toJSON() as unknown as CdnNode | undefined;
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

    createStorageNode(storageNodePublicKey: StorageNodePublicKey, storageNodeParams: StorageNodeParams) {
        return this.apiPromise.tx.ddcNodes.createNode(
            {StoragePubKey: storageNodePublicKey},
            {StorageParams: {params: serializeStorageNodeParams(storageNodeParams)}},
        ) as Sendable;
    }

    async findStorageNodeByPublicKey(storageNodePublicKey: StorageNodePublicKey) {
        const result = await this.apiPromise.query.ddcNodes.storageNodes(storageNodePublicKey);
        const storageNode = result.unwrapOr(undefined)?.toJSON() as unknown as StorageNode | undefined;
        if (storageNode) {
            storageNode.props.params = deserializeStorageNodeParams(storageNode.props.params as unknown as HexString);
        }
        return storageNode;
    }

    setStorageNodeParams(storageNodePublicKey: StorageNodePublicKey, storageNodeParams: StorageNodeParams) {
        return this.apiPromise.tx.ddcNodes.setNodeParams(
            {StoragePubKey: storageNodePublicKey},
            {StorageParams: {params: serializeStorageNodeParams(storageNodeParams)}},
        ) as Sendable;
    }

    deleteStorageNode(storageNodePublicKey: StorageNodePublicKey) {
        return this.apiPromise.tx.ddcNodes.deleteNode({StoragePubKey: storageNodePublicKey}) as Sendable;
    }
}

function serializeStorageNodeParams(params: StorageNodeParams) {
    return hexEncode(JSON.stringify(params));
}

function deserializeStorageNodeParams(params: HexString) {
    return JSON.parse(hexDecode(params)) as StorageNodeParams;
}

export type NodePublicKey = string;
export type CdnNodePublicKey = NodePublicKey;
export type StorageNodePublicKey = NodePublicKey;
export type NodeParams = string;
export type CdnNodeParams = NodeParams;
export type StorageNodeParams = {grpcUrl: string};
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
