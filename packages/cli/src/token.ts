import { AuthToken, AuthTokenOperation, UriSigner, AuthTokenParams, Cid } from '@cere-ddc-sdk/ddc';

export type TokenOptions = Omit<AuthTokenParams, 'bucketId' | 'operations'> & {
  signer?: string;
  signerType?: string;
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
  const signer =
    options.signer &&
    new UriSigner(options.signer, {
      type: options.signerType === 'ed25519' ? 'ed25519' : 'sr25519',
    });

  if (options.pieceCid && !Cid.isCid(options.pieceCid)) {
    throw new Error('Invalid CID');
  }

  const token = new AuthToken({
    pieceCid: options.pieceCid,
    prev: options.prev,
    canDelegate: options.canDelegate,
    expiresIn: options.expiresIn,
    bucketId: options.bucketId ? BigInt(options.bucketId) : undefined,
    operations: options.operations.map((op) => operationsMap[op]),
  });

  if (signer) {
    await token.sign(signer);
  }

  return decodeToken(token.toString());
};
