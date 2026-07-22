import { readFile } from 'fs/promises';

import { DdcClient, DdcClientConfig, UriSigner, JsonSigner } from '@cere-ddc-sdk/ddc-client';
import type { ClusterId } from '@cere-ddc-sdk/blockchain';

export { createCorrelationId } from '@cere-ddc-sdk/ddc-client';

export type CreateClientOptions = {
  signer: string;
  network: string;
  logLevel: string;
  signerPassphrase: string;
  signerType?: string;
  blockchainRpc?: string;

  /**
   * The DDC cluster this client operates against. Sourced from the global
   * `--clusterId` CLI option or the `clusterId` field of the config file.
   */
  clusterId?: string;

  /**
   * The DDC storage endpoint (write + fallback read). Sourced from the global
   * `--storageUrl` CLI option/config field, defaulting to the `--network`'s
   * public storage endpoint below when omitted.
   */
  storageUrl?: string;

  /**
   * The DDC CDN endpoint (read). Sourced from the global `--cdnUrl` CLI
   * option/config field, defaulting to the `--network`'s public CDN endpoint
   * below when omitted.
   */
  cdnUrl?: string;
};

/**
 * Public storage/CDN endpoints per network. Presets/client-side routing were
 * removed from the SDK itself (single-cluster config), but the CLI keeps this
 * small map as an app-level convenience so `--network testnet` keeps working
 * without requiring `--storageUrl`/`--cdnUrl` on every invocation.
 */
const networkToEndpoints: Record<string, { storageUrl: string; cdnUrl: string }> = {
  devnet: { storageUrl: 'https://storage.devnet.dragon-1.xyz', cdnUrl: 'https://cdn.devnet.dragon-1.xyz' },
  testnet: { storageUrl: 'https://storage.testnet.dragon-1.xyz', cdnUrl: 'https://cdn.testnet.dragon-1.xyz' },
  mainnet: { storageUrl: 'https://storage.dragon-1.xyz', cdnUrl: 'https://cdn.dragon-1.xyz' },
};

export const createSigner = async (signer: string, signerType?: string, passphrase = '') => {
  if (!signer.endsWith('.json')) {
    return new UriSigner(signer, {
      type: signerType === 'ed25519' ? 'ed25519' : 'sr25519',
    });
  }

  const content = await readFile(signer);
  const account = JSON.parse(content.toString());

  /**
   * `JsonSigner` decrypts the keystore eagerly (no lazy `unlock()` in the papi
   * signer model), so the passphrase must be supplied up front.
   *
   * TODO: Implement passprase prompt in case it's not provided
   */
  return new JsonSigner(account, passphrase);
};

export const createClient = async (options: CreateClientOptions) => {
  const network = options.network as keyof typeof networkToEndpoints;
  const defaults = networkToEndpoints[network];
  // `blockchain` accepts a network name directly (resolved to its public RPC
  // internally), so `--blockchainRpc`/`--rpc` only needs to override it with an
  // explicit WS URL.
  const blockchain = options.blockchainRpc || network;
  const storageUrl = options.storageUrl || defaults?.storageUrl;
  const cdnUrl = options.cdnUrl || defaults?.cdnUrl;
  const signer = await createSigner(options.signer, options.signerType, options.signerPassphrase);

  if (!options.clusterId || !storageUrl) {
    throw new Error(
      'DDC CLI needs --clusterId, and --storageUrl (unless --network provides a default) — ' +
        'pass them as flags or add them to the config file.',
    );
  }

  return DdcClient.create(signer, {
    blockchain,
    clusterId: options.clusterId as ClusterId,
    storageUrl,
    cdnUrl,
    logLevel: options.logLevel as DdcClientConfig['logLevel'],
  });
};

export const withClient = async <T>(options: CreateClientOptions, fn: (client: DdcClient) => Promise<T>) => {
  const client = await createClient(options);
  const result = await fn(client);
  await client.disconnect();

  return result;
};
