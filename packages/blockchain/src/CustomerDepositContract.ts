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
    // Verified against devnet: the conventional `gasLimit: -1` ("unlimited") sentinel is
    // NOT honored by this @polkadot/api / runtime pairing — the dry run comes back
    // `OutOfGas` immediately (gasRequired 0), for every caller, funded or not. So the dry
    // run itself must be given a real, generous gas ceiling or it can never succeed.
    const gasLimit = this.chainGasCeiling(contract.api as ApiPromise);
    const { result, gasRequired } = await contract.query[message](
      caller,
      { gasLimit, storageDepositLimit: null, value },
      ...args,
    );

    // The dry run is executed as a fixed placeholder caller (see OWNER_PLACEHOLDER in
    // DDCCustomersPallet). If it still doesn't succeed even with a generous gas ceiling —
    // e.g. a payable message where the placeholder can't cover `value`, or any other
    // genuine revert — `gasRequired` is not a trustworthy size (it can read as 0 or an
    // understated partial figure). Using it as-is risks the real, signed transaction
    // failing with OutOfGas, so fall back to the same generous ceiling for the real call
    // instead. Unused gas in a contracts-pallet call is refunded/not charged, so an
    // oversized limit costs nothing beyond the gas the real call actually consumes.
    if (!result.isOk) {
      return gasLimit;
    }

    // The dry run is priced against an unfunded/placeholder caller and against state
    // that may be slightly stale by the time the real, signed transaction lands, so a
    // verbatim `gasRequired` can undershoot and cause the real deposit to revert
    // OutOfGas — apply a 2x safety margin, capped at the chain's own per-extrinsic ceiling.
    return this.capWeight(
      contract.api as ApiPromise,
      gasRequired.refTime.toBigInt() * 2n,
      gasRequired.proofSize.toBigInt() * 2n,
    );
  }

  /**
   * A large-but-safe WeightV2 gas ceiling, used both to make the sizing dry run itself
   * reliable (see estimateGas) and, when a dry run still fails, as the gas limit for the
   * real transaction so gas is never silently understated.
   *
   * Deliberately capped well under the chain's own per-extrinsic weight ceiling
   * (`system.blockWeights.maxBlock`) — asking for something close to the full block
   * weight gets a *real, submitted* transaction rejected by the transaction pool with
   * "Transaction would exhaust the block limits" (verified against devnet). The fixed
   * ceiling below is comfortably above real-world contract gas usage (observed ~1.3B
   * refTime / ~100KB proofSize for a deposit call) while staying far from that limit.
   */
  private static chainGasCeiling(api: ApiPromise): WeightV2 {
    const GENEROUS_REF_TIME = 10_000_000_000n;
    const GENEROUS_PROOF_SIZE = 1_000_000n;

    return this.capWeight(api, GENEROUS_REF_TIME, GENEROUS_PROOF_SIZE);
  }

  /** Cap a candidate (refTime, proofSize) pair at the chain's own per-extrinsic ceiling. */
  private static capWeight(api: ApiPromise, refTime: bigint, proofSize: bigint): WeightV2 {
    // `system.blockWeights` isn't part of the statically-augmented API surface this
    // package builds against, so it types as a bare `Codec`; cast to its known shape
    // (frame_system::limits::BlockWeights) to reach the nested weight fields.
    const maxBlock = (api.consts.system.blockWeights as unknown as { maxBlock: WeightV2 }).maxBlock;
    const maxBlockRefTime = maxBlock.refTime.toBigInt();
    const maxBlockProofSize = maxBlock.proofSize.toBigInt();

    return api.registry.createType('WeightV2', {
      refTime: refTime < maxBlockRefTime ? refTime : maxBlockRefTime,
      proofSize: proofSize < maxBlockProofSize ? proofSize : maxBlockProofSize,
    }) as unknown as WeightV2;
  }

  /** Read a customer balance via the (camelCased) DdcBalancesFetcher::getBalance message. */
  static async readBalance(contract: ContractPromise, owner: AccountId): Promise<StakingInfo | undefined> {
    // Same broken `-1` sentinel as estimateGas (see above) — must dry-run with a real
    // gas ceiling or this always comes back OutOfGas and silently reads as "no deposit".
    const gasLimit = this.chainGasCeiling(contract.api as ApiPromise);
    const { result, output } = await contract.query['ddcBalancesFetcher::getBalance'](
      owner,
      { gasLimit, storageDepositLimit: null },
      owner,
    );
    // A dispatch/execution failure is a genuine problem (node issue, bad ABI, contract
    // trap, etc.) — it must not be conflated with "no deposit exists", or callers would
    // silently treat a broken query as a zero balance. Throw so the caller can see it.
    if (!result.isOk) {
      throw new Error(`ddcBalancesFetcher::getBalance dry run failed: ${JSON.stringify(result.toHuman())}`);
    }
    if (!output) return undefined;

    const json = (output.toJSON() as { ok?: { owner: string; total: string | number; active: string | number } }).ok;
    if (!json) return undefined;

    return { owner: json.owner, total: BigInt(json.total), active: BigInt(json.active) };
  }
}
