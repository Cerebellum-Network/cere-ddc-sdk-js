import {ApiPromise} from '@polkadot/api';
import {Sendable} from './Blockchain';
import {CdnNodePublicKey, NodePublicKey, StorageNodePublicKey} from './DDCNodesPallet';
import {ClusterId} from './DDCClustersPallet';
import {AccountId} from './DDCCustomersPallet';

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

    async findStorageNodeStake(storageNodePublicKey: string) {
        const result = await this.apiPromise.query.ddcStaking.storages(storageNodePublicKey);
        return result.unwrapOr(undefined)?.toJSON() as unknown as ClusterId;
    }

    async findCdnNodeStake(cdnNodePublicKey: string) {
        const result = await this.apiPromise.query.ddcStaking.edges(cdnNodePublicKey);
        return result.unwrapOr(undefined)?.toJSON() as unknown as ClusterId;
    }

    setController(accountId: AccountId) {
        return this.apiPromise.tx.ddcStaking.setController(accountId) as Sendable;
    }

    async listClusterManagers() {
        const result = await this.apiPromise.query.ddcStaking.clusterManagers();
        return result.toJSON() as unknown as AccountId[];
    }

    store(storageNodePublicKey: StorageNodePublicKey) {
        return this.apiPromise.tx.ddcStaking.store(storageNodePublicKey) as Sendable;
    }

    serve(cdnNodePublicKey: CdnNodePublicKey) {
        return this.apiPromise.tx.ddcStaking.serve(cdnNodePublicKey) as Sendable;
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

export type Amount = bigint;
