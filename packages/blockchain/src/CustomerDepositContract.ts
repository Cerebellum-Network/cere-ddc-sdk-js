import { ApiPromise } from '@polkadot/api';
import { ContractPromise } from '@polkadot/api-contract';
import { WeightV2 } from '@polkadot/types/interfaces';
import { SubmittableExtrinsic } from '@polkadot/api-base/types';
import { AccountId } from './index';
import customerDepositAbi from './abi/customer_deposit.json';

type Sendable = SubmittableExtrinsic<'promise'>;

/**
 * Ledger client balance information
 */
export interface Ledger {
  /** The owner of the account whose balance is blocked for DDC */
  owner: AccountId;
  /** Total balance of the owner */
  total: bigint;
  /** Active owner balance amount for DDC payments */
  active: bigint;
  /** Balances in the process of unlocking */
  unlocking: UnlockChunk[];
}

/**
 * Information on unblocking funds
 */
export interface UnlockChunk {
  /** Amount to unlock */
  value: bigint;
  /** Block number where funds will be unlocked */
  block: number;
} /**
 * Wrapper class for working with the customer deposit smart contract.
 * Provides methods for managing customer deposits via the smart contract
 *
 * @example
 * ```typescript
 * const contract = new CustomerDepositContract(api, contractAddress);
 * const balance = await contract.getBalance('5D5PhZQNJzcJXVBxwJxZcsutjKPqUPydrvpu6HeiBfMae2Qu');
 * ```
 */
export class CustomerDepositContract {
  private readonly apiPromise: ApiPromise;
  private readonly contract: ContractPromise;
  private readonly defaultGasLimit: WeightV2;

  constructor(apiPromise: ApiPromise, contractAddress: string) {
    this.apiPromise = apiPromise;
    this.contract = new ContractPromise(apiPromise, customerDepositAbi, contractAddress);
    this.defaultGasLimit = apiPromise.registry.createType('WeightV2', {
      refTime: 10000000000n,
      proofSize: 10000000000n,
    });
  }

  /**
   * Gets the client's balance in the DDC cluster.
   *
   * @param owner - The address of the account owner
   * @returns Promise that resolves to balance information or null if the balance is not found
   *
   * @example
   * ```typescript
   * const balance = await contract.getBalance('5D5PhZQNJzcJXVBxwJxZcsutjKPqUPydrvpu6HeiBfMae2Qu');
   * console.log(balance);
   * ```
   */
  async getBalance(owner: AccountId): Promise<Ledger | null> {
    try {
      const { result } = await this.contract.query['ddcBalancesFetcher::getBalance'](
        owner,
        { gasLimit: this.defaultGasLimit },
        owner,
      );

      console.log('Smart contract query result type:', typeof result);
      console.log('Smart contract query result:', result);

      if (result && (result as any).isOk) {
        const rawResult = (result as any).asOk;
        console.log('Raw result:', rawResult);
        console.log('Raw result type:', typeof rawResult);
        console.log('Raw result data:', rawResult.data);
        console.log('Raw result flags:', rawResult.flags);

        try {
          const rawData = rawResult.data;
          if (!rawData) {
            console.log('No raw data found');
            return null;
          }

          console.log('Raw hex data:', rawData.toHex());
          const hexData = rawData.toHex();

          console.log('First bytes:', hexData.slice(0, 8)); // первые 4 байта
          console.log('Second byte (Option discriminant):', hexData.slice(4, 6)); // второй байт

          const optionDiscriminant = hexData.slice(4, 6);

          if (optionDiscriminant === '01') {
            console.log('Option is Some - parsing ledger data...');

            const ledgerHex = '0x' + hexData.slice(6);
            console.log('Ledger hex:', ledgerHex);

            if (ledgerHex.length >= 130) {
              const accountHex = ledgerHex.slice(0, 66); // 32 bytes = 64 hex chars + 0x
              const totalHex = '0x' + ledgerHex.slice(66, 98); // 16 bytes = 32 hex chars
              const activeHex = '0x' + ledgerHex.slice(98, 130); // 16 bytes = 32 hex chars

              console.log('Account hex:', accountHex);
              console.log('Total hex:', totalHex);
              console.log('Active hex:', activeHex);

              const totalBytes = totalHex.slice(2).match(/.{2}/g)?.reverse().join('') || '0';
              const activeBytes = activeHex.slice(2).match(/.{2}/g)?.reverse().join('') || '0';

              const total = BigInt('0x' + totalBytes);
              const active = BigInt('0x' + activeBytes);

              console.log('Parsed total:', total.toString());
              console.log('Parsed active:', active.toString());

              return {
                owner: owner,
                total,
                active,
                unlocking: [],
              };
            } else {
              console.error('Insufficient hex data length:', ledgerHex.length);
              return null;
            }
          } else if (optionDiscriminant === '00') {
            console.log('Option is None - no balance data');
            return null;
          } else {
            console.error('Unknown Option discriminant:', optionDiscriminant);
            return null;
          }
        } catch (parseError) {
          console.error('Error parsing raw data:', parseError);
          return null;
        }
      } else {
        console.error('Smart contract query failed - not OK result:', result);
        if (result && (result as any).isErr) {
          console.error('Error details:', (result as any).asErr);
        }
        return null;
      }
    } catch (error) {
      console.error('Error getting balance:', error);
    }
    return null;
  }

