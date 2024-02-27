import { DdcClient, UriSigner } from '@cere-ddc-sdk/ddc-client';
import { CreateClientOptions } from './createClient';
import { CERE } from './constants';

export type AccountOptions = Pick<CreateClientOptions, 'signer' | 'signerType'>;

export const account = async (client: DdcClient, { signer, signerType }: AccountOptions) => {
  const uriSigner = new UriSigner(signer, {
    type: signerType === 'ed25519' ? 'ed25519' : 'sr25519',
  });

  const [balance, deposit] = await Promise.all([client.getBalance(), client.getDeposit()]);

  return {
    balance: Number(balance / BigInt(CERE)),
    deposit: Number(deposit / BigInt(CERE)),
    address: uriSigner.address,
  };
};
