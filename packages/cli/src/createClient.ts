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
   * TODO(Task 3): the network preset configs were removed in favor of an explicit
   * single-cluster config. Wire `clusterId`/`storageUrl`/`cdnUrl` up as real CLI options
   * (`--clusterId`, `--storageUrl`, `--cdnUrl`) instead of the placeholder plumbing below.
   * `clusterId` is typed as a plain `string` here (rather than `ClusterId`) because it
   * currently rides along on the `deposit`/`create-bucket` command's own `--clusterId`
   * option.
   */
  clusterId?: string;
  storageUrl?: string;
  cdnUrl?: string;
};

/**
 * TODO(Task 3): these were the `blockchain` fields of the removed `DEVNET`/`TESTNET`/`MAINNET`
 * network preset configs. Kept as a local map so the CLI keeps resolving `--network` to an RPC URL.
 */
const networkToRpc: Record<string, string> = {
  devnet: 'wss://archive.devnet.cere.network/ws',
  testnet: 'wss://rpc.testnet.cere.network/ws',
  mainnet: 'wss://rpc.mainnet.cere.network/ws',
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
  const network = options.network as keyof typeof networkToRpc;
  const blockchain = options.blockchainRpc || networkToRpc[network];
  const signer = await createSigner(options.signer, options.signerType, options.signerPassphrase);

  // TODO(Task 3): `clusterId`/`storageUrl` aren't wired up as real CLI options yet
  // (see `CreateClientOptions`); this only keeps the package compiling against the
  // new single-cluster `DdcClientConfig`.
  if (!options.clusterId || !options.storageUrl) {
    throw new Error(
      'CLI needs --clusterId and --storageUrl (single-cluster config; network preset configs were removed). ' +
        'These are not yet wired up as CLI options — see Task 3.',
    );
  }

  return DdcClient.create(signer, {
    blockchain,
    clusterId: options.clusterId as ClusterId,
    storageUrl: options.storageUrl,
    cdnUrl: options.cdnUrl,
    logLevel: options.logLevel as DdcClientConfig['logLevel'],
  });
};

export const withClient = async <T>(options: CreateClientOptions, fn: (client: DdcClient) => Promise<T>) => {
  const client = await createClient(options);
  const result = await fn(client);
  await client.disconnect();

  return result;
};
