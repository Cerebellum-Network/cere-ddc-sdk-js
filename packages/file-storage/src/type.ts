import {ContentAddressableStorage, Link, PieceUri, Tag} from "@cere-ddc-sdk/content-addressable-storage";
import {CidBuilder, CipherInterface, SchemeInterface} from "@cere-ddc-sdk/core";
import {FileStorageConfig} from "./core/FileStorageConfig";
import {Readable} from "node:stream";
import * as streamWeb from "stream/web";
import {PathLike} from "fs";
import {EncryptionOptions} from "@cere-ddc-sdk/core/src/crypto/encryption/EncryptionOptions";

export {FileStorageConfig, KB, MB} from "./core/FileStorageConfig";

export type Data = ReadableStream<Uint8Array> | streamWeb.ReadableStream<Uint8Array> | Readable | Blob | Uint8Array | PathLike

export interface FileStorage {
    readonly config: FileStorageConfig;
    readonly caStorage: ContentAddressableStorage;

    upload(bucketId: bigint, data: Data, tags: Array<Tag>): Promise<PieceUri>;
    upload(bucketId: bigint, data: Data): Promise<PieceUri>;
    read(bucketId: bigint, cid: string): ReadableStream<Uint8Array>;

    readLinks(bucketId: bigint, links: Array<Link>): ReadableStream<Uint8Array>;
    readDecryptedLinks(bucketId: bigint, links: Array<Link>, dek: string): ReadableStream<Uint8Array>;

    readDecrypted(bucketId: bigint, cid: string, dek: string): ReadableStream<Uint8Array>;
    uploadEncrypted(bucketId: bigint, data: Data, tags: Array<Tag>, encryptionOptions: EncryptionOptions): Promise<PieceUri>;
}

export declare const FileStorage: {
    prototype: FileStorage;
    new(scheme: SchemeInterface, gatewayNodeUrl: string, config?: FileStorageConfig, cipher?: CipherInterface, cidBuilder?: CidBuilder): FileStorage;
};
