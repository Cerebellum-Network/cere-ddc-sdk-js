import {base32} from 'rfc4648';

export class Cid {
    private cid: Uint8Array | string;

    constructor(cid: string | Uint8Array | Cid) {
        this.cid = cid instanceof Cid ? cid.toBytes() : cid;
    }

    get contentHash() {
        return this.toBytes().slice(-32);
    }

    toString() {
        return typeof this.cid === 'string' ? this.cid : base32.stringify(this.cid, {pad: false});
    }

    toBytes() {
        return typeof this.cid === 'string' ? base32.parse(this.cid, {loose: true}) : this.cid;
    }

    static isCid(cid: string | Uint8Array) {
        try {
            const bytes = new Cid(cid).toBytes();

            return bytes.byteLength > 32; // TODO: Implement proper CID parsing and detection
        } catch {
            return false;
        }
    }
}
