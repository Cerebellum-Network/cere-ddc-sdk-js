import { DdcClient, DEVNET, TESTNET, MAINNET, DdcClientConfig, UriSigner } from '@cere-ddc-sdk/ddc-client';

export type CreateClientOptions = {
  signer: string;
  network: string;
  logLevel: string;
  signerType?: string;
};

const networkToPreset = {
  devnet: DEVNET,
  testnet: TESTNET,
  mainnet: MAINNET,
};

export const createClient = (options: CreateClientOptions) => {
  const network = options.network as keyof typeof networkToPreset;
  const signer = new UriSigner(options.signer, {
    type: options.signerType === 'ed25519' ? 'ed25519' : 'sr25519',
  });

  return DdcClient.create(signer, {
    ...networkToPreset[network],
    logLevel: options.logLevel as DdcClientConfig['logLevel'],
  });
};

export const withClient = async <T>(options: CreateClientOptions, fn: (client: DdcClient) => Promise<T>) => {
  const client = await createClient(options);
  const result = await fn(client);
  await client.disconnect();

  return result;
};
