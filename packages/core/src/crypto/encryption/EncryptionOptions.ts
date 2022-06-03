import {hexToU8a, u8aToHex} from "@polkadot/util";

export class EncryptionOptions {
    readonly dekPath: string;
    readonly dek: Uint8Array;


    constructor(dekPath: string, dek: Uint8Array) {
        this.dekPath = dekPath;
        this.dek = dek;
    }
}