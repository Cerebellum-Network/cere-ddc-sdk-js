import base58 from 'bs58';
import { BucketId, Signer } from '@cere-ddc-sdk/blockchain';

import { AUTH_TOKEN_EXPIRATION_TIME } from '../constants';
import { createSignature } from '../signature';
import { AuthToken as Token, Payload, Operation } from '../grpc/auth_token';

export { Operation as AuthTokenOperation };

type AuthTokenParams = {
  operations: Operation[];
  bucketId?: BucketId;
  expiresAt?: number;
};

export class AuthToken {
  private token: Token;

  constructor({ bucketId, operations, expiresAt }: AuthTokenParams) {
    const payload: Payload = {
      bucketId,
      operations,
      expiresAt: expiresAt ?? Date.now() + AUTH_TOKEN_EXPIRATION_TIME,
      canDelegate: false,
    };

    this.token = Token.create({ payload });
  }

  private toBinary() {
    return Token.toBinary(this.token);
  }

  async sign(signer: Signer) {
    this.token.signature = await createSignature(signer, this.toBinary());

    return this;
  }

  toString() {
    return base58.encode(this.toBinary());
  }
}
