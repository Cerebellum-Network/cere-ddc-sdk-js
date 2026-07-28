import { createCustomerDepositContract } from '@cere-ddc-sdk/blockchain';

/**
 * Offline coverage for the storage-deposit-limit sizing introduced for #308/#309.
 *
 * The two Cere runtimes disagree on what an unset `storage_deposit_limit` means:
 * testnet reads `None` as unlimited, devnet reads it as ZERO — which rejects any
 * storage-growing call (i.e. every first-time deposit) with
 * `StorageDepositLimitExhausted`. These tests drive the sizing logic with a fake
 * `ContractsApi` that reproduces each runtime, so both paths are covered without
 * a chain.
 */

const CERE = 10_000_000_000n; // 10 decimals
const ED = 1n * CERE; // existential deposit on devnet/testnet
const CHARGE = 42_000_000_000n; // 4.2 CERE — measured cost of a new ledger record

// Minimal ink! ABI exposing one payable message, so `buildMessage(...).call.enc`
// and `.value.dec` work without pulling in the real 27KB contract metadata.
// `sizeCall` only needs the selector to encode and the return to decode.
const CONTRACT = '6RENLbanoBrvRrmyCXDQuvsoHRJDQ7fBRa4jDB4d7CheR9tk';
const CALLER = '6US5V6cQotopMThpmgaPBQzLK8JxjZ7yCcXCZkKhpNbvYq2d';
const MESSAGE = 'DdcBalancesDepositor::deposit';

type DryRun = { sdl: bigint | undefined; ok: boolean };

/**
 * @param semantics 'unlimited' — `None` means no ceiling (testnet).
 *                  'zero'      — `None` means a 0 ceiling, so a storage-growing
 *                                call fails unless an explicit limit is sent (devnet).
 * @param free      caller's free balance.
 * @param charge    storage the call would actually consume.
 */
const makeApi = (semantics: 'unlimited' | 'zero', free: bigint, charge = CHARGE) => {
  const calls: DryRun[] = [];
  const built: any[] = [];
  const api: any = {
    constants: {
      System: { BlockWeights: async () => ({ max_block: { ref_time: 10n ** 13n, proof_size: 10n ** 7n } }) },
      Balances: { ExistentialDeposit: async () => ED },
    },
    query: {
      System: { Account: { getValue: async () => ({ data: { free } }) } },
      DdcClusters: { ClustersGovParams: { getValue: async () => ({ customer_deposit_contract: CONTRACT }) } },
    },
    apis: {
      ContractsApi: {
        call: async (_caller: string, _dest: string, value: bigint, _gas: any, sdl: bigint | undefined) => {
          // The runtime charges `value + limit` against the caller's spendable
          // balance (free less the existential deposit it must retain) — verified
          // live on devnet, where cap=5 CERE + value=1 CERE was rejected against a
          // 6.19 CERE balance with StorageDepositNotEnoughFunds.
          const spendable = free - ED;
          const limit = sdl ?? (semantics === 'zero' ? 0n : charge);
          const affordable = value + limit <= spendable;
          const withinLimit = charge <= limit;
          const ok = affordable && withinLimit;
          calls.push({ sdl, ok });
          return {
            gas_consumed: { ref_time: 1n, proof_size: 1n },
            gas_required: ok ? { ref_time: 1_000_000n, proof_size: 50_000n } : { ref_time: 0n, proof_size: 0n },
            storage_deposit: { type: 'Charge', value: ok ? charge : 0n },
            // Two-level result: papi dispatch Result wrapping the ink MessageResult.
            // `data` is decoded by the ink builder; an empty Ok payload decodes to a
            // successful MessageResult for this stub ABI.
            result: ok ? { success: true, value: { flags: 0, data: new Uint8Array([0, 0]) } } : { success: false },
          };
        },
      },
    },
    tx: { Contracts: { call: (args: any) => ({ __tx: args }) } },
  };
  return { api, calls, built };
};

