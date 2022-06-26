//TODO put comments
import {CidBuilder, CipherInterface, NaclCipher, SchemeInterface, SchemeName} from "@cere-ddc-sdk/core";
import {SmartContractOptions, TESTNET} from "@cere-ddc-sdk/smart-contract";
import {FileStorageConfig} from "@cere-ddc-sdk/file-storage";

type FileOptions = FileStorageConfig;

export class ClientOptions {
    clusterAddress: string | number; // Cluster ID or CDN URL
    fileOptions?: FileOptions = new FileStorageConfig();
    smartContract?: SmartContractOptions = TESTNET;
    scheme?: SchemeName | SchemeInterface = "sr25519";
    cipher?: CipherInterface = new NaclCipher();
    cidBuilder?: CidBuilder = new CidBuilder();

    constructor(clusterAddress: string | number = "") {
        this.clusterAddress = clusterAddress;
    }
}

const defaultClientOptions = new ClientOptions();
const defaultFileOptions = new FileStorageConfig();

export const initDefaultOptions = (options: ClientOptions): ClientOptions => {
    if (!options.clusterAddress) {
        throw new Error(`invalid clusterAddress='${options.clusterAddress}'`)
    }

    options.fileOptions = {
        parallel: options.fileOptions?.parallel || defaultFileOptions.parallel,
        pieceSizeInBytes: options.fileOptions?.pieceSizeInBytes || defaultFileOptions.pieceSizeInBytes,
    }

    return {
        clusterAddress: options.clusterAddress,
        fileOptions: options.fileOptions,
        smartContract: options.smartContract || defaultClientOptions.smartContract,
        scheme: options.scheme || defaultClientOptions.scheme,
        cipher: options.cipher || defaultClientOptions.cipher,
        cidBuilder: options.cidBuilder || defaultClientOptions.cidBuilder
    }
}

