import { AuthToken, AuthTokenOperation, AuthTokenParams, Cid } from '@cere-ddc-sdk/ddc';

import { createSigner } from './createClient';

export type TokenOptions = Omit<AuthTokenParams, 'bucketId' | 'operations'> & {
  signer?: string;
  signerType?: string;
  signerPassphrase?: string;
  bucketId?: string;
  operations: string[];
};

const operationsMap: Record<string, AuthTokenOperation> = {
  get: AuthTokenOperation.GET,
  put: AuthTokenOperation.PUT,
  delete: AuthTokenOperation.DELETE,
};

export const decodeToken = async (token: string) => {
  const authToken = AuthToken.maybeToken(token);

  if (!authToken) {
    throw new Error('Invalid token');
  }

  return {
    token,
    operations: authToken.operations.map((op) => AuthTokenOperation[op]),
    bucketId: authToken.bucketId,
    cid: authToken.pieceCid,
    canDelegate: authToken.canDelegate,
    expiresAt: authToken.expiresAt,
    subject: authToken.subject,
    signer: authToken.signature?.signer,
  };
};

export const createToken = async (options: TokenOptions) => {
  if (options.pieceCid && !Cid.isCid(options.pieceCid)) {
    throw new Error('Invalid CID');
  }

  const token = new AuthToken({
    pieceCid: options.pieceCid,
    prev: options.prev,
    canDelegate: options.canDelegate,
    subject: options.subject,
    expiresIn: options.expiresIn && options.expiresIn * 1000,
    bucketId: options.bucketId ? BigInt(options.bucketId) : undefined,
    operations: options.operations.map((op) => operationsMap[op]),
  });

  if (options.signer) {
    const signer = await createSigner(options.signer, options.signerType);

    await signer.unlock(options.signerPassphrase);
    await token.sign(signer);
  }

  return decodeToken(token.toString());
};
