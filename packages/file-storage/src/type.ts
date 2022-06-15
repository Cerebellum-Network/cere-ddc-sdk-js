import {
    ContentAddressableStorage,
    Link,
    PieceUri,
    Tag,
    EncryptionOptions,
    StorageOptions
} from "@cere-ddc-sdk/content-addressable-storage";
import {FileStorageConfig} from "./core/FileStorageConfig";
import {Readable} from "node:stream";
import * as streamWeb from "stream/web";
import {PathLike} from "fs";

export {FileStorageConfig, KB, MB} from "./core/FileStorageConfig";

export type Data = ReadableStream<Uint8Array> | streamWeb.ReadableStream<Uint8Array> | Readable | Blob | Uint8Array | PathLike

export interface FileStorage {
    readonly config: FileStorageConfig;
    readonly caStorage: ContentAddressableStorage;

    upload(bucketId: bigint, data: Data, tags: Array<Tag>): Promise<PieceUri>;
    upload(bucketId: bigint, data: Data): Promise<PieceUri>;
    read(bucketId: bigint, cid: string): ReadableStream<Uint8Array>;

    readLinks(bucketId: bigint, links: Array<Link>): ReadableStream<Uint8Array>;
    readDecryptedLinks(bucketId: bigint, links: Array<Link>, dek: Uint8Array): ReadableStream<Uint8Array>;

    readDecrypted(bucketId: bigint, cid: string, dek: Uint8Array): ReadableStream<Uint8Array>;
    uploadEncrypted(bucketId: bigint, data: Data, tags: Array<Tag>, encryptionOptions: EncryptionOptions): Promise<PieceUri>;
}

export declare const FileStorage: {
    prototype: FileStorage;
    new(caStorage: ContentAddressableStorage, config?: FileStorageConfig): FileStorage;
    build(storageOptions: StorageOptions, config?: FileStorageConfig): Promise<FileStorage>;
};
