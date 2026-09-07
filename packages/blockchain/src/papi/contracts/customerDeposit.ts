import { getInkDynamicBuilder, getInkLookup, type InkMetadata } from '@polkadot-api/ink-contracts';
import { getSs58AddressInfo } from '@polkadot-api/substrate-bindings';

import type { CereApi } from '../api-types.js';
import type { Sendable } from '../tx.js';
import type { AccountId, ClusterId, StakingInfo } from '../../types.js';
import { toStakingInfo } from '../pallets/mapping.js';
// Imported from a generated .ts module rather than the .json directly: a JSON
// import emits a bare `import ... from '....json'`, which Node's ESM loader
// rejects without `with { type: 'json' }` (tsc does not add the attribute) —
// that made every deposit/balance call throw ERR_IMPORT_ATTRIBUTE_MISSING in a
// plain Node consumer. Regenerate with `npm run build:abi` in this package.
import abi from '../../customer_deposit.js';

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

// Last-resort `storage_deposit_limit`, as a multiple of the chain's existential
// deposit, used only when every sizing dry run failed (so the real charge is
// unknown). It must be non-zero — see `sizeCall` for why `None` is never sent —
// but it must also stay small, because the limit counts against the caller's
// spendable balance: the runtime rejects `value + limit` above what the account
// can afford with `StorageDepositNotEnoughFunds`, even when the *actual* charge
// would have been affordable. Measured live: a new customer ledger record costs
// 4.2 CERE (2 storage items + ~65 bytes at the chain's DepositPerItem/PerByte),
// and the existential deposit is 1 CERE on devnet/testnet — so 10x ED clears a
// first deposit with >2x headroom without needlessly inflating the balance the
// caller must hold.
const FALLBACK_SDL_IN_ED = 10n;

// The existential deposit on every Cere network (mainnet/testnet/devnet): 1
// CERE at 10 decimals. Used only as a defensive default when the runtime
// constant can't be read — see `getExistentialDeposit`. Hardcoded because ED is
// itself a constant, so a read failure means the node/metadata is unhealthy, not
// that the limit is zero; defaulting to 0n would collapse the storage-deposit
// limit and reintroduce the very `StorageDepositLimitExhausted` this module
// prevents. Mirrors `getChainDecimals`' fallback to `10` for the same reason.
const CERE_EXISTENTIAL_DEPOSIT = 10n ** 10n;

/** Gas + storage-deposit ceiling for one contract call, sized by dry run. */
export type CallSizing = {
  gasLimit: Weight;
  /** Explicit `storage_deposit_limit`. Never `undefined` — see `sizeCall`. */
  storageDepositLimit: bigint;
};

export interface CustomerDepositContract {
  /** Contract address for a cluster (from gov params), or undefined when none/zero. Cached. */
  resolve(clusterId: ClusterId): Promise<string | undefined>;
  /** A customer's balance from the contract, or undefined when the account has no deposit. Throws on a failed dry run. */
  readBalance(contractAddr: string, owner: AccountId): Promise<StakingInfo | undefined>;
  /** Dry-run a message to size both its gas and its storage-deposit ceiling. Never throws. */
  sizeCall(contractAddr: string, message: string, caller: AccountId, value: bigint, args: any): Promise<CallSizing>;
  /** Build a signed-ready `Contracts.call` extrinsic for a contract message. */
  buildContractCall(contractAddr: string, message: string, value: bigint, args: any, sizing: CallSizing): Sendable;
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
      maxBlock = api.constants.System.BlockWeights()
        .then((bw: any) => ({
          ref_time: BigInt(bw.max_block.ref_time),
          proof_size: BigInt(bw.max_block.proof_size),
        }))
        .catch((err) => {
          // Don't memoize a rejection — a transient fetch failure would
          // otherwise permanently break `cap()` (and thus every `cap()`
          // caller, including `sizeCall`) for the lifetime of this
          // contract instance. Clear the memo so the next call retries.
          maxBlock = undefined;
          throw err;
        });
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

  // Existential deposit, used as the unit for storage-deposit headroom. Cached
  // like `getMaxBlock` (constants are a papi METHOD returning a Promise), and
  // likewise never memoizing a rejection — a transient fetch failure clears the
  // memo so the next call retries. On a *persistent* failure it resolves to the
  // Cere ED default rather than rejecting: ED is a chain constant, so a read
  // failure means the node/metadata is unhealthy, not that ED is zero, and a
  // zero ED would collapse the storage-deposit limit to zero (reintroducing
  // `StorageDepositLimitExhausted` on a `None`-means-zero runtime — see #308).
  let existentialDeposit: Promise<bigint> | undefined;
  const getExistentialDeposit = () => {
    if (!existentialDeposit) {
      existentialDeposit = api.constants.Balances.ExistentialDeposit()
        .then((ed: any) => BigInt(ed))
        .catch(() => {
          existentialDeposit = undefined;
          return CERE_EXISTENTIAL_DEPOSIT;
        });
    }
    return existentialDeposit;
  };

