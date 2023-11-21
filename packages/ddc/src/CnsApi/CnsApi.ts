import { RpcTransport } from '../transports';
import { CnsApiClient } from '../grpc/cns_api.client';
import {
  GetRequest,
  PutRequest as ProtoPutRequest,
  Record as ProtRecord,
  Record_Signature,
  Record_Signature_Algorithm as SigAlg,
} from '../grpc/cns_api';

export type RecordSignature = Omit<Record_Signature, 'algorithm'> & {
  algorithm: 'ed25519' | 'sr25519';
};

export type Record = Omit<ProtRecord, 'signature'> & {
  signature: RecordSignature;
};

type PutRequest = Omit<ProtoPutRequest, 'record'> & {
  record: Record;
};

export const createSignatureMessage = (record: Omit<Record, 'signature'>) => {
  const message = ProtRecord.create(record);

  return ProtRecord.toBinary(message);
};

export class CnsApi {
  private api: CnsApiClient;

  constructor(transport: RpcTransport) {
    this.api = new CnsApiClient(transport);
  }

  async putRecord({ bucketId, record }: PutRequest) {
    if (!record.signature) {
      throw new Error('Unnable to store unsigned CNS record');
    }

    const signature = {
      ...record.signature,
      algorithm: record.signature.algorithm === 'ed25519' ? SigAlg.ED_25519 : SigAlg.SR_25519,
    };

    await this.api.put({
      bucketId,
      record: { ...record, signature },
    });
  }

  async getRecord(request: GetRequest): Promise<Record | undefined> {
    let record: ProtRecord | undefined;

    try {
      const { response } = await this.api.get(request);

      record = response.record;
    } catch {
      // Skip
    }

    if (!record || !record.signature) {
      return undefined;
    }

    const signature: RecordSignature = {
      algorithm: record.signature.algorithm === SigAlg.ED_25519 ? 'ed25519' : 'sr25519',
      value: new Uint8Array(record.signature.value),
      signer: new Uint8Array(record.signature.signer),
    };

    return {
      ...record,
      signature,
      cid: new Uint8Array(record.cid),
    };
  }

  static createSignatureMessage(record: Omit<Record, 'signature'>) {
    return createSignatureMessage(record);
  }
}
