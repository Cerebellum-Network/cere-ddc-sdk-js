import './interfaces/augment-api';
import './interfaces/augment-types';
import {ApiPromise, WsProvider} from '@polkadot/api';
import {DDCNodesPallet} from './DDCNodesPallet';
import {DDCClustersPallet} from './DDCClustersPallet';
import {AddressOrPair, Signer} from '@polkadot/api/types';
import {SubmittableExtrinsic} from '@polkadot/api-base/types';
import {DDCStakingPallet} from './DDCStakingPallet';
import {DDCCustomersPallet} from './DDCCustomersPallet';

export class Blockchain {
    public readonly ddcNodes: DDCNodesPallet;
    public readonly ddcClusters: DDCClustersPallet;
    public readonly ddcStaking: DDCStakingPallet;
    public readonly ddcCustomers: DDCCustomersPallet;
    private constructor(private apiPromise: ApiPromise, private account: AddressOrPair, private signer?: Signer) {
        this.ddcNodes = new DDCNodesPallet(apiPromise);
        this.ddcClusters = new DDCClustersPallet(apiPromise);
        this.ddcStaking = new DDCStakingPallet(apiPromise);
        this.ddcCustomers = new DDCCustomersPallet(apiPromise);
    }

    send(sendable: Sendable) {
        return new Promise<SendResult>((resolve, reject) => {
            sendable
                .signAndSend(this.account, (result) => {
                    if (result.status.isFinalized) {
                        const events = result.events.map(({event}) => ({
                            method: event.method,
                            section: event.section,
                            meta: event.meta.toJSON(),
                            data: event.data.toJSON(),
                        }));

                        resolve({
                            events,
                            txHash: result.status.asFinalized.toHex(),
                        });
                    } else if (result.dispatchError) {
                        let errorMessage: string;

                        if (result.dispatchError.isModule) {
                            const decoded = this.apiPromise.registry.findMetaError(result.dispatchError.asModule);
                            errorMessage = `${decoded.section}.${decoded.name}: ${decoded.docs.join(' ')}`;
                        } else {
                            errorMessage = result.dispatchError.toString();
                        }
                        reject(new Error(errorMessage));
                    }
                })
                .catch(reject);
        });
    }

    batchSend(sendables: Sendable[]) {
        return this.send(this.apiPromise.tx.utility.batch(sendables));
    }

    static async create(
        options: {account: AddressOrPair; signer?: Signer} & ({apiPromise: ApiPromise} | {wsEndpoint: string}),
    ) {
        const apiPromise =
            'apiPromise' in options
                ? options.apiPromise
                : await ApiPromise.create({provider: new WsProvider(options.wsEndpoint)});
        await apiPromise.isReady;
        return new Blockchain(apiPromise, options.account, options.signer);
    }
}

export type Sendable = SubmittableExtrinsic<'promise'>;
export type SendResult = {
    events: Event[];
    txHash: string;
};
export type Event = {
    section: string;
    method: string;
    data?: any;
};
export type HexString = `0x${string}`;
