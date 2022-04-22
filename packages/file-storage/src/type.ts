import {SchemeInterface} from "@cere-ddc-sdk/content-addressable-storage";
import {FileStorageConfig} from "./core/FileStorageConfig";
import {FileStorageInterface} from "./core/FileStorage.interface";

export {FileStorageConfig, KB, MB} from "./core/FileStorageConfig";
export declare const FileStorage: {
    prototype: FileStorageInterface;
    new(scheme: SchemeInterface, gatewayNodeUrl: string, config?: FileStorageConfig): FileStorageInterface;
}

