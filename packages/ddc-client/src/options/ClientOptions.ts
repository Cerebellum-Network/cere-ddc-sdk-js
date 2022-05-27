//TODO put comments
import {CipherInterface, SchemeInterface} from "@cere-ddc-sdk/core";
import {Options as SmartContractOptions, TESTNET} from "@cere-ddc-sdk/smart-contract";

export const KB = 1024
export const MB = 1024 * KB

export class ClientOptions {
    pieceConcurrency?: number = 4;
    chunkSizeInBytes?: number = 5 * MB;
    smartContract?: SmartContractOptions = TESTNET;
    scheme?: string | SchemeInterface = "sr25519";
    cipher?: CipherInterface;
}