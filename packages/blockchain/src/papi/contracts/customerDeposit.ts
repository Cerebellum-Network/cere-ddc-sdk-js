import { getInkDynamicBuilder, getInkLookup, type InkMetadata } from '@polkadot-api/ink-contracts';
import { getSs58AddressInfo } from '@polkadot-api/substrate-bindings';

import type { CereApi } from '../api-types.js';
import type { Sendable } from '../tx.js';
import type { AccountId, ClusterId, StakingInfo } from '../../types.js';
import { toStakingInfo } from '../pallets/mapping.js';
import abi from '../../customer_deposit.json';

type Weight = { ref_time: bigint; proof_size: bigint };

// Large-but-safe gas ceiling for the sizing dry run (and, when a dry run still
// fails, for the real call). The conventional `gasLimit: -1` "unlimited"
// sentinel is NOT honored by this contracts-pallet/runtime pairing (the dry run
// returns OutOfGas immediately), so the dry run itself needs a real ceiling.
// Kept well under the chain's per-extrinsic ceiling — asking near the full block
// weight gets a submitted tx rejected by the pool ("would exhaust the block
// limits"). Verified against devnet: a real `get_balance` dry run needs only
// ~277M ref_time / ~53KB proof_size, far below this.
const GENEROUS: Weight = { ref_time: 10_000_000_000n, proof_size: 1_000_000n };

export interface CustomerDepositContract {
  /** Contract address for a cluster (from gov params), or undefined when none/zero. Cached. */
  resolve(clusterId: ClusterId): Promise<string | undefined>;
  /** A customer's balance from the contract, or undefined when the account has no deposit. Throws on a failed dry run. */
  readBalance(contractAddr: string, owner: AccountId): Promise<StakingInfo | undefined>;
  /** Dry-run a message to size its gas (2x margin, capped at the chain ceiling); falls back to the generous ceiling on failure. */
  estimateGas(contractAddr: string, message: string, caller: AccountId, value: bigint, args: any): Promise<Weight>;
  /** Build a signed-ready `Contracts.call` extrinsic for a contract message. */
  buildContractCall(contractAddr: string, message: string, value: bigint, args: any, gasLimit: Weight): Sendable;
}

export function createCustomerDepositContract(api: CereApi): CustomerDepositContract {
  // ink dynamic builder (verified in the 2c spike): getInkLookup(abi) →
  // getInkDynamicBuilder(lookup) exposes buildMessage(label) → { call, value },
  // where `call.enc(args)` produces the SCALE input bytes (4-byte selector +
  // encoded args) and `value.dec(bytes)` decodes the message return.
  const builder = getInkDynamicBuilder(getInkLookup(abi as unknown as InkMetadata));
  const cache = new Map<ClusterId, string | null>();
  // The chain's per-extrinsic weight ceiling — `System.BlockWeights` is a papi
  // constants METHOD returning a Promise (not a sync value), so fetch it lazily
  // and cache the promise. `max_block` is a Weight `{ ref_time, proof_size }`.
  let maxBlock: Promise<Weight> | undefined;
  const getMaxBlock = () => {
    if (!maxBlock) {
      maxBlock = api.constants.System.BlockWeights().then((bw: any) => ({
        ref_time: BigInt(bw.max_block.ref_time),
        proof_size: BigInt(bw.max_block.proof_size),
      }));
    }
    return maxBlock;
  };

  // "No contract" is signalled by an absent field, an unparseable address, or
  // the all-zero AccountId32 (verified live: one devnet cluster carries the zero
  // address). `getSs58AddressInfo` returns a discriminated union — `.publicKey`
  // only exists when `.isValid` is true (2c spike finding).
  const isNoContract = (addr: string): boolean => {
    const info = getSs58AddressInfo(addr);
    return !info.isValid || info.publicKey.every((b) => b === 0);
  };

  const cap = async (w: Weight): Promise<Weight> => {
    const max = await getMaxBlock();
    return {
      ref_time: w.ref_time < max.ref_time ? w.ref_time : max.ref_time,
      proof_size: w.proof_size < max.proof_size ? w.proof_size : max.proof_size,
    };
  };

  return {
    async resolve(clusterId) {
      const cached = cache.get(clusterId);
      if (cached !== undefined) return cached ?? undefined;
      const gov: any = await api.query.DdcClusters.ClustersGovParams.getValue(clusterId as any);
      const addr = gov?.customer_deposit_contract;
      const contract = addr && !isNoContract(String(addr)) ? String(addr) : null;
      cache.set(clusterId, contract);
      return contract ?? undefined;
    },

    async estimateGas(contractAddr, message, caller, value, args) {
      const input = builder.buildMessage(message).call.enc(args ?? {});
      const dry: any = await api.apis.ContractsApi.call(caller, contractAddr, value, GENEROUS, undefined, input);
      // `dry.result` is a papi Result (`{ success, value }`) at the DISPATCH
      // level. A failed dry run (OutOfGas, revert, unaffordable value for the
      // placeholder caller, …) leaves `gas_required` untrustworthy, so fall back
      // to the generous ceiling rather than under-provisioning the real call.
      if (!dry?.result?.success) return cap(GENEROUS);
      const gr = dry.gas_required;
      // 2x safety margin — the dry run is priced against possibly-stale state and
      // a placeholder caller, so a verbatim `gas_required` can undershoot.
      return cap({ ref_time: BigInt(gr.ref_time) * 2n, proof_size: BigInt(gr.proof_size) * 2n });
    },

    async readBalance(contractAddr, owner) {
      const msg = builder.buildMessage('DdcBalancesFetcher::get_balance');
      const input = msg.call.enc({ owner });
      const dry: any = await api.apis.ContractsApi.call(owner, contractAddr, 0n, GENEROUS, undefined, input);
      // Dispatch-level failure (node issue, contract trap, OutOfGas) is a genuine
      // problem — never conflate it with "no deposit", or a broken query reads as
      // a zero balance. Throw so the caller sees it.
      if (!dry?.result?.success) {
        throw new Error(`get_balance dry run failed: ${JSON.stringify(dry?.result)}`);
      }
      // `value.dec` decodes the ink `MessageResult<Option<Ledger>>` to
      // `{ success, value }` (2c spike): outer `success` is the ink-level
      // Ok/Err (a false = contract LangError → throw), `value` is the
      // `Option<Ledger>` → the `Ledger` struct or `undefined` when the account
      // has no deposit (Ok(None)). Verified live against a real depositor.
      const decoded: any = msg.value.dec(dry.result.value.data);
      if (!decoded?.success) {
        throw new Error(`get_balance returned a contract error: ${JSON.stringify(decoded)}`);
      }
      const ledger = decoded.value;
      return ledger == null ? undefined : toStakingInfo(ledger);
    },

    buildContractCall(contractAddr, message, value, args, gasLimit) {
      const data = builder.buildMessage(message).call.enc(args ?? {});
      return api.tx.Contracts.call({
        dest: { type: 'Id', value: contractAddr } as any,
        value,
        gas_limit: gasLimit,
        storage_deposit_limit: undefined,
        data,
      } as any) as Sendable;
    },
  };
}
