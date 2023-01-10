import {ContentAddressableStorage, EncryptionOptions, Link, PieceUri, Tag} from '@cere-ddc-sdk/content-addressable-storage';
import {FileStorageConfig} from './core/FileStorageConfig.js';
import {Readable} from 'node:stream';
import type {ReadableStream as NodeReadableStream} from 'stream/web';
import {PathLike} from 'fs';
import {GetFirstArgument, RequiredSelected} from '@cere-ddc-sdk/core';

export {FileStorageConfig, KB, MB} from './core/FileStorageConfig.js';

type CaCreateOptions = GetFirstArgument<typeof ContentAddressableStorage.build>;
type Options = RequiredSelected<Partial<CaCreateOptions>, 'clusterAddress'>;

export type Data = ReadableStream<Uint8Array> | NodeReadableStream<Uint8Array> | Readable | Blob | Uint8Array | PathLike

export interface FileStorage {
    readonly config: FileStorageConfig;
    readonly caStorage: ContentAddressableStorage;

    upload(bucketId: bigint, data: Data, tags: Tag[]): Promise<PieceUri>;

    read(bucketId: bigint, cid: string, session?: Uint8Array): NodeReadableStream<Uint8Array> | ReadableStream<Uint8Array>;

    readLinks(bucketId: bigint, links: Array<Link>,
        session?: Uint8Array): NodeReadableStream<Uint8Array> | ReadableStream<Uint8Array>;

    readDecryptedLinks(bucketId: bigint, links: Array<Link>, dek: Uint8Array,
        session?: Uint8Array): NodeReadableStream<Uint8Array> | ReadableStream<Uint8Array>;

    readDecrypted(bucketId: bigint, cid: string, dek: Uint8Array,
        session: Uint8Array): NodeReadableStream<Uint8Array> | ReadableStream<Uint8Array>;

    uploadEncrypted(bucketId: bigint, data: Data, tags: Array<Tag>, encryptionOptions: EncryptionOptions): Promise<PieceUri>;
}

export declare const FileStorage: {
    prototype: FileStorage;
    new(caStorage: ContentAddressableStorage, config?: FileStorageConfig): FileStorage;
    build(storageOptions: Options, config?: FileStorageConfig, secretPhrase?: string): Promise<FileStorage>;
};
