import {ApiPromise} from '@polkadot/api';
import {Sendable} from './Blockchain';
import type {
    CdnNode,
    CdnNodeParams,
    CdnNodePublicKey,
    StorageNode,
    StorageNodeParams,
    StorageNodePublicKey,
} from './types';
import {hexToString, hexToU8a, stringToHex} from '@polkadot/util';
import {HexString} from '@polkadot/util/types';

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
    return stringToHex(JSON.stringify(params));
}

function deserializeStorageNodeParams(params: HexString) {
    return JSON.parse(hexToString(params)) as StorageNodeParams;
}
