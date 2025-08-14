import { ApiPromise } from '@polkadot/api';
import { ContractPromise } from '@polkadot/api-contract';
import { WeightV2 } from '@polkadot/types/interfaces';
import { SubmittableExtrinsic } from '@polkadot/api-base/types';
import { AccountId } from './index';
import customerDepositAbi from './abi/customer_deposit.json';

type Sendable = SubmittableExtrinsic<'promise'>;

export interface Ledger {
  owner: AccountId;
  total: bigint;
  active: bigint;
  unlocking: UnlockChunk[];
}

export interface UnlockChunk {
  value: bigint;
  block: number;
}

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

  private toBigIntSafe(value: string | number | bigint): bigint {
    if (typeof value === 'string') {
      value = value.replace(/[^\d-]/g, '');
    }
    return BigInt(value);
  }

  /**
   * Gets the client's balance in the DDC cluster.
   *
   * @param owner - The address of the account owner
   * @returns Promise that resolves to balance information or null if the balance is not found
   */
  async getBalance(owner: AccountId): Promise<Ledger | null> {
    try {
      const { result, output } = await this.contract.query['ddcBalancesFetcher::getBalance'](
        owner,
        { gasLimit: this.defaultGasLimit },
        owner,
      );

      if (!result.isOk || !output) {
        return null;
      }

      const humanOutput = (output as any).toHuman();

      if (humanOutput.Err || !humanOutput.Ok) {
        return null;
      }

      const optionLedger = humanOutput.Ok;
      if (!optionLedger) {
        console.log('No ledger data found (Option::None)');
        return null;
      }

      const ledgerData = optionLedger;

      return {
        owner: ledgerData.owner || owner,
        total: this.toBigIntSafe(ledgerData.total),
        active: this.toBigIntSafe(ledgerData.active),
        unlocking: (ledgerData.unlocking || []).map((chunk: any) => ({
          value: this.toBigIntSafe(chunk.value),
          block: Number(chunk.block) || 0,
        })),
      };
    } catch (error) {
      console.error('Error getting balance:', error);
      return null;
    }
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
