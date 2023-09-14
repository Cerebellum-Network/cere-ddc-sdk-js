import {CID} from 'multiformats';
import {base32} from 'multiformats/bases/base32';
import {blake2b256} from '@multiformats/blake2/blake2b';
import * as raw from 'multiformats/codecs/raw';

export class CidBuilder {
    async build(data: Uint8Array): Promise<string> {
        const hash = await blake2b256.digest(data);
        const cid = CID.create(1, raw.code, hash);

        return cid.toString(base32);
    }
}
