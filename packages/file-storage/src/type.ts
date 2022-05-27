import {Piece, PieceUri} from "@cere-ddc-sdk/content-addressable-storage";
import {SchemeInterface} from "@cere-ddc-sdk/core";
import {FileStorageConfig} from "./core/FileStorageConfig";
import {Readable} from "node:stream";
import * as streamWeb from "stream/web";
import {PathLike} from "fs";

export {FileStorageConfig, KB, MB} from "./core/FileStorageConfig";

export type Data = ReadableStream<Uint8Array> | streamWeb.ReadableStream<Uint8Array> | Readable | Blob | Uint8Array | PathLike

export interface FileStorage {
    upload(bucketId: bigint, data: Data): Promise<PieceUri>;

    uploadPiece(bucketId: bigint, piece: Piece): Promise<PieceUri>;

    uploadPieceEncrypted(bucketId: bigint, piece: Piece, dekHex: string): Promise<PieceUri>;

    read(bucketId: bigint, cid: string): ReadableStream<Uint8Array>;

    readPiece(bucketId: bigint, cid: string): Promise<Piece>;

    readPieceEncrypted(bucketId: bigint, cid: string, dekHex: string): Promise<Piece>;
}

export declare const FileStorage: {
    prototype: FileStorage;
    new(scheme: SchemeInterface, gatewayNodeUrl: string, config?: FileStorageConfig): FileStorage;
};
