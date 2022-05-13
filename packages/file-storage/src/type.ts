import {PieceUri} from "@cere-ddc-sdk/content-addressable-storage";
import {SchemeInterface} from "@cere-ddc-sdk/core";
import {ReadableStream} from "./core/stream"
import {FileStorageConfig} from "./core/FileStorageConfig";
import {Readable} from "node:stream";
import {PathLike} from "fs";

export {FileStorageConfig, KB, MB} from "./core/FileStorageConfig";

export type Data = ReadableStream<Uint8Array> | Readable | Blob | Uint8Array | PathLike

export interface FileStorage {
    upload(bucketId: bigint, data: Data): Promise<PieceUri>;

    read(bucketId: bigint, cid: string): ReadableStream<Uint8Array>;
}

export declare const FileStorage: {
    prototype: FileStorage;
    new(scheme: SchemeInterface, gatewayNodeUrl: string, config?: FileStorageConfig): FileStorage;
};
