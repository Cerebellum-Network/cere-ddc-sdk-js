import {RpcTransport} from '@protobuf-ts/runtime-rpc';

import {CnsApiClient} from '../grpc/cns_api.client';
import {
    GetRequest,
    PutRequest,
    Record as ProtRecord,
    Record_Signature,
    Record_Signature_Algorithm as SigAlg,
} from '../grpc/cns_api';

type CnsRecordSignature = Omit<Record_Signature, 'algorithm'> & {
    algorithm: 'ed25519' | 'sr25519';
};

export type CnsRecord = Omit<ProtRecord, 'signature'> & {
    signature: CnsRecordSignature;
};

type CnsPutRequest = Omit<PutRequest, 'record'> & {
    record: CnsRecord;
};

export class CnsApi {
    private api: CnsApiClient;

    constructor(transport: RpcTransport) {
        this.api = new CnsApiClient(transport);
    }

    createSignatureMessage(record: Omit<CnsRecord, 'signature'>) {
        const message = ProtRecord.create(record);

        return ProtRecord.toBinary(message);
    }

    async putRecord({bucketId, record}: CnsPutRequest) {
        const signature = {
            ...record.signature,
            algorithm: record.signature.algorithm === 'ed25519' ? SigAlg.ED_25519 : SigAlg.SR_25519,
        };

        await this.api.put({
            bucketId,
            record: {...record, signature},
        });
    }

    async getRecord(request: GetRequest) {
        const {response} = await this.api.get(request);
        const record = response.record;

        if (!record || !record.signature) {
            return undefined;
        }

        const signature: CnsRecordSignature = {
            ...record.signature,
            algorithm: record.signature?.algorithm === SigAlg.ED_25519 ? 'ed25519' : 'sr25519',
            value: new Uint8Array(record.signature.value),
        };

        return {...response.record, signature};
    }
}
