import type { Signer } from '@cere-ddc-sdk/blockchain';

import { Signature, Signature_Algorithm as SigAlg } from '../grpc/pb/signature';

export const createSignature = (signer: Signer, message: Uint8Array): Signature => {
  const algorithm = signer.type;

  if (algorithm !== 'ed25519' && algorithm !== 'sr25519') {
    throw new Error(`Signer type ${signer.type} is not allowed in DDC`);
  }

  return Signature.create({
    algorithm: algorithm === 'ed25519' ? SigAlg.ED_25519 : SigAlg.SR_25519,
    signer: signer.publicKey,
    value: signer.sign(message),
  });
};
