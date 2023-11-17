import {Signer} from '@cere-ddc-sdk/blockchain';

import * as cns from './CnsApi';
import {Cid} from './Cid';

export class CnsRecord implements Omit<cns.Record, 'cid' | 'signature'> {
    signature?: cns.RecordSignature;

    constructor(readonly cid: string, readonly name: string) {}

    sign(signer: Signer) {
        const algorithm = signer.type;

        if (algorithm !== 'ed25519' && algorithm !== 'sr25519') {
            throw new Error(`Signer type ${signer.type} is not allowed in CNS API`);
        }

        const sigMessage = cns.createSignatureMessage({
            name: this.name,
            cid: new Cid(this.cid).toBytes(),
        });

        this.signature = {
            algorithm,
            signer: signer.publicKey,
            value: signer.sign(sigMessage),
        };

        return this;
    }
}

export class CnsRecordResponse extends CnsRecord {
    constructor(cid: string | Uint8Array, name: string, readonly signature: cns.RecordSignature) {
        const cidObject = new Cid(cid);

        super(cidObject.toString(), name);
    }
}

export const mapCnsRecordToAPI = ({signature, name, cid}: CnsRecord): cns.Record => {
    if (!signature) {
        throw new Error('CNS record signature is required');
    }

    return {
        name,
        signature,
        cid: new Cid(cid).toBytes(),
    };
};
