import {PieceUri, SchemeInterface} from "@cere-ddc-sdk/content-addressable-storage";
import {ReadableStream} from "./stream"
import {FileStorageConfig} from "./FileStorageConfig";

export interface FileStorage {
    upload(bucketId: bigint, stream: ReadableStream<Uint8Array>): Promise<PieceUri>;

    read(bucketId: bigint, cid: string): ReadableStream<Uint8Array>;
}

export declare const FileStorage: {
    prototype: FileStorage;
    new(scheme: SchemeInterface, cdnNodeUrl: string, config?: FileStorageConfig): FileStorage;
};