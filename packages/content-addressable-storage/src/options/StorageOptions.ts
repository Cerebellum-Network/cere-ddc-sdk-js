import {SmartContractOptions, TESTNET} from "@cere-ddc-sdk/smart-contract";
import {CidBuilder, CipherInterface, NaclCipher, SchemeInterface, SchemeName} from "@cere-ddc-sdk/core";

export interface StorageOptions {
    readonly clusterAddress: string | number // Cluster ID or CDN URL
    readonly smartContract?: SmartContractOptions;
    readonly scheme?: SchemeName | SchemeInterface;
    readonly cipher?: CipherInterface;
    readonly cidBuilder?: CidBuilder;
}

export const DEFAULT_STORAGE_OPTIONS: StorageOptions = {
    clusterAddress: "",
    smartContract: TESTNET,
    scheme: "sr25519",
    cipher: new NaclCipher(),
    cidBuilder: new CidBuilder(),
}

export const initDefaultOptions = (options: StorageOptions): StorageOptions => {
    if (!options.clusterAddress && options.clusterAddress != 0) {
        throw Error(`invalid clusterAddress='${options.clusterAddress}'`);
    }

    return {
        clusterAddress: options.clusterAddress,
        smartContract: options.smartContract || DEFAULT_STORAGE_OPTIONS.smartContract,
        scheme: options.scheme || DEFAULT_STORAGE_OPTIONS.scheme,
        cipher: options.cipher || DEFAULT_STORAGE_OPTIONS.cipher,
        cidBuilder: options.cidBuilder || DEFAULT_STORAGE_OPTIONS.cidBuilder
    };
}