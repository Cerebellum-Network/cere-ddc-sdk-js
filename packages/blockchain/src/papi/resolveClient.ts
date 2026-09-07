import { connect, type CereClient } from './client.js';
import { type CereNetwork } from './descriptors.js';

const NETWORKS = ['mainnet', 'testnet', 'devnet'] as const;

/**
 * A network name (`'mainnet' | 'testnet' | 'devnet'`), a WS URL, or a
 * pre-connected/injected `CereClient`. `CereNetwork` is folded into `string`
 * here (rather than `CereNetwork | (string & {})`) to keep `@typescript-eslint/ban-types`
 * happy; the network name is still validated at runtime.
 */
export type ChainConfig = CereNetwork | string | CereClient;

export interface ResolvedClient {
  client: CereClient;
  ownsClient: boolean;
}

/**
 * Resolves a `ChainConfig` into a `CereClient` + an `ownsClient` flag.
 *
 * A pre-built `CereClient` is passed through as-is with `ownsClient: false`
 * (the caller owns its lifecycle). A network name or WS URL is connected via
 * `connect()` with `ownsClient: true` (the resolver's caller owns the
 * resulting client and is responsible for disconnecting it).
 *
 * Shared by `DdcClient` and `FileStorage`, which both accept the same
 * `network | wsUrl | CereClient` shape for their `blockchain` config.
 */
export function resolveClient(config: ChainConfig): ResolvedClient {
  if (typeof config === 'string') {
    return {
      client: connect(NETWORKS.includes(config as CereNetwork) ? { network: config as CereNetwork } : config),
      ownsClient: true,
    };
  }

  return { client: config, ownsClient: false };
}
