import base58 from 'bs58';
import { AccountId, Signer, decodeAddress, encodeAddress } from '@cere-ddc-sdk/blockchain';

import { AUTH_TOKEN_EXPIRATION_TIME } from '../constants';
import { createSignature } from '../signature';
import { AuthToken as Token, Payload, Operation } from '../grpc/auth_token';
import { Cid } from '../Cid';

export { Operation as AuthTokenOperation };

export type AuthTokenParams = Omit<Payload, 'subject' | 'prev' | 'pieceCid'> & {
  pieceCid?: string | Uint8Array;
  expiresIn?: number;
};

type DelegateTokenParams = Partial<AuthTokenParams>;

export class AuthToken {
  protected token: Token;

  constructor(params: AuthTokenParams) {
    const expiresIn = params.expiresIn ?? AUTH_TOKEN_EXPIRATION_TIME;
    const payload: Payload = {
      bucketId: params.bucketId,
      operations: params.operations,
      canDelegate: params.canDelegate ?? true,
      pieceCid: params.pieceCid ? new Cid(params.pieceCid).toBytes() : undefined,
      expiresAt: params.expiresAt ?? Date.now() + expiresIn,
    };

    this.token = Token.create({ payload });
  }

  get parent(): AuthToken | undefined {
    const parentProtoToken = this.token.payload?.prev;

    if (!parentProtoToken) {
      return undefined;
    }

    const parentToken = new AuthToken({ operations: [] });

    /**
     * Patch token property directly do preserv hidden propertties like `prev` and `signature`
     */
    parentToken.token = parentProtoToken;

    return parentToken;
  }

  get subject() {
    return this.token.payload!.subject && encodeAddress(this.token.payload!.subject);
  }

  get signer() {
    return this.token.signature && encodeAddress(this.token.signature.signer);
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
    return this.token.payload!.expiresAt;
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

  delegate(to: AccountId, params: DelegateTokenParams = {}) {
    const prevPayload = this.token.payload!;

    if (!prevPayload.canDelegate) {
      throw new Error('The token delegation is not allowed');
    }

    if (!this.token.signature) {
      throw new Error('Cannopt delegate unsigned token');
    }

    const delegatedToken = new AuthToken({
      ...prevPayload,
      ...params,
      canDelegate: params.canDelegate ?? false,
    });

    const nextPayload = delegatedToken.token.payload!;

    nextPayload.prev = this.token;
    nextPayload.subject = decodeAddress(to);

    return delegatedToken;
  }

  static from(accessToken: string | AuthToken) {
    const protoParentToken =
      typeof accessToken === 'string' ? Token.fromBinary(base58.decode(accessToken)) : accessToken.token;

    if (!protoParentToken.payload) {
      throw new Error('Invalid token');
    }

    const nextToken = new AuthToken({ ...protoParentToken.payload });

    nextToken.token.payload!.prev = protoParentToken;
    nextToken.token.payload!.subject = undefined;

    return nextToken;
  }

  static fullAccess(params: Pick<AuthTokenParams, 'bucketId' | 'pieceCid' | 'expiresAt' | 'expiresIn'> = {}) {
    return new AuthToken({ ...params, operations: [Operation.GET, Operation.PUT, Operation.DELETE] });
  }
}
