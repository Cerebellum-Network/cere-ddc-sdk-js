import './interfaces/augment-api';
import './interfaces/augment-types';
import {ApiPromise, WsProvider} from '@polkadot/api';
import {DDCNodesPallet} from './DDCNodesPallet';
import {DDCClustersPallet} from './DDCClustersPallet';
import {AddressOrPair, Signer} from '@polkadot/api/types';
import {SubmittableExtrinsic} from '@polkadot/api-base/types';
import {DDCStakingPallet} from './DDCStakingPallet';

export class Blockchain {
    public readonly ddcNodes: DDCNodesPallet;
    public readonly ddcClusters: DDCClustersPallet;
    public readonly ddcStaking: DDCStakingPallet;

    private constructor(private apiPromise: ApiPromise, private account: AddressOrPair, private signer?: Signer) {
        this.ddcNodes = new DDCNodesPallet(apiPromise)
        this.ddcClusters = new DDCClustersPallet(apiPromise)
        this.ddcStaking = new DDCStakingPallet(apiPromise)
    }

    send(sendable: Sendable) {
        return new Promise<SendResult>((resolve, reject) => {
            sendable.signAndSend(this.account, (result) => {
                if (result.status.isFinalized) {
                    resolve(result)
                } else if (result.dispatchError) {
                    reject(new Error(result.dispatchError.toString()))
                }
            }).catch(reject)
        })
    }

    batchSend(sendables: Sendable[]) {
        return this.send(this.apiPromise.tx.utility.batch(sendables))
    }

    static async create(options: {account: AddressOrPair, signer?: Signer} & ({apiPromise: ApiPromise} | {wsEndpoint: string})) {
        const apiPromise = 'apiPromise' in options
            ? options.apiPromise
            : await ApiPromise.create({provider: new WsProvider(options.wsEndpoint)});
        await apiPromise.isReady;
        return new Blockchain(apiPromise, options.account, options.signer);
    }
}

export type Sendable = SubmittableExtrinsic<'promise'>
export type SendResult = unknown
export type HexString = `0x${string}`
