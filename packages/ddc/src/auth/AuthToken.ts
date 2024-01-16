import base58 from 'bs58';
import { AccountId, Signer, decodeAddress } from '@cere-ddc-sdk/blockchain';

import { AUTH_TOKEN_EXPIRATION_TIME } from '../constants';
import { createSignature } from '../signature';
import { AuthToken as Token, Payload, Operation } from '../grpc/auth_token';
import { Cid } from '../Cid';

export { Operation as AuthTokenOperation };

export type AuthTokenParams = Omit<Payload, 'subject' | 'prev' | 'pieceCid'> & {
  pieceCid?: string | Uint8Array;
  expiresIn?: number;
  subject?: AccountId;
};

export class AuthToken {
  protected token: Token;

  constructor(params: AuthTokenParams) {
    const expiresIn = params.expiresIn ?? AUTH_TOKEN_EXPIRATION_TIME;
    const payload: Payload = {
      bucketId: params.bucketId,
      operations: params.operations,
      canDelegate: params.canDelegate ?? false,
      expiresAt: params.expiresAt ?? Date.now() + expiresIn,
      subject: params.subject ? decodeAddress(params.subject) : undefined,
      pieceCid: params.pieceCid ? new Cid(params.pieceCid).toBytes() : undefined,
    };

    this.token = Token.create({ payload });
  }

  get canDelegate() {
    return this.token.payload!.canDelegate ?? false;
  }

  get bucketId() {
    return this.token.payload!.bucketId;
  }

  get operations() {
    return this.token.payload!.operations;
  }

  get pieceCid() {
    return this.token.payload!.pieceCid && new Cid(this.token.payload!.pieceCid).toString();
  }

  get expiresAt() {
    return this.token.payload!.expiresAt!;
  }

  private toBinary() {
    return Token.toBinary(this.token);
  }

  toString() {
    return base58.encode(this.toBinary());
  }

  async sign(signer: Signer) {
    this.token.signature = await createSignature(signer, this.toBinary());

    return this;
  }

  static from(token: string | AuthToken) {
    const protoParentToken = typeof token === 'string' ? Token.fromBinary(base58.decode(token)) : token.token;

    if (!protoParentToken.payload) {
      throw new Error('Invalid token');
    }

    const { subject, ...params } = protoParentToken.payload;
    const nextToken = new AuthToken({ ...params });

    if (subject) {
      /**
       * Set `prev` token in case of delegation
       */
      nextToken.token.payload!.prev = protoParentToken;
    }

    return nextToken;
  }

  static fullAccess(params: Pick<AuthTokenParams, 'bucketId' | 'pieceCid' | 'expiresAt' | 'expiresIn'> = {}) {
    return new AuthToken({ ...params, operations: [Operation.GET, Operation.PUT, Operation.DELETE] });
  }
}
