import { RpcError } from '@protobuf-ts/runtime-rpc';
import type { Signer } from '@cere-ddc-sdk/blockchain';

import { RpcTransport } from '../transports';
import { createRpcMeta, AuthToken } from '../auth';
import { Logger, LoggerOptions, createLogger } from '../logger';
import { GrpcStatus } from '../grpc/status';
import { createSignature, mapSignature, Signature } from '../signature';
import { CnsApiClient } from '../grpc/cns_api.client';
import { GetRequest as ProtoGetRequest, PutRequest as ProtoPutRequest, Record as ProtoRecord } from '../grpc/cns_api';
import { ActivityRequestType, createActivityRequest } from '../activity';

type AuthParams = { token?: AuthToken };
export type Record = Omit<ProtoRecord, 'signature'> & {
  signature: Signature;
};

type PutRequest = Omit<ProtoPutRequest, 'record'> &
  AuthParams & {
    record: Omit<Record, 'signature'>;
  };

type GetRequest = ProtoGetRequest & AuthParams;

const createSignatureMessage = (record: Omit<Record, 'signature'>) => {
  const message = ProtoRecord.create(record);

  return ProtoRecord.toBinary(message);
};

export type CnsApiOptions = LoggerOptions & {
  signer?: Signer;
  enableAcks?: boolean;
};

/**
 * The `CnsApi` class provides methods to interact with the DDC CNS API.
 *
 * @group Content Name System (CNS)
 * @example
 *
 * ```typescript
 * import { CnsApi, GrpcTransport } from '@cere-ddc-sdk/ddc';
 *
 * const transport = new GrpcTransport(...);
 * const cnsApi = new CnsApi(transport);
 * ```
 */
export class CnsApi {
  private logger: Logger;
  private api: CnsApiClient;
  private options: CnsApiOptions;

  constructor(transport: RpcTransport, options: CnsApiOptions = {}) {
    this.api = new CnsApiClient(transport);
    this.logger = createLogger('CnsApi', options);

    this.options = {
      ...options,
      enableAcks: options.enableAcks ?? !!options.signer, // ACKs are enabled by default if signer is provided
    };
  }

  /**
   * Stores a CNS record to DDC.
   *
   * @param request - An object that includes the token, bucket ID, and record to store.
   *
   * @returns The stored record with its signature.
   *
   * @example
   *
   * ```typescript
   * const request: PutRequest = {
   *   token: '...',
   *   bucketId: '...',
   *   record: { ... }
   * };
   *
   * const record = await cnsApi.putRecord(request);
   *
   * console.log(record); //
   * ```
   */
  async putRecord({ token, bucketId, record }: PutRequest): Promise<Record> {
    this.logger.debug({ bucketId, record, token }, 'Storing CNS record');

    const meta = createRpcMeta(token);
    const { signer } = this.options;

    if (!signer) {
      throw new Error('Unnable to store CNS record. Signer required!');
    }

    if (this.options.enableAcks) {
      meta.request = await createActivityRequest(
        { bucketId, size: ProtoRecord.toBinary(record).byteLength, requestType: ActivityRequestType.STORE },
        { logger: this.logger, signer: this.options.signer },
      );
    }

    const signature = await createSignature(signer, createSignatureMessage(record));

    await this.api.put({ bucketId, record: { ...record, signature } }, { meta });

    this.logger.debug({ ...record }, 'CNS record stored');

    return {
      ...record,
      signature: mapSignature(signature),
    };
  }

  /**
   * Retrieves a CNS record from DDC.
   *
   * @param request - An object that includes the token, bucket ID, and record name to retrieve.
   *
   * @returns The retrieved record with its signature.
   *
   * @example
   *
   * ```typescript
   * const request: GetRequest = {
   *   token: '...',
   *   bucketId: '...',
   *   name: 'example'
   * };
   *
   * const record = await cnsApi.getRecord(getRequest);
   *
   * console.log(record);
   * ```
   */
  async getRecord({ token, name, bucketId }: GetRequest): Promise<Record | undefined> {
    this.logger.debug({ name, bucketId, token }, 'Retrieving CNS record');

    let record: ProtoRecord | undefined;
    const meta = createRpcMeta(token);

    if (this.options.enableAcks) {
      meta.request = await createActivityRequest(
        { bucketId, requestType: ActivityRequestType.GET },
        { logger: this.logger, signer: this.options.signer },
      );
    }

    try {
      const { response } = await this.api.get({ name, bucketId }, { meta });

      record = response.record;
    } catch (error) {
      /**
       * The error code is UNKNOWN when the record is not found.
       *
       * TODO: figure out a better way to detect NOT_FOUNT error. Probably change the error code on the node side to GRPC NOT_FOUND.
       */
      const isNotFound = error instanceof RpcError && error.code === GrpcStatus[GrpcStatus.UNKNOWN];

      if (!isNotFound) {
        throw error;
      }
    }

    if (!record?.signature) {
      this.logger.debug({ name, bucketId }, 'CNS record not found');

      return undefined;
    }

    this.logger.debug({ ...record }, 'CNS record retrieved');

    return {
      ...record,
      signature: mapSignature(record.signature),
      cid: new Uint8Array(record.cid),
    };
  }
}
