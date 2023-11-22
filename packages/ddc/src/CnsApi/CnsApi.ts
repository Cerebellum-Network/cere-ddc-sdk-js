import type { Signer } from '@cere-ddc-sdk/blockchain';

import { RpcTransport } from '../transports';
import { createSignature, mapSignature, Signature } from '../signature';
import { CnsApiClient } from '../grpc/cns_api.client';
import { GetRequest, PutRequest as ProtoPutRequest, Record as ProtRecord } from '../grpc/cns_api';

export type Record = Omit<ProtRecord, 'signature'> & {
  signature: Signature;
};

type PutRequest = Omit<ProtoPutRequest, 'record'> & {
  record: Omit<Record, 'signature'>;
};

const createSignatureMessage = (record: Omit<Record, 'signature'>) => {
  const message = ProtRecord.create(record);

  return ProtRecord.toBinary(message);
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

  async putRecord({ bucketId, record }: PutRequest): Promise<Record> {
    const { signer } = this.options;

    if (!signer) {
      throw new Error('Unnable to store CNS record. Signer required!');
    }

    const signature = createSignature(signer, createSignatureMessage(record));

    await this.api.put({
      bucketId,
      record: {
        ...record,
        signature,
      },
    });

    return {
      ...record,
      signature: mapSignature(signature),
    };
  }

  async getRecord(request: GetRequest): Promise<Record | undefined> {
    let record: ProtRecord | undefined;

    try {
      const { response } = await this.api.get(request);

      record = response.record;
    } catch {
      record = undefined;
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
