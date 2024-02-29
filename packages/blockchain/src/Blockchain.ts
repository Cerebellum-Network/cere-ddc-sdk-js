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

/**
 * This class provides methods to interact with the Cere blockchain.
 *
 * @group Blockchain
 * @example
 *
 * ```typescript
 * const blockchain = await Blockchain.connect({ wsEndpoint: 'wss://rpc.testnet.cere.network/ws' });
 * const account = '5D5PhZQNJzcJXVBxwJxZcsutjKPqUPydrvpu6HeiBfMae2Qu';
 * const balance = await blockchain.getAccountFreeBalance(account);
 *
 * console.log(balance);
 * ```
 */
export class Blockchain {
  private readonly apiPromise: ApiPromise;

  /**
   * The DDC Nodes pallet.
   * @category Pallets
   */
  public readonly ddcNodes: DDCNodesPallet;

  /**
   * The DDC Clusters pallet.
   * @category Pallets
   */
  public readonly ddcClusters: DDCClustersPallet;

  /**
   * The DDC Staking pallet.
   * @category Pallets
   */
  public readonly ddcStaking: DDCStakingPallet;

  /**
   * The DDC Customers pallet.
   * @category Pallets
   */
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

  /**
   * Connects to the blockchain and returns a new instance of the Blockchain class.
   *
   * @param options - Options for connecting to the blockchain.
   * @returns A promise that resolves to a new instance of the Blockchain class.
   *
   * Example usage:
   * ```typescript
   * const blockchain = await Blockchain.connect({ wsEndpoint: 'wss://rpc.testnet.cere.network/ws' });
   * ```
   */
  static async connect(options: BlockchainConnectOptions) {
    const blockchain = new Blockchain(options);
    await blockchain.isReady();

    return blockchain;
  }

  /**
   * Checks if the blockchain is ready.
   *
   * @returns A promise that resolves to `true` if the blockchain is ready.
   *
   * @example
   * ```typescript
   * const isReady = await blockchain.isReady();
   * console.log(isReady);
   * ```
   */
  async isReady() {
    await this.apiPromise.isReady;

    return true;
  }

  /**
   * The decimals of the chain's native token.
   */
  get chainDecimals() {
    const [decimals] = this.apiPromise.registry.chainDecimals;

    return decimals;
  }

  /**
   * Retrieves the next nonce for an account.
   *
   * @param address - The address of the account.
   * @returns A promise that resolves to the next nonce for the account.
   *
   * Example usage:
   * ```typescript
   * const nonce = await blockchain.getNextNonce('5D5PhZQNJzcJXVBxwJxZcsutjKPqUPydrvpu6HeiBfMae2Qu');
   *
   * console.log(nonce);
   * ```
   */
  async getNextNonce(address: string | AccountId) {
    const nonce = await this.apiPromise.rpc.system.accountNextIndex<Index>(address);

    return nonce.toNumber();
  }

  /**
   * Sends a transaction to the blockchain.
   *
   * @param sendable - The transaction to send.
   * @param options - Options for sending the transaction.
   * @returns A promise that resolves to the result of the transaction.
   *
   * Example usage:
   * ```typescript
   * const account = new UriSigner('//Alice');
   * const tx = blockchain.ddcCustomers.createBucket('0x...', { isPublic: true });
   *
   * const result = await blockchain.send(sendable, { account });
   *
   * console.log(result);
   * ```
   */
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

  /**
   * Sends a batch of transactions to the blockchain.
   * The transactions are sent in a single batch and are executed in the order they are provided.
   * If one transaction in the batch fails, the rest of the transactions in the batch will still be processed. The batch itself does not fail.
   *
   * @param sendables - The transactions to send.
   * @param options - Options for sending the transactions.
   * @returns A promise that resolves to the result of the batch of transactions.
   *
   * @example
   *
   * ```typescript
   * const account = new UriSigner('//Alice');
   * const tx1 = blockchain.ddcCustomers.createBucket('0x...');
   * const tx2 = blockchain.ddcCustomers.createBucket('0x...');
   *
   * const result = await blockchain.batchSend([tx1, tx2], { account });
   *
   * console.log(result);
   * ```
   */
  batchSend(sendables: Sendable[], options: SendOptions) {
    return this.send(this.apiPromise.tx.utility.batch(sendables), options);
  }

  /**
   * Sends a batch of transactions to the blockchain.
   * The transactions are sent in a single batch and are executed in the order they are provided.
   * If one transaction in the batch fails, the entire batch fails and no further transactions in the batch are processed.
   *
   * @param sendables - The transactions to send.
   * @param options - Options for sending the transactions.
   * @returns A promise that resolves to the result of the batch of transactions.
   *
   * @example
   *
   * ```typescript
   * const account = new UriSigner('//Alice');
   * const tx1 = blockchain.ddcCustomers.createBucket('0x...');
   * const tx2 = blockchain.ddcCustomers.createBucket('0x...');
   *
   * const result = await blockchain.batchAllSend([tx1, tx2], { account });
   *
   * console.log(result);
   * ```
   */
  batchAllSend(sendables: Sendable[], options: SendOptions) {
    return this.send(this.apiPromise.tx.utility.batchAll(sendables), options);
  }

  sudo(sendable: Sendable) {
    return this.apiPromise.tx.sudo.sudo(sendable) as Sendable;
  }

  /**
   * Disconnects from the blockchain.
   *
   * @returns A promise that resolves when the connection is closed.
   *
   * @example
   * ```typescript
   * await blockchain.disconnect();
   * ```
   */
  disconnect() {
    return this.apiPromise.disconnect();
  }

  formatBalance(balance: string | number | bigint, withUnit: boolean | string = 'CERE') {
    return formatBalance(balance, { withSiFull: true, decimals: this.chainDecimals, withUnit });
  }

  /**
   * Retrieves the free balance of an account.
   *
   * @param accountId - The account ID.
   * @returns A promise that resolves to the free balance of the account.
   *
   * @example
   * ```typescript
   * const balance = await blockchain.getAccountFreeBalance('5D5PhZQNJzcJXVBxwJxZcsutjKPqUPydrvpu6HeiBfMae2Qu');
   *
   * console.log(balance);
   * ```
   */
  async getAccountFreeBalance(accountId: AccountId) {
    const { data } = await this.apiPromise.query.system.account<AccountInfo>(accountId);
    return data.free.toBigInt();
  }

  /**
   * Retrieves the current block number.
   *
   * @returns A promise that resolves to the current block number.
   *
   * Example usage:
   * ```typescript
   * const blockchain = await Blockchain.connect({ wsEndpoint: 'wss://rpc.testnet.cere.network/ws' });
   * const blockNumber = await blockchain.getCurrentBlockNumber();
   *
   * console.log(blockNumber);
   * ```
   */
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
