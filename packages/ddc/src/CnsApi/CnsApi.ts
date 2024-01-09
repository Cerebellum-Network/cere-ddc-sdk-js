import { status as GrpcStatus } from '@grpc/grpc-js';
import { RpcError } from '@protobuf-ts/runtime-rpc';
import type { Signer } from '@cere-ddc-sdk/blockchain';

import { RpcTransport } from '../transports';
import { createSignature, mapSignature, Signature } from '../signature';
import { CnsApiClient } from '../grpc/cns_api.client';
import { GetRequest as ProtoGetRequest, PutRequest as ProtoPutRequest, Record as ProtoRecord } from '../grpc/cns_api';
import { createRpcMeta, AuthToken } from '../auth';

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

export type CnsApiOptions = {
  signer?: Signer;
};

export class CnsApi {
  private api: CnsApiClient;

  constructor(
    transport: RpcTransport,
    private options: CnsApiOptions = {},
  ) {
    this.api = new CnsApiClient(transport);
  }

  async putRecord({ token, bucketId, record }: PutRequest): Promise<Record> {
    const { signer } = this.options;

    if (!signer) {
      throw new Error('Unnable to store CNS record. Signer required!');
    }

    const signature = await createSignature(signer, createSignatureMessage(record));

    await this.api.put(
      { bucketId, record: { ...record, signature } },
      {
        meta: createRpcMeta(token),
      },
    );

    return {
      ...record,
      signature: mapSignature(signature),
    };
  }

  async getRecord({ token, ...request }: GetRequest): Promise<Record | undefined> {
    let record: ProtoRecord | undefined;

    try {
      const { response } = await this.api.get(request, {
        meta: createRpcMeta(token),
      });

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
      return undefined;
    }

    return {
      ...record,
      signature: mapSignature(record.signature),
      cid: new Uint8Array(record.cid),
    };
  }
}