  /**
   * Gets client balances in a DDC cluster with pagination.
   *
   * @param fromIndex - Start index for pagination
   * @param limit - Limit on the number of records
   * @returns Promise that resolves to an array of balances
   *
   * @example
   * ```typescript
   * const balances = await contract.getBalances(0, 10);
   * console.log(balances);
   * ```
   */
  async getBalances(fromIndex: number, limit: number): Promise<Ledger[]> {
    try {
      const { result } = await this.contract.query['ddcBalancesFetcher::getBalances'](
        'anyone', // caller doesn't matter for queries
        { gasLimit: this.defaultGasLimit },
        fromIndex,
        limit,
      );

      if (result && (result as any).isOk) {
        const balances = (result as any).asOk;
        if (Array.isArray(balances)) {
          return balances.map((data: any) => ({
            owner: data.owner?.toString() || '',
            total: BigInt(data.total?.toString() || '0'),
            active: BigInt(data.active?.toString() || '0'),
            unlocking:
              data.unlocking?.map((chunk: any) => ({
                value: BigInt(chunk.value?.toString() || '0'),
                block: Number(chunk.block) || 0,
              })) || [],
          }));
        }
      }
    } catch (error) {
      console.error('Error getting balances:', error);
    }
    return [];
  }

  /**
   * Tops up balance the deposit balance on behalf of the owner.
   *
   * @param value - Amount to deposit
   * @returns Transaction to execute
   *
   * @example
   * ```typescript
   * const tx = contract.deposit(100n);
   * const result = await blockchain.send(tx, { account: signer });
   * ```
   */
  deposit(value: bigint): Sendable {
    const tx = this.contract.tx['ddcBalancesDepositor::deposit']({
      gasLimit: this.defaultGasLimit,
      storageDepositLimit: null,
      value,
    });
    return tx as unknown as Sendable;
  }

  /**
   * Tops up the deposit balance for a specific owner on behalf of the faucet.
   *
   * @param clusterId - Cluster ID for the deposit
   * @param owner - Account owner address to top up
   * @param value - Amount to deposit
   * @returns Transaction to execute
   *
   * @example
   * ```typescript
   * const tx = contract.depositFor('0x...', '5D5PhZQNJzcJXVBxwJxZcsutjKPqUPydrvpu6HeiBfMae2Qu', 100n);
   * const result = await blockchain.send(tx, { account: signer });
   * ```
   */
  depositFor(clusterId: string, owner: AccountId, value: bigint): Sendable {
    const tx = this.contract.tx['ddcBalancesDepositor::depositFor'](
      {
        gasLimit: this.defaultGasLimit,
        storageDepositLimit: null,
      },
      clusterId,
      value,
      owner,
    );
    return tx as unknown as Sendable;
  }

  /**
   * Initiates unlocking of the deposit balance on behalf of the owner.
   *
   * @param clusterId - Cluster ID to unlock the deposit
   * @param value - Amount to unlock
   * @returns Transaction to execute
   *
   * @example
   * ```typescript
   * const tx = contract.unlockDeposit('0x...', 50n);
   * const result = await blockchain.send(tx, { account: signer });
   * ```
   */
  unlockDeposit(clusterId: string, value: bigint): Sendable {
    const tx = this.contract.tx['ddcBalancesDepositor::unlockDeposit'](
      {
        gasLimit: this.defaultGasLimit,
        storageDepositLimit: null,
      },
      clusterId,
      value,
    );
    return tx as unknown as Sendable;
  }

  /**
   * Outputs the unlocked deposit balance on behalf of the owner.
   *
   * @returns The transaction to execute
   *
   * @example
   * ```typescript
   * const tx = contract.withdrawUnlocked('0x...');
   * const result = await blockchain.send(tx, { account: signer });
   * ```
   */
  withdrawUnlocked(clusterId: string): Sendable {
    const tx = this.contract.tx['ddcBalancesDepositor::withdrawUnlocked'](
      {
        gasLimit: this.defaultGasLimit,
        storageDepositLimit: null,
      },
      clusterId,
    );
    return tx as unknown as Sendable;
  }

}
