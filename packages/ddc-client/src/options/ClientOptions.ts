//TODO put comments
import {CidBuilder, CipherInterface, SchemeInterface} from "@cere-ddc-sdk/core";
import {Options as SmartContractOptions, TESTNET} from "@cere-ddc-sdk/smart-contract";
import {SchemeType} from "packages/core/src/crypto/signature/Scheme";

export const KB = 1024
export const MB = 1024 * KB

export class ClientOptions {
    pieceConcurrency?: number = 4;
    chunkSizeInBytes?: number = 5 * MB;
    smartContract?: SmartContractOptions = TESTNET;
    scheme?: SchemeType | SchemeInterface = "sr25519";
    cipher?: CipherInterface;
    cidBuilder?: CidBuilder = new CidBuilder();
}