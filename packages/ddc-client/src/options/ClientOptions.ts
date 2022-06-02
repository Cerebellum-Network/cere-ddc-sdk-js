//TODO put comments
import {CidBuilder, CipherInterface, SchemeInterface, SchemeType} from "@cere-ddc-sdk/core";
import {Options as SmartContractOptions, TESTNET} from "@cere-ddc-sdk/smart-contract";

export const KB = 1024
export const MB = 1024 * KB

export class ClientOptions {
     clusterAddress: string | number; // Cluster ID or Gateway URL
     pieceConcurrency?: number = 4;
     chunkSizeInBytes?: number = 5 * MB;
     smartContract?: SmartContractOptions = TESTNET;
     scheme?: SchemeType | SchemeInterface = "sr25519";
     cipher?: CipherInterface;
     cidBuilder?: CidBuilder = new CidBuilder();

     constructor(clusterAddress: string | number = "") {
         this.clusterAddress = clusterAddress;
     }
}

const defaultClientOptions = new ClientOptions();

export const initDefaultOptions = (options: ClientOptions): ClientOptions => {
    if (!options.clusterAddress) {
        throw new Error(`invalid clusterAddress='${options.clusterAddress}'`)
    }

    return {
        clusterAddress: options.clusterAddress,
        pieceConcurrency: options.pieceConcurrency || defaultClientOptions.pieceConcurrency,
        chunkSizeInBytes: options.chunkSizeInBytes || defaultClientOptions.chunkSizeInBytes,
        smartContract: options.smartContract || defaultClientOptions.smartContract,
        scheme: options.scheme || defaultClientOptions.scheme,
        cipher: options.cipher || defaultClientOptions.cipher,
        cidBuilder: options.cidBuilder || defaultClientOptions.cidBuilder
    }
}

