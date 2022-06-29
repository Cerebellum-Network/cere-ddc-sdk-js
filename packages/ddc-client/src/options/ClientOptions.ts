//TODO put comments
import {CidBuilder, CipherInterface, NaclCipher, SchemeInterface, SchemeName} from "@cere-ddc-sdk/core";
import {SmartContractOptions, TESTNET} from "@cere-ddc-sdk/smart-contract";
import {DEFAULT_FILE_STORAGE_CONFIG, FileStorageConfig} from "@cere-ddc-sdk/file-storage";

type FileOptions = FileStorageConfig;

export class ClientOptions {
    clusterAddress: string | number; // Cluster ID or CDN URL
    fileOptions?: FileOptions = DEFAULT_FILE_STORAGE_CONFIG;
    smartContract?: SmartContractOptions = TESTNET;
    scheme?: SchemeName | SchemeInterface = "sr25519";
    cipher?: CipherInterface = new NaclCipher();
    cidBuilder?: CidBuilder = new CidBuilder();

    constructor(clusterAddress: string | number = "") {
        this.clusterAddress = clusterAddress;
    }
}

const defaultClientOptions = new ClientOptions();

export const initDefaultOptions = (options: ClientOptions): ClientOptions => {
    if (!options.clusterAddress && options.clusterAddress != 0) {
        throw Error(`invalid clusterAddress='${options.clusterAddress}'`)
    }

    options.fileOptions = {
        parallel: options.fileOptions?.parallel || DEFAULT_FILE_STORAGE_CONFIG.parallel,
        pieceSizeInBytes: options.fileOptions?.pieceSizeInBytes || DEFAULT_FILE_STORAGE_CONFIG.pieceSizeInBytes,
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

