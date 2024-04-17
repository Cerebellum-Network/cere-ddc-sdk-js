import { StorageNodeMode } from '@cere-ddc-sdk/ddc';
import { DdcClient, DEVNET, TESTNET, MAINNET, DdcClientConfig, UriSigner } from '@cere-ddc-sdk/ddc-client';

type NodeConfig = {
  grpcUrl: string;
  httpUrl: string;
  mode?: string;
};

export type CreateClientOptions = {
  signer: string;
  network: string;
  logLevel: string;
  signerType?: string;
  blockchainRpc?: string;
  nodes?: NodeConfig[];
};

const networkToPreset = {
  devnet: DEVNET,
  testnet: TESTNET,
  mainnet: MAINNET,
};

export const createClient = (options: CreateClientOptions) => {
  const network = options.network as keyof typeof networkToPreset;
  const preset = networkToPreset[network];
  const blockchain = options.blockchainRpc || preset.blockchain;

  const signer = new UriSigner(options.signer, {
    type: options.signerType === 'ed25519' ? 'ed25519' : 'sr25519',
  });

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
