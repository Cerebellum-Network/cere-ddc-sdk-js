import base58 from 'bs58';
import { AccountId, Signer, decodeAddress } from '@cere-ddc-sdk/blockchain';

import { AUTH_TOKEN_EXPIRATION_TIME } from '../constants';
import { createSignature } from '../signature';
import { AuthToken as Token, Payload, Operation } from '../grpc/auth_token';
import { Cid } from '../Cid';

export { Operation as AuthTokenOperation };

/**
 * The `AuthTokenParams` type represents the parameters for creating an `AuthToken`.
 *
 * @hidden
 */
export type AuthTokenParams = Omit<Payload, 'subject' | 'prev' | 'pieceCid'> & {
  pieceCid?: string | Uint8Array;
  expiresIn?: number;
  subject?: AccountId;
  prev?: AuthToken | string;
};

/**
 * The `AuthToken` class represents an authentication token.
 *
 * @group Authentication
 *
 * @example
 *
 * ```typescript
 * const authToken = new AuthToken({
 *   bucketId: 1n,
 *   operations: [AuthTokenOperation.GET],
 * });
 *
 * await authToken.sign(signer);
 *
 * const sharebleToken = authToken.toString();
 * console.log(sharebleToken);
 *
 * const authTokenFromSharebleToken = AuthToken.from(sharebleToken);
 * console.log(authTokenFromSharebleToken);
 * ```
 */
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
      prev: AuthToken.maybeToken(params.prev)?.token,
    };

    this.token = Token.create({ payload });
  }

  /**
   * Whether the token can delegate access.
   */
  get canDelegate() {
    return this.token.payload!.canDelegate ?? false;
  }

  /**
   * The bucket identifier that the token grants access to.
   */
  get bucketId() {
    return this.token.payload!.bucketId;
  }

  /**
   * The operations that the token grants access to.
   */
  get operations() {
    return this.token.payload!.operations;
  }

  /**
   * The piece CID that the token grants access to.
   */
  get pieceCid() {
    return this.token.payload!.pieceCid && new Cid(this.token.payload!.pieceCid).toString();
  }

  /**
   * The expiration time of the token.
   */
  get expiresAt() {
    return this.token.payload!.expiresAt!;
  }

  private toBinary() {
    return Token.toBinary(this.token);
  }

  private static fromProto(protoToken: Token) {
    const newToken = new AuthToken({ operations: [] });

    newToken.token = protoToken;

    return newToken;
  }

  private static maybeToken(token?: string | AuthToken) {
    if (typeof token !== 'string') {
      return token;
    }

    return this.fromProto(Token.fromBinary(base58.decode(token)));
  }

  /**
   * Converts the authentication token to a string.
   *
   * @returns The authentication token as a base58-encoded string.
   */
  toString() {
    return base58.encode(this.toBinary());
  }

  /**
   * Signs the authentication token using the provided signer.
   *
   * @param signer - The instance of Signer to use for signing the token.
   *
   * @example
   *
   * ```typescript
   * const signer: Signer = ...;
   * const authToken = new AuthToken(...);
   *
   * await authToken.sign(signer);
   * ```
   */
  async sign(signer: Signer) {
    this.token.signature = await createSignature(signer, this.toBinary());

    return this;
  }

  /**
   * Creates an `AuthToken` from a string or another `AuthToken`.
   *
   * @param token - The token as a string or an `AuthToken`.
   *
   * @returns An instance of the `AuthToken` class.
   *
   * @throws Will throw an error if the token is invalid.
   *
   * @example
   *
   * ```typescript
   * const token: string = '...';
   * const authToken = AuthToken.from(token);
   *
   * console.log(authToken);
   * ```
   */
  static from(token: string | AuthToken) {
    const parent = this.maybeToken(token);

    if (!parent?.token.payload) {
      throw new Error('Invalid token');
    }

    const { subject, ...params } = parent.token.payload;

    return new AuthToken({
      ...params,
      prev: subject && parent, // Set `prev` only if `subject` is provided
    });
  }

  /**
   * Creates an `AuthToken` with full access (GET, PUT, DELETE operations).
   *
   * @param params - The parameters of the token access.
   *
   * @returns An instance of the `AuthToken` class with full access.
   *
   * @example
   *
   * ```typescript
   * const authToken = AuthToken.fullAccess({
   *   bucketId: 1n,
   * });
   * ```
   */
  static fullAccess(params: Omit<AuthTokenParams, 'operations'> = {}) {
    return new AuthToken({ ...params, operations: [Operation.GET, Operation.PUT, Operation.DELETE] });
  }
}
