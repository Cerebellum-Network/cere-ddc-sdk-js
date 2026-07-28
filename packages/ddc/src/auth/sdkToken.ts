import { Signer, createRandomSigner, Web3Signer } from '@cere-ddc-sdk/blockchain';

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
  // DDC only ever hands us `Signer`s with an ed25519/sr25519 `type` (enforced in `createSignature`);
  // `createRandomSigner` is typed narrower than the chain-free `SignerType` union, hence the cast.
  const randomSigner = createRandomSigner({ type: signer.type as 'ed25519' | 'sr25519' });
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

const rootTokenCache = new WeakMap<Signer, Promise<AuthToken>>();

/**
 * The root SDK token for a signer, memoized per signer.
 *
 * Critical for interactive wallet signers (e.g. a browser extension): the wallet
 * signs this delegation token exactly ONCE; every subsequent per-operation
 * signature uses the delegated ephemeral key (in-process, no wallet round-trip).
 * Without this cache each `StorageNode`/operation re-signs a fresh root token via
 * the wallet, and wallets rate-limit rapid `signRaw` requests ("Rate limit
 * exceeded. Try again later.") — which broke multi-piece uploads with an
 * extension signer while in-process signers (seed/keyring) were unaffected.
 */
export const createSdkToken = (signer: Signer): Promise<AuthToken> => {
  let cached = rootTokenCache.get(signer);

  if (!cached) {
    cached = buildSdkToken(signer).catch((error) => {
      rootTokenCache.delete(signer); // never cache a failed/rejected signature
      throw error;
    });
    rootTokenCache.set(signer, cached);
  }

  return cached;
};

const buildSdkToken = async (signer: Signer) => {
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