describe('deposit contract call sizing (offline)', () => {
  it('sends an explicit, derived storage_deposit_limit — never None', async () => {
    const { api } = makeApi('unlimited', 1000n * CERE);
    const contract = createCustomerDepositContract(api);

    const sizing = await contract.sizeCall(CONTRACT, MESSAGE, CALLER, 1n * CERE, {});
    const tx: any = contract.buildContractCall(CONTRACT, MESSAGE, 1n * CERE, {}, sizing);

    expect(sizing.storageDepositLimit).not.toBeUndefined();
    expect(sizing.storageDepositLimit).toBeGreaterThan(0n);
    expect(tx.__tx.storage_deposit_limit).toBe(sizing.storageDepositLimit);
  });

  it('sizes the limit from the measured charge plus one existential deposit', async () => {
    const { api } = makeApi('unlimited', 1000n * CERE);
    const contract = createCustomerDepositContract(api);

    const sizing = await contract.sizeCall(CONTRACT, MESSAGE, CALLER, 1n * CERE, {});

    expect(sizing.storageDepositLimit).toBe(CHARGE + ED);
  });

  it('keeps the limit tight, so it cannot price the caller out of an affordable deposit', async () => {
    // Free balance covers value + charge with little to spare. A padded limit
    // (e.g. charge x 10) would exceed the spendable balance and the runtime would
    // reject the call outright with StorageDepositNotEnoughFunds.
    const free = 1n * CERE + CHARGE + ED + 5n * CERE;
    const { api } = makeApi('unlimited', free);
    const contract = createCustomerDepositContract(api);

    const sizing = await contract.sizeCall(CONTRACT, MESSAGE, CALLER, 1n * CERE, {});

    expect(1n * CERE + sizing.storageDepositLimit).toBeLessThanOrEqual(free - ED);
  });

  it('recovers on a runtime that reads None as zero, by retrying under an affordable limit', async () => {
    const { api, calls } = makeApi('zero', 1000n * CERE);
    const contract = createCustomerDepositContract(api);

    const sizing = await contract.sizeCall(CONTRACT, MESSAGE, CALLER, 1n * CERE, {});

    // First attempt is None (cheapest path on an unlimited runtime); it fails
    // here, so a second attempt is made under an explicit affordable limit.
    expect(calls.map((c) => c.sdl)).toEqual([undefined, 999n * CERE - 1n * CERE]);
    expect(calls[0].ok).toBe(false);
    expect(calls[1].ok).toBe(true);
    // ...and the derived limit still covers the real charge.
    expect(sizing.storageDepositLimit).toBe(CHARGE + ED);
    expect(sizing.storageDepositLimit).toBeGreaterThanOrEqual(CHARGE);
  });

  it('needs only one dry run when the runtime accepts None', async () => {
    const { api, calls } = makeApi('unlimited', 1000n * CERE);
    const contract = createCustomerDepositContract(api);

    await contract.sizeCall(CONTRACT, MESSAGE, CALLER, 1n * CERE, {});

    expect(calls).toHaveLength(1);
    expect(calls[0].sdl).toBeUndefined();
  });

  it('still sends an explicit limit when every dry run fails', async () => {
    // Unfunded caller: neither the None attempt nor the affordable-probe attempt
    // can succeed, so sizing falls back to its constants — which must still be an
    // explicit limit, since None is what breaks first deposits on devnet.
    const { api } = makeApi('zero', 0n);
    const contract = createCustomerDepositContract(api);

    const sizing = await contract.sizeCall(CONTRACT, MESSAGE, CALLER, 1n * CERE, {});
    const tx: any = contract.buildContractCall(CONTRACT, MESSAGE, 1n * CERE, {}, sizing);

    expect(sizing.storageDepositLimit).toBe(10n * ED);
    expect(tx.__tx.storage_deposit_limit).toBe(10n * ED);
    // Gas falls back to the generous ceiling rather than the failed run's zeros.
    expect(sizing.gasLimit.ref_time).toBeGreaterThan(0n);
  });

  it('never throws when the balance read fails', async () => {
    const { api } = makeApi('zero', 1000n * CERE);
    api.query.System.Account.getValue = async () => {
      throw new Error('node unavailable');
    };
    const contract = createCustomerDepositContract(api);

    const sizing = await contract.sizeCall(CONTRACT, MESSAGE, CALLER, 1n * CERE, {});

    expect(sizing.storageDepositLimit).toBe(10n * ED);
  });

  it('charges no storage headroom for a call that only refunds', async () => {
    const { api } = makeApi('unlimited', 1000n * CERE, 0n);
    api.apis.ContractsApi.call = async () => ({
      gas_required: { ref_time: 1_000_000n, proof_size: 50_000n },
      storage_deposit: { type: 'Refund', value: 5n * CERE },
      result: { success: true, value: { flags: 0, data: new Uint8Array([0, 0]) } },
    });
    const contract = createCustomerDepositContract(api);

    const sizing = await contract.sizeCall(CONTRACT, MESSAGE, CALLER, 0n, {});

    // A Refund costs the caller nothing, so only the drift slack is reserved.
    expect(sizing.storageDepositLimit).toBe(ED);
  });

  it('caps the drift slack at the proven-affordable headroom (tight-balance window)', async () => {
    // Balance chosen so the deposit is affordable at the true charge but NOT once
    // the +ED drift slack is added: free - 2*ED < value + charge <= free - ED.
    // Here free=6.5 CERE, so spendable=5.5; value+charge=5.2 fits, but
    // value+charge+ED=6.2 does not. Without the cap the SDK would return 5.2 and
    // the real submit would be rejected with StorageDepositNotEnoughFunds.
    const free = (65n * CERE) / 10n; // 6.5 CERE
    const { api } = makeApi('unlimited', free);
    const contract = createCustomerDepositContract(api);

    const sizing = await contract.sizeCall(CONTRACT, MESSAGE, CALLER, 1n * CERE, {});
    const headroom = free - 1n * CERE - ED; // 4.5 CERE

    // Capped at headroom (4.5), which is below the uncapped charge+ED (5.2)…
    expect(sizing.storageDepositLimit).toBe(headroom);
    // …yet still covers the real charge, so it can't trip LimitExhausted…
    expect(sizing.storageDepositLimit).toBeGreaterThanOrEqual(CHARGE);
    // …and value + limit now fits within spendable, so the submit is affordable.
    expect(1n * CERE + sizing.storageDepositLimit).toBeLessThanOrEqual(free - ED);
  });

  it('never collapses the limit to zero when the existential-deposit read fails', async () => {
    // Every path must keep a non-zero limit even if the ED constant can't be read
    // — a zero limit is exactly the StorageDepositLimitExhausted defect on a
    // None-means-zero runtime. Here ED read fails, so it defaults to 1 CERE.
    const { api } = makeApi('zero', 0n);
    api.constants.Balances.ExistentialDeposit = async () => {
      throw new Error('node unavailable');
    };
    const contract = createCustomerDepositContract(api);

    // Fallback path (caller unfunded, both probes fail): limit = 10 * default ED.
    const fallback = await contract.sizeCall(CONTRACT, MESSAGE, CALLER, 1n * CERE, {});
    expect(fallback.storageDepositLimit).toBe(10n * CERE);
    expect(fallback.storageDepositLimit).toBeGreaterThan(0n);
  });

  it('keeps drift slack on the success path even when the ED read fails', async () => {
    // Success path with a failed ED read: the limit is charge + default ED, not
    // charge + 0 — the slack survives, so a state drift between dry run and
    // submit doesn't immediately trip LimitExhausted.
    const { api } = makeApi('unlimited', 1000n * CERE);
    api.constants.Balances.ExistentialDeposit = async () => {
      throw new Error('node unavailable');
    };
    const contract = createCustomerDepositContract(api);

    const sizing = await contract.sizeCall(CONTRACT, MESSAGE, CALLER, 1n * CERE, {});

    expect(sizing.storageDepositLimit).toBe(CHARGE + CERE); // charge + 1 CERE default ED
  });
});
