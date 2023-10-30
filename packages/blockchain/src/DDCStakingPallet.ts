import { ApiPromise } from "@polkadot/api";
import {Sendable} from './Blockchain';
import {NodePublicKey} from './DDCNodesPallet';

export class DDCStakingPallet {
    constructor(private apiPromise: ApiPromise) {}

    bond(controller: string, nodePublicKey: NodePublicKey, bondAmount: number) {
        return this.apiPromise.tx.ddcStaking.bond(controller, nodePublicKey, bondAmount) as Sendable
    }

    unbond(value: number) {
        return this.apiPromise.tx.ddcStaking.unbond(value) as Sendable
    }

    findStorageNodeStake (storageNodePublicKey: string) {
        return this.apiPromise.query.ddcStaking.storages(storageNodePublicKey)
    }

    findCdnNodeStake (cdnNodePublicKey: string) {
        return this.apiPromise.query.ddcStaking.edges(cdnNodePublicKey)
    }

    setController (nodePublicKey: NodePublicKey) {
        return this.apiPromise.tx.ddcStaking.setController(nodePublicKey) as Sendable
    }

    listClusterManagers () {
        return this.apiPromise.query.ddcStaking.clusterManagers()
    }
}
