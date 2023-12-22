import base58 from 'bs58';
import { BucketId, Signer } from '@cere-ddc-sdk/blockchain';

import { AUTH_TOKEN_EXPIRATION_TIME } from '../constants';
import {
  Token as ProtoToken,
  Token_Payload,
  Token_Payload_Operation as Operation,
  Token_Header_Algorithm,
} from '../grpc/auth';

export { Operation as AuthTokenOperation };

type AuthTokenParams = {
  operations: Operation[];
  bucketId?: BucketId;
  expiresAt?: number;
};

export class AuthToken {
  private token: ProtoToken;

  constructor({ bucketId, operations, expiresAt }: AuthTokenParams) {
    const payload: Token_Payload = {
      bucketId,
      operations,
      expiresAt: expiresAt ?? Date.now() + AUTH_TOKEN_EXPIRATION_TIME,
      canDelegate: false,
    };

    this.token = ProtoToken.create({ payload });
  }

  private toBinary() {
    return ProtoToken.toBinary(this.token);
  }

  async sign(signer: Signer) {
    await signer.isReady();

    const payload = Token_Payload.create(this.token.payload);
    const binPayload = Token_Payload.toBinary(payload);

    this.token.signature = signer.sign(binPayload);

    // this.token.signature = signer.sign(this.toBinary());
    this.token.header = {
      algorithm: signer.type === 'sr25519' ? Token_Header_Algorithm.SR_25519 : Token_Header_Algorithm.ED_25519,
      issuer: signer.publicKey,
    };

    return this;
  }

  toString() {
    return base58.encode(this.toBinary());
  }
}
