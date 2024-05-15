import { DdcClient } from '@cere-ddc-sdk/ddc-client';

import { CreateClientOptions, createSigner } from './createClient';
import { CERE } from './constants';

export type AccountOptions = Pick<CreateClientOptions, 'signer' | 'signerType'>;

export const account = async (client: DdcClient | null, { signer, signerType }: AccountOptions) => {
  const realSigner = await createSigner(signer, signerType);
  await realSigner.isReady();

  const [balance, deposit] = await Promise.all([client?.getBalance() || BigInt(0), client?.getDeposit() || BigInt(0)]);

  return {
    balance: Number(balance / BigInt(CERE)),
    deposit: Number(deposit / BigInt(CERE)),
    address: realSigner.address,
    type: realSigner.type,
    publicKey: '0x' + Buffer.from(realSigner.publicKey).toString('hex'),
  };
};
