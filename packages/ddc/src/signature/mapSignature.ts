import type { SignerType } from '@cere-ddc-sdk/blockchain';

import { Signature as ApiSignature, Signature_Algorithm as SigAlg } from '../grpc/common/signature';

export type Signature = Omit<ApiSignature, 'algorithm'> & {
  algorithm: SignerType;
};

export const mapSignature = (signature: ApiSignature): Signature => ({
  algorithm: signature.algorithm === SigAlg.SR_25519 ? 'sr25519' : 'ed25519',
  signer: new Uint8Array(signature.signer),
  value: new Uint8Array(signature.value),
});
