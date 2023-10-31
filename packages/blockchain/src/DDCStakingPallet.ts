import {ApiPromise} from '@polkadot/api';
import {Sendable} from './Blockchain';
import {NodePublicKey} from './DDCNodesPallet';
import {ClusterId} from './DDCClustersPallet';
import {AccountId} from './DDCCustomersPallet';

export class DDCStakingPallet {
    constructor(private apiPromise: ApiPromise) {}

    bond(controller: string, nodePublicKey: NodePublicKey, bondAmount: bigint) {
        return this.apiPromise.tx.ddcStaking.bond(controller, nodePublicKey, bondAmount) as Sendable;
    }

    unbond(value: number) {
        return this.apiPromise.tx.ddcStaking.unbond(value) as Sendable;
    }

    async findStorageNodeStake(storageNodePublicKey: string) {
        const result = await this.apiPromise.query.ddcStaking.storages(storageNodePublicKey);
        return result.unwrapOr(undefined)?.toJSON() as unknown as ClusterId;
    }

    async findCdnNodeStake(cdnNodePublicKey: string) {
        const result = await this.apiPromise.query.ddcStaking.edges(cdnNodePublicKey);
        return result.unwrapOr(undefined)?.toJSON() as unknown as ClusterId;
    }

    setController(nodePublicKey: NodePublicKey) {
        return this.apiPromise.tx.ddcStaking.setController(nodePublicKey) as Sendable;
    }

    async listClusterManagers() {
        const result = await this.apiPromise.query.ddcStaking.clusterManagers();
        return result.toJSON() as unknown as AccountId[];
    }
}