  // What the caller could put toward a storage deposit for this call: free
  // balance less the value being transferred and the existential deposit it must
  // retain. Used as the probe limit on runtimes that reject `None` (see
  // `sizeCall`) — by construction the probe is affordable, which is what lets the
  // dry run get far enough to report the real charge. Returns 0n when the caller
  // has no headroom, or on any read failure (the caller then falls through to the
  // constant fallback rather than propagating).
  const affordableHeadroom = async (caller: AccountId, value: bigint): Promise<bigint> => {
    try {
      const [account, ed] = await Promise.all([
        api.query.System.Account.getValue(caller as any) as Promise<any>,
        getExistentialDeposit(),
      ]);
      const headroom = BigInt(account.data.free) - value - ed;
      return headroom > 0n ? headroom : 0n;
    } catch {
      return 0n;
    }
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

    async sizeCall(contractAddr, message, caller, value, args) {
      const msg = builder.buildMessage(message);
      const input = msg.call.enc(args ?? {});

      // One dry run under a given storage-deposit limit. Returns the run's
      // `gas_required` and the storage it would actually charge, or undefined if
      // the run failed at either level (dispatch or ink message) — in which case
      // both numbers are untrustworthy and must not be sized against.
      const attempt = async (sdl: bigint | undefined) => {
        const dry: any = await api.apis.ContractsApi.call(caller, contractAddr, value, GENEROUS, sdl, input);
        // `dry.result` is a papi Result (`{ success, value }`) at the DISPATCH
        // level: OutOfGas, revert, an unaffordable `value`, or a rejected
        // storage-deposit limit all land here.
        if (!dry?.result?.success) return undefined;
        // Symmetric with `readBalance`'s two-level decode: dispatch success alone
        // doesn't mean the ink message itself succeeded, and sizing off a
        // semantically-failed run is unsafe. Guarded defensively because
        // `sizeCall` must never throw — it always returns a usable sizing.
        try {
          const decoded: any = msg.value.dec(dry.result.value.data);
          if (!decoded?.success) return undefined;
        } catch {
          return undefined;
        }
        // `storage_deposit` is a `Charge | Refund` enum. Only a Charge costs the
        // caller anything; a Refund needs no headroom, so treat it as zero.
        const sd = dry.storage_deposit;
        const charge = sd?.type === 'Charge' ? BigInt(sd.value) : 0n;
        return { gasRequired: dry.gas_required, charge };
      };

      // Sizing is a two-step probe because the two Cere runtimes disagree on what
      // an unset `storage_deposit_limit` means (see #308):
      //
      //  - testnet reads `None` as UNLIMITED, so the first attempt succeeds and
      //    reports the true charge (measured live: 4.2 CERE for a new customer
      //    ledger record, 0 for a top-up that grows no storage);
      //  - devnet reads `None` as ZERO, so any storage-growing call is rejected
      //    outright with `StorageDepositLimitExhausted` and reports nothing
      //    usable. Retrying under an explicit, affordable limit gets the same run
      //    far enough to report the charge.
      //
      // Starting with `None` keeps the common case to a single dry run and avoids
      // spending the caller's headroom as a probe when the runtime doesn't need it.
      const headroom = await affordableHeadroom(caller, value);
      let sized = await attempt(undefined);
      if (!sized && headroom > 0n) sized = await attempt(headroom);

      const ed = await getExistentialDeposit();

      if (!sized) {
        // Nothing to size against: the caller may be unfunded, the contract may
        // be reverting, or the node may be unhealthy. Provision generously on gas
        // and fall back to a fixed storage ceiling — crucially still an explicit
        // one, because `None` is what makes first deposits fail outright on a
        // runtime that reads it as zero. `ed` never resolves to 0n (see
        // `getExistentialDeposit`), so this ceiling is never effectively zero.
        return { gasLimit: await cap(GENEROUS), storageDepositLimit: FALLBACK_SDL_IN_ED * ed };
      }

      const gr = sized.gasRequired;
      // The measured charge plus one existential deposit of slack for state drift
      // between this dry run and the real call — then capped at the headroom the
      // probe already proved affordable. Without the cap, the `+ed` slack can land
      // in a ~1-ED window where the probe succeeded but the real submit is
      // rejected with `StorageDepositNotEnoughFunds`: the runtime charges
      // `value + limit` against spendable balance (`free - ed`), so a limit of
      // `charge + ed` needs `value + charge + 2·ed ≤ free`, one ED tighter than
      // the probe's `value + charge ≤ free - ed`. A successful probe guarantees
      // `charge ≤ headroom`, so capping at `headroom` still leaves `limit ≥ charge`
      // (no `StorageDepositLimitExhausted`) while keeping the submit affordable.
      const slack = sized.charge + ed;
      const limit = slack < headroom ? slack : headroom;
      return {
        // 2x safety margin — the dry run is priced against possibly-stale state,
        // so a verbatim `gas_required` can undershoot.
        gasLimit: await cap({ ref_time: BigInt(gr.ref_time) * 2n, proof_size: BigInt(gr.proof_size) * 2n }),
        storageDepositLimit: limit,
      };
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
      if (ledger == null) return undefined;
      // The decoded `Ledger.owner` is a fixed WRONG SS58 address on this
      // contract (a known on-chain/ABI quirk — `total`/`active` decode
      // correctly; only `owner` is bogus). The `owner` argument we queried
      // WITH is, by definition, the account this balance belongs to, so it's
      // authoritative here — override the decoded field with it rather than
      // trusting the contract's mis-encoded value.
      return { ...toStakingInfo(ledger), owner };
    },

    buildContractCall(contractAddr, message, value, args, sizing) {
      const data = builder.buildMessage(message).call.enc(args ?? {});
      return api.tx.Contracts.call({
        dest: { type: 'Id', value: contractAddr } as any,
        value,
        gas_limit: sizing.gasLimit,
        // Always an explicit limit, never `None`: devnet's contracts pallet reads
        // `None` as a ZERO ceiling, which rejects every storage-growing call —
        // i.e. every first-time deposit — with `StorageDepositLimitExhausted`
        // (#308). `sizeCall` derives the value from a dry run.
        storage_deposit_limit: sizing.storageDepositLimit,
        data,
      } as any) as Sendable;
    },
  };
}
