import {hexToU8a, u8aToHex} from "@polkadot/util";

export class EncryptionOptions {
    readonly dekPath: string = "";
    readonly dek: string = "";

    private constructor() {
    }
}