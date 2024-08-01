import { Signer, Web3Signer, createRandomSigner } from '@cere-ddc-sdk/blockchain';

import { AuthToken } from './AuthToken';

const signerRegistry = new WeakMap<Signer, Map<string, Signer>>();

const isWeb3Signer = (signer: Signer): signer is Web3Signer => {
  return signer instanceof Web3Signer;
};

const getRegestry = (signer: Signer) => {
  if (!signerRegistry.has(signer)) {
    signerRegistry.set(signer, new Map());
  }

  return signerRegistry.get(signer)!;
};

const createSdkSigner = async (signer: Signer) => {
  const randomSigner = createRandomSigner({ type: signer.type });
  await randomSigner.isReady();

  getRegestry(signer).set(randomSigner.address, randomSigner);

  return randomSigner;
};

export const getSdkSigner = (signer: Signer, address: string) => {
  return getRegestry(signer).get(address);
};

export const isValidSdkToken = (signer: Signer, token: AuthToken) => {
  return signer.address === token.signature?.signer;
};

export const createSdkToken = async (signer: Signer) => {
  if (!isWeb3Signer(signer)) {
    return AuthToken.fullAccess().sign(signer);
  }

  const sdkSigner = await createSdkSigner(signer);

  return AuthToken.fullAccess({ subject: sdkSigner.address }).sign(signer);
};

export const maybeSdkSigner = (signer: Signer, token?: AuthToken | string) => {
  const finalToken = AuthToken.maybeToken(token);

  return (finalToken?.signature && getSdkSigner(signer, finalToken.signature.signer)) || signer;
};
