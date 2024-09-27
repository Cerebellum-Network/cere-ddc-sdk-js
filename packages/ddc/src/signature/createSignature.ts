import type { Signer } from '@cere-ddc-sdk/blockchain';

import { Signature, Signature_Algorithm as SigAlg } from '../grpc/common/signature';
import { AuthToken, maybeSdkSigner } from '../auth';

export type ApiSignature = Signature;

export type CreateSignatureOptions = {
  token?: string | AuthToken;
};

export const createSignature = async (signer: Signer, message: Uint8Array, { token }: CreateSignatureOptions = {}) => {
  const proxySigner = maybeSdkSigner(signer, token);

  await proxySigner.isReady();

  if (proxySigner.type !== 'ed25519' && proxySigner.type !== 'sr25519') {
    throw new Error(`Signer type ${proxySigner.type} is not allowed in DDC`);
  }

  return Signature.create({
    algorithm: proxySigner.type === 'ed25519' ? SigAlg.ED_25519 : SigAlg.SR_25519,
    signer: proxySigner.publicKey,
    value: await proxySigner.sign(message),
  });
};
