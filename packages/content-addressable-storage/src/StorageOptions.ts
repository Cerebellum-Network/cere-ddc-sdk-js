import {SmartContractOptions, TESTNET} from "@cere-ddc-sdk/smart-contract";
import {CidBuilder, CipherInterface, NaclCipher, SchemeInterface, SchemeName} from "@cere-ddc-sdk/core";

export class StorageOptions {
    clusterAddress: string | number; // Cluster ID or CDN URL
    smartContract?: SmartContractOptions = TESTNET;
    scheme?: SchemeName | SchemeInterface = "sr25519";
    cipher?: CipherInterface = new NaclCipher();
    cidBuilder?: CidBuilder = new CidBuilder();

    constructor(clusterAddress: string | number = "") {
        this.clusterAddress = clusterAddress;
    }
}

const defaultOptions = new StorageOptions();

export const initDefaultOptions = (options: StorageOptions): StorageOptions => {
    if (!options.clusterAddress) {
        throw new Error(`invalid clusterAddress='${options.clusterAddress}'`)
    }

    return {
        clusterAddress: options.clusterAddress,
        smartContract: options.smartContract || defaultOptions.smartContract,
        scheme: options.scheme || defaultOptions.scheme,
        cipher: options.cipher || defaultOptions.cipher,
        cidBuilder: options.cidBuilder || defaultOptions.cidBuilder
    }
}