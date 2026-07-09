import { ApiPromise } from '@polkadot/api';
import { ContractPromise } from '@polkadot/api-contract';
import type { WeightV2 } from '@polkadot/types/interfaces';
import { decodeAddress } from '@polkadot/util-crypto';

import customerDepositAbi from './customer_deposit.json';
import type { AccountId, ClusterId, StakingInfo } from './types';

/** Resolves and caches the customer-deposit ink! contract per cluster. */
export class CustomerDepositContracts {
  private cache = new Map<ClusterId, ContractPromise | null>();

  constructor(private api: ApiPromise) {}

  async resolve(clusterId: ClusterId): Promise<ContractPromise | undefined> {
    const cached = this.cache.get(clusterId);
    if (cached !== undefined) return cached ?? undefined;

    const govParams = await this.api.query.ddcClusters.clustersGovParams(clusterId);
    const address = (govParams.toJSON() as { customerDepositContract?: string } | null)?.customerDepositContract;

    // A populated, non-zero AccountId means a deployed contract. The all-zero
    // AccountId (and an absent field) means "no contract" → pallet fallback.
    // Confirmed on devnet: one cluster carries the zero address; mainnet has none.
    const isRealAddress = !!address && !this.isZeroAddress(address);
    const contract = isRealAddress ? new ContractPromise(this.api, customerDepositAbi, address!) : null;
    this.cache.set(clusterId, contract);
    return contract ?? undefined;
  }

  private isZeroAddress(address: string): boolean {
    // decodeAddress handles both ss58 and hex forms; zero AccountId32 = 32 zero bytes.
    return decodeAddress(address).every((b) => b === 0);
  }

  /** Dry-run the message to obtain the required WeightV2 (replaces gasLimit: -1). */
  static async estimateGas(
    contract: ContractPromise,
    message: string,
    caller: AccountId,
    value: bigint,
    args: unknown[],
  ): Promise<WeightV2> {
    const { gasRequired } = await contract.query[message](
      caller,
      { gasLimit: -1 as unknown as WeightV2, storageDepositLimit: null, value },
      ...args,
    );
    return gasRequired;
  }

  /** Read a customer balance via the (camelCased) DdcBalancesFetcher::getBalance message. */
  static async readBalance(contract: ContractPromise, owner: AccountId): Promise<StakingInfo | undefined> {
    const { result, output } = await contract.query['ddcBalancesFetcher::getBalance'](
      owner,
      { gasLimit: -1 as unknown as WeightV2, storageDepositLimit: null },
      owner,
    );
    if (!result.isOk || !output) return undefined;

    const json = (output.toJSON() as { ok?: { owner: string; total: string | number; active: string | number } }).ok;
    if (!json) return undefined;

    return { owner: json.owner, total: BigInt(json.total), active: BigInt(json.active) };
  }
}
