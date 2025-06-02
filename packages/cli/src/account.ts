import { DdcClient } from '@cere-ddc-sdk/ddc-client';

import { CreateClientOptions, createSigner } from './createClient';
import { CERE } from './constants';
import { KeypairType } from '@polkadot/util-crypto/types';

export type AccountOptions = Pick<CreateClientOptions, 'signer' | 'signerType'>;

interface AccountResult {
  balance: number;
  address: string;
  type: KeypairType;
  publicKey: string;
}

export const account = async (
  client: DdcClient | null,
  { signer, signerType }: AccountOptions,
): Promise<AccountResult> => {
  const realSigner = await createSigner(signer, signerType);
  await realSigner.isReady();

  const balance = (await client?.getBalance()) || BigInt(0);

  return {
    balance: Number(balance / BigInt(CERE)),
    address: realSigner.address,
    type: realSigner.type,
    publicKey: '0x' + Buffer.from(realSigner.publicKey).toString('hex'),
  };
};
