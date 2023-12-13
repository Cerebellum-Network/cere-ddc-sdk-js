import { ApiPromise, WsProvider } from '@polkadot/api';
import { SignerOptions } from '@polkadot/api/types';
import { IKeyringPair } from '@polkadot/types/types';
import { Index } from '@polkadot/types/interfaces';
import { SubmittableExtrinsic } from '@polkadot/api-base/types';

import { DDCNodesPallet } from './DDCNodesPallet';
import { DDCClustersPallet } from './DDCClustersPallet';
import { DDCStakingPallet } from './DDCStakingPallet';
import { DDCCustomersPallet } from './DDCCustomersPallet';

export type SendOptions = Pick<Partial<SignerOptions>, 'nonce' | 'signer'> & {
  account: IKeyringPair | string;
};

export type BlockchainConnectOptions =
  | {
      apiPromise: ApiPromise;
    }
  | {
      wsEndpoint: string;
    };

export class Blockchain {
  public readonly ddcNodes: DDCNodesPallet;
  public readonly ddcClusters: DDCClustersPallet;
  public readonly ddcStaking: DDCStakingPallet;
  public readonly ddcCustomers: DDCCustomersPallet;
  private constructor(private apiPromise: ApiPromise) {
    this.ddcNodes = new DDCNodesPallet(apiPromise);
    this.ddcClusters = new DDCClustersPallet(apiPromise);
    this.ddcStaking = new DDCStakingPallet(apiPromise);
    this.ddcCustomers = new DDCCustomersPallet(apiPromise);
  }

  isReady() {
    return !!this.apiPromise.isReady;
  }

  async getNextNonce(address: string) {
    const nonce = await this.apiPromise.rpc.system.accountNextIndex<Index>(address);

    return nonce.toNumber();
  }

  async send(sendable: Sendable, { account, nonce, signer }: SendOptions) {
    return new Promise<SendResult>((resolve, reject) => {
      sendable
        .signAndSend(account, { nonce, signer }, (result) => {
          if (result.status.isFinalized) {
            const events = result.events.map(({ event }) => ({
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

  batchSend(sendables: Sendable[], options: SendOptions) {
    return this.send(this.apiPromise.tx.utility.batch(sendables), options);
  }

  batchAllSend(sendables: Sendable[], options: SendOptions) {
    return this.send(this.apiPromise.tx.utility.batchAll(sendables), options);
  }

  sudo(sendable: Sendable) {
    return this.apiPromise.tx.sudo.sudo(sendable) as Sendable;
  }

  disconnect() {
    return this.apiPromise.disconnect();
  }

  static async connect(options: BlockchainConnectOptions) {
    const api =
      'apiPromise' in options
        ? options.apiPromise
        : await ApiPromise.create({ provider: new WsProvider(options.wsEndpoint) });

    return new Blockchain(api);
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
