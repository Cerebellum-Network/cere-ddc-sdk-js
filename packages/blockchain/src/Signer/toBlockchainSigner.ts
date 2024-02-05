import { Signer as BcSigner, SignerPayloadRaw } from '@polkadot/types/types';
import { u8aToHex } from '@polkadot/util';

import { Signer } from './Signer';

export const toBlockchainSigner = (signer: Signer): BcSigner => ({
  signRaw: async ({ data }: SignerPayloadRaw) => {
    await signer.isReady();
    const signature = await signer.sign(data, {
      withType: true,
    });

    return {
      id: 0,
      signature: u8aToHex(signature),
    };
  },
});
