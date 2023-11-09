import {ApiPromise} from '@polkadot/api';
import {Sendable} from './Blockchain';
import type {AccountId, Amount, CdnNodePublicKey, ClusterId, StorageNodePublicKey} from './types';
export class DDCStakingPallet {
    constructor(private apiPromise: ApiPromise) {}

    bondStorageNode(controller: AccountId, storageNodePublicKey: StorageNodePublicKey, bondAmount: Amount) {
        return this.apiPromise.tx.ddcStaking.bond(
            controller,
            {StoragePubKey: storageNodePublicKey},
            bondAmount,
        ) as Sendable;
    }

    bondCdnNode(controller: AccountId, cdnNodePublicKey: CdnNodePublicKey, bondAmount: Amount) {
        return this.apiPromise.tx.ddcStaking.bond(controller, {CDNPubKey: cdnNodePublicKey}, bondAmount) as Sendable;
    }

    unbond(amount: Amount) {
        return this.apiPromise.tx.ddcStaking.unbond(amount) as Sendable;
    }

    async findStorageNodeStakeClusterId(storageNodePublicKey: string) {
        const result = await this.apiPromise.query.ddcStaking.storages(storageNodePublicKey);
        return result.unwrapOr(undefined)?.toJSON() as unknown as ClusterId | undefined;
    }

    async findCdnNodeStakeClusterId(cdnNodePublicKey: string) {
        const result = await this.apiPromise.query.ddcStaking.edges(cdnNodePublicKey);
        return result.unwrapOr(undefined)?.toJSON() as unknown as ClusterId | undefined;
    }

    setController(accountId: AccountId) {
        return this.apiPromise.tx.ddcStaking.setController(accountId) as Sendable;
    }

    async listClusterManagers() {
        const result = await this.apiPromise.query.ddcStaking.clusterManagers();
        return result.toJSON() as unknown as AccountId[];
    }

    store(clusterId: ClusterId) {
        return this.apiPromise.tx.ddcStaking.store(clusterId) as Sendable;
    }

    serve(clusterId: ClusterId) {
        return this.apiPromise.tx.ddcStaking.serve(clusterId) as Sendable;
    }

    getSettings() {
        const defaultStorageBondSize = this.apiPromise.consts.ddcStaking.defaultStorageBondSize.toJSON() as bigint;
        const defaultEdgeBondSize = this.apiPromise.consts.ddcStaking.defaultEdgeBondSize.toJSON() as bigint;

        return {
            defaultStorageBondSize,
            defaultEdgeBondSize,
        };
    }
}
