import { ApiPromise, WsProvider } from '@polkadot/api';
import { AddressOrPair, SignerOptions } from '@polkadot/api/types';
import { Index, AccountInfo } from '@polkadot/types/interfaces';
import { SubmittableExtrinsic } from '@polkadot/api-base/types';
import { formatBalance } from '@polkadot/util';

import { AccountId } from './types';
import { Signer } from './Signer';
import { DDCNodesPallet } from './DDCNodesPallet';
import { DDCClustersPallet } from './DDCClustersPallet';
import { DDCStakingPallet } from './DDCStakingPallet';
import { DDCCustomersPallet } from './DDCCustomersPallet';

export type SendOptions = Pick<Partial<SignerOptions>, 'nonce' | 'signer'> & {
  account: AddressOrPair | Signer;
};

export type BlockchainConnectOptions =
  | {
      apiPromise: ApiPromise;
    }
  | {
      wsEndpoint: string;
    };

export class Blockchain {
  private readonly apiPromise: ApiPromise;

  public readonly ddcNodes: DDCNodesPallet;
  public readonly ddcClusters: DDCClustersPallet;
  public readonly ddcStaking: DDCStakingPallet;
  public readonly ddcCustomers: DDCCustomersPallet;

  constructor(options: BlockchainConnectOptions) {
    this.apiPromise =
      'apiPromise' in options
        ? options.apiPromise
        : new ApiPromise({
            provider: new WsProvider(options.wsEndpoint),
          });

    this.ddcNodes = new DDCNodesPallet(this.apiPromise);
    this.ddcClusters = new DDCClustersPallet(this.apiPromise);
    this.ddcStaking = new DDCStakingPallet(this.apiPromise);
    this.ddcCustomers = new DDCCustomersPallet(this.apiPromise);
  }

  static async connect(options: BlockchainConnectOptions) {
    const blockchain = new Blockchain(options);
    await blockchain.isReady();

    return blockchain;
  }

  async isReady() {
    await this.apiPromise.isReady;

    return true;
  }

  async getNextNonce(address: string | AccountId) {
    const nonce = await this.apiPromise.rpc.system.accountNextIndex<Index>(address);

    return nonce.toNumber();
  }

  async send(sendable: Sendable, { account, nonce, signer }: SendOptions) {
    let finalAccount: AddressOrPair;
    let finalSigner = signer;

    /**
     * If the account is a Signer instance, we need to convert it to a blockchain signer
     */
    if (Signer.isSigner(account)) {
      finalSigner ||= await account.getSigner();
      finalAccount = account.address;
    } else {
      finalAccount = account;
    }

    return new Promise<SendResult>((resolve, reject) => {
      sendable
        .signAndSend(finalAccount, { nonce, signer: finalSigner }, (result) => {
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

  formatBalance(balance: string | number | bigint) {
    const [chainDecimals] = this.apiPromise.registry.chainDecimals;

    return formatBalance(balance, { withSiFull: true, decimals: chainDecimals, withUnit: 'CERE' });
  }

  async getAccountFreeBalance(accountId: AccountId) {
    const { data } = await this.apiPromise.query.system.account<AccountInfo>(accountId);
    return data.free.toBigInt();
  }

  async getCurrentBlockNumber() {
    const { number } = await this.apiPromise.rpc.chain.getHeader();
    return number.toNumber();
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
