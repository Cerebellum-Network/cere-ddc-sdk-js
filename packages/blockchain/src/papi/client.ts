import { createClient, type PolkadotClient, type TypedApi, CompatibilityLevel } from 'polkadot-api';
// The WS provider is selected per-environment via the package `#ws-provider`
// imports map: Node consumers get the `ws`-backed provider, browser bundlers
// resolve the `browser` condition to the global-`WebSocket` provider. See
// `ws-provider.ts` / `ws-provider.web.ts`.
import { getWsProvider } from '#ws-provider';
// Self-referential subpath import (package `imports` map → `.papi/descriptors`)
// rather than a `file:` dependency: the generated descriptors ship INSIDE this
// package, and `file:` deps resolve against the CONSUMER's root, not ours.
import { cereMainnet } from '#descriptors';

import { DESCRIPTORS, CERE_WS, type CereNetwork } from './descriptors.js';
import { ChainIncompatibleError } from './compat.js';

export interface ConnectOptions {
  /** Which Cere network's typed descriptors + default endpoint to use. */
  network: CereNetwork;
  /** Override the WS endpoint (defaults to the network's public RPC). */
  wsUrl?: string;
}

export interface CereClient {
  // The mainnet descriptor is the static baseline for all three networks — see
  // the cast below `connect()` uses to build this same type at runtime.
  api: TypedApi<typeof cereMainnet>;
  /** Tear down the underlying client + WS connection. */
  disconnect(): void;
  /**
   * Guard a pallet call against the connected runtime before building/signing an
   * extrinsic that uses it — throws `ChainIncompatibleError` instead of a cryptic
   * encode error when the runtime predates the call's shape.
   */
  assertCompatible(pallet: string, call: string): Promise<void>;
}

/** Infer the network from a bare WS URL — back-compat for `connect(url)`. */
export function inferNetwork(wsUrl: string): CereNetwork {
  // Match on the hostname so a `devnet`/`testnet` token in a path or query
  // can't flip the network; fall back to the raw string if it doesn't parse.
  let host = wsUrl;
  try {
    host = new URL(wsUrl).hostname;
  } catch {
    /* not a parseable URL — scan the raw string */
  }
  if (host.includes('devnet')) return 'devnet';
  if (host.includes('testnet')) return 'testnet';
  return 'mainnet';
}

/**
 * Connect to a Cere node via papi. Pass `{ network, wsUrl? }` to select the
 * network's typed descriptors explicitly, or a bare WS URL (the network is
 * inferred). The papi client + descriptors are an internal detail.
 */
export function connect(opts: ConnectOptions | string): CereClient {
  const network = typeof opts === 'string' ? inferNetwork(opts) : opts.network;
  const wsUrl = typeof opts === 'string' ? opts : (opts.wsUrl ?? CERE_WS[opts.network]);

  // NOTE: Cere's public testnet/mainnet RPC endpoints don't yet implement papi's new
  // JSON-RPC (chainHead_v1/…) — devnet does. Connecting to those needs a version-matched
  // `@polkadot-api/polkadot-sdk-compat` shim (latest 2.4.1 mismatches papi 2.1.8's provider
  // message format); tracked as a follow-up. devnet connects natively.
  const client: PolkadotClient = createClient(getWsProvider(wsUrl));
  // Runtime descriptor is per-network (correct metadata/genesis); the static
  // type uses the mainnet baseline — the calls we use are identical across nets,
  // and `isCompatible()` re-checks the live runtime below, so this cast is sound
  // and keeps the extrinsic builder fully typed.
  const api = client.getTypedApi(DESCRIPTORS[network] as unknown as typeof cereMainnet);

  return {
    api,
    disconnect: () => client.destroy(),
    async assertCompatible(pallet, call) {
      const statics = await api.getStaticApis();
      const entry = (statics.compat.tx as any)[pallet]?.[call];
      if (!entry?.isCompatible(CompatibilityLevel.BackwardsCompatible)) {
        throw new ChainIncompatibleError(
          `${pallet}.${call} is not compatible with the connected ${network} runtime`,
          network,
          `${pallet}.${call}`,
        );
      }
    },
  };
}
