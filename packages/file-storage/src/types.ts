import type {PathLike} from 'fs';
import type {Readable} from 'node:stream';
import {
    ContentAddressableStorage,
    EncryptionOptions,
    Link,
    PieceUri,
    Session,
    Tag
} from '@cere-ddc-sdk/content-addressable-storage';
import type {ReadableStream as NodeReadableStream} from 'stream/web';
import {GetFirstArgument, RequiredSelected} from '@cere-ddc-sdk/core';

import {FileStorageConfig} from './core/FileStorageConfig.js';

type CaCreateOptions = GetFirstArgument<typeof ContentAddressableStorage.build>;
type Options = RequiredSelected<Partial<CaCreateOptions>, 'clusterAddress'>;

export type Data =
    ReadableStream<Uint8Array>
    | NodeReadableStream<Uint8Array>
    | Readable
    | Blob
    | PathLike
    | Uint8Array;
export {FileStorageConfig, KB, MB} from './core/FileStorageConfig.js';

export interface FileStorage {
    readonly config: FileStorageConfig;
    readonly caStorage: ContentAddressableStorage;

    upload(bucketId: bigint, session: Session, data: Data, tags: Tag[]): Promise<PieceUri>;

    read(bucketId: bigint, session: Session, cid: string): NodeReadableStream<Uint8Array> | ReadableStream<Uint8Array>;

    readLinks(bucketId: bigint, session: Session, links: Array<Link>): NodeReadableStream<Uint8Array> | ReadableStream<Uint8Array>;

    readDecryptedLinks(bucketId: bigint, session: Session, links: Array<Link>, dek: Uint8Array): NodeReadableStream<Uint8Array> | ReadableStream<Uint8Array>;

    readDecrypted(bucketId: bigint, session: Session, cid: string, dek: Uint8Array): NodeReadableStream<Uint8Array> | ReadableStream<Uint8Array>;

    uploadEncrypted(bucketId: bigint, session: Session, data: Data, tags: Array<Tag>, encryptionOptions: EncryptionOptions): Promise<PieceUri>;

    disconnect(): Promise<void>;
}

export declare const FileStorage: {
    prototype: FileStorage;
    new(caStorage: ContentAddressableStorage, config?: FileStorageConfig): FileStorage;
    build(storageOptions: Options, config?: FileStorageConfig, secretPhrase?: string): Promise<FileStorage>;
};
