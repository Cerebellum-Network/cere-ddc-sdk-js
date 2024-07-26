import { RpcError } from '@protobuf-ts/runtime-rpc';
import type { Signer } from '@cere-ddc-sdk/blockchain';

import { RpcTransport } from '../transports';
import { createRpcMeta as createAuthRpcMeta, AuthMetaParams } from '../auth';
import { Logger, LoggerOptions, createLogger } from '../logger';
import { GrpcStatus } from '../grpc/status';
import { createSignature, mapSignature, Signature } from '../signature';
import { CnsApiClient } from '../grpc/cns_api.client';
import { GetRequest as ProtoGetRequest, PutRequest as ProtoPutRequest, Record as ProtoRecord } from '../grpc/cns_api';
import {
  ActivityRequestType,
  createActivityRequest,
  CorrelationMetaParams,
  createRpcMeta as createCorrelationRpcMeta,
} from '../activity';

export type Record = Omit<ProtoRecord, 'signature'> & {
  signature: Signature;
};

type PutRequest = Omit<ProtoPutRequest, 'record'> &
  CorrelationMetaParams &
  AuthMetaParams & {
    record: Omit<Record, 'signature'>;
  };

type GetRequest = CorrelationMetaParams &
  ProtoGetRequest &
  AuthMetaParams & {
    cacheControl?: 'no-cache';
  };

const createSignatureMessage = (record: Omit<Record, 'signature'>) => {
  const message = ProtoRecord.create(record);

  return ProtoRecord.toBinary(message);
};

export type CnsApiOptions = LoggerOptions & {
  signer?: Signer;

  /**
   * TODO: Remove this option in the next major version.
   *
   * @deprecated There is no acknowledgment mechanism in the CNS API anymore.
   * */
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

  constructor(
    transport: RpcTransport,
    private options: CnsApiOptions = {},
  ) {
    this.api = new CnsApiClient(transport);
    this.logger = createLogger('CnsApi', options);
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
  async putRecord({ token, bucketId, record, correlationId }: PutRequest): Promise<Record> {
    this.logger.debug({ bucketId, record, token, correlationId }, 'Storing CNS record');

    const meta = createCorrelationRpcMeta(correlationId, createAuthRpcMeta(token));
    const { signer } = this.options;

    if (!signer) {
      throw new Error('Unnable to store CNS record. Signer required!');
    }

    const signature = await createSignature(signer, createSignatureMessage(record), { token });

    meta.request = await createActivityRequest(
      { bucketId, size: ProtoRecord.toBinary(record).byteLength, requestType: ActivityRequestType.STORE },
      { logger: this.logger, signer },
    );

    await this.api.put({ bucketId, record: { ...record, signature } }, { meta });

    this.logger.debug({ record, correlationId }, 'CNS record stored');

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
  async getRecord({ token, name, bucketId, correlationId, cacheControl }: GetRequest): Promise<Record | undefined> {
    this.logger.debug({ name, bucketId, token, correlationId, cacheControl }, 'Retrieving CNS record');

    let record: ProtoRecord | undefined;
    const meta = createCorrelationRpcMeta(correlationId, createAuthRpcMeta(token));

    if (cacheControl) {
      meta['cache-control'] = cacheControl;
    }

    if (this.options.signer) {
      meta.request = await createActivityRequest(
        { bucketId, requestType: ActivityRequestType.GET },
        { token, logger: this.logger, signer: this.options.signer },
      );
    }

    try {
      const { response } = await this.api.get({ name, bucketId }, { meta });

      record = response.record;
    } catch (error) {
      /**
       * TODO: replace error.message === 'no result' with error.code === GrpcStatus[GrpcStatus.NOT_FOUND] when the status is fixed on stroage node side
       */
      const isNotFound =
        error instanceof RpcError && error.code === GrpcStatus[GrpcStatus.UNKNOWN] && error.message === 'no result'; // error.code === GrpcStatus[GrpcStatus.NOT_FOUND];

      if (!isNotFound) {
        throw error;
      }
    }

    if (!record?.signature) {
      this.logger.debug({ name, bucketId, correlationId }, 'CNS record not found');

      return undefined;
    }

    this.logger.debug({ record, correlationId }, 'CNS record retrieved');

    return {
      ...record,
      signature: mapSignature(record.signature),
      cid: new Uint8Array(record.cid),
    };
  }
}
