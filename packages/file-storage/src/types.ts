import type {PathLike} from 'fs';
import type {Readable} from 'node:stream';
import {
    ContentAddressableStorage,
    EncryptionOptions,
    Link,
    PieceUri,
    ReadOptions,
    StoreOptions,
    Tag,
} from '@cere-ddc-sdk/content-addressable-storage';
import type {ReadableStream as NodeReadableStream} from 'stream/web';
import {GetFirstArgument, RequiredSelected} from '@cere-ddc-sdk/core';

import {FileStorageConfig} from './core/FileStorageConfig.js';
import {CoreFileStorage} from './core/CoreFileStorage.js';

type CaCreateOptions = GetFirstArgument<typeof ContentAddressableStorage.build>;
type Options = RequiredSelected<Partial<CaCreateOptions>, 'clusterAddress'>;

export type Data =
    | ReadableStream<Uint8Array>
    | NodeReadableStream<Uint8Array>
    | Readable
    | Blob
    | PathLike
    | Uint8Array;
export {FileStorageConfig, KB, MB} from './core/FileStorageConfig.js';

export interface FileStorage {
    readonly config: FileStorageConfig;
    readonly caStorage: ContentAddressableStorage;
    readonly fs: CoreFileStorage;

    upload(bucketId: bigint, data: Data, tags: Tag[], storeOptions?: StoreOptions): Promise<PieceUri>;

    read(
        bucketId: bigint,
        cid: string,
        readOptions?: ReadOptions,
    ): NodeReadableStream<Uint8Array> | ReadableStream<Uint8Array>;

    readLinks(
        bucketId: bigint,
        links: Array<Link>,
        readOptions?: ReadOptions,
    ): NodeReadableStream<Uint8Array> | ReadableStream<Uint8Array>;

    readDecryptedLinks(
        bucketId: bigint,
        links: Array<Link>,
        dek: Uint8Array,
        readOptions?: ReadOptions,
    ): NodeReadableStream<Uint8Array> | ReadableStream<Uint8Array>;

    readDecrypted(
        bucketId: bigint,
        cid: string,
        dek: Uint8Array,
        readOptions?: ReadOptions,
    ): NodeReadableStream<Uint8Array> | ReadableStream<Uint8Array>;

    uploadEncrypted(
        bucketId: bigint,
        data: Data,
        tags: Array<Tag>,
        encryptionOptions: EncryptionOptions,
        readOptions?: StoreOptions,
    ): Promise<PieceUri>;

    disconnect(): Promise<void>;
}

export declare const FileStorage: {
    prototype: FileStorage;
    new (caStorage: ContentAddressableStorage, config?: FileStorageConfig): FileStorage;
    build(storageOptions: Options, config?: FileStorageConfig, secretPhrase?: string): Promise<FileStorage>;
};
