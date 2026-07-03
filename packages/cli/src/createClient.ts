import { readFile } from 'fs/promises';

import { StorageNodeMode } from '@cere-ddc-sdk/ddc';
import { DdcClient, DEVNET, TESTNET, MAINNET, DdcClientConfig, UriSigner, JsonSigner } from '@cere-ddc-sdk/ddc-client';

export { createCorrelationId } from '@cere-ddc-sdk/ddc-client';

type NodeConfig = {
  grpcUrl: string;
  httpUrl: string;
  mode?: string;
};

export type CreateClientOptions = {
  signer: string;
  network: string;
  logLevel: string;
  signerPassphrase: string;
  signerType?: string;
  blockchainRpc?: string;
  nodes?: NodeConfig[];
};

const networkToPreset = {
  devnet: DEVNET,
  testnet: TESTNET,
  mainnet: MAINNET,
};

export const createSigner = async (signer: string, signerType?: string) => {
  if (!signer.endsWith('.json')) {
    return new UriSigner(signer, {
      type: signerType === 'ed25519' ? 'ed25519' : 'sr25519',
    });
  }

  const content = await readFile(signer);
  const account = JSON.parse(content.toString());

  return new JsonSigner(account);
};

export const createClient = async (options: CreateClientOptions) => {
  const network = options.network as keyof typeof networkToPreset;
  const preset = networkToPreset[network];
  const blockchain = options.blockchainRpc || preset.blockchain;
  const signer = await createSigner(options.signer, options.signerType);

  /**
   * Unlock the signer with the passphrase
   *
   * TODO: Implement passprase prompt in case it's not provided
   */
  await signer.unlock(options.signerPassphrase);

  return DdcClient.create(signer, {
    ...preset,
    blockchain,
    logLevel: options.logLevel as DdcClientConfig['logLevel'],

    nodes: options.nodes?.map((node) => ({
      ...node,
      mode: StorageNodeMode[(node.mode as keyof typeof StorageNodeMode) || 'Full'],
    })),
  });
};

export const withClient = async <T>(options: CreateClientOptions, fn: (client: DdcClient) => Promise<T>) => {
  const client = await createClient(options);
  const result = await fn(client);
  await client.disconnect();

  return result;
};
