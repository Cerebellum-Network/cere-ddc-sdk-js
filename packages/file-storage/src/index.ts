import {GetFirstArgument, RequiredSelected} from '@cere-ddc-sdk/core';
import {
    ContentAddressableStorage,
    EncryptionOptions,
    Link,
    PieceUri,
    ReadOptions,
    StoreOptions,
    Tag,
} from '@cere-ddc-sdk/content-addressable-storage';
import * as streamWeb from 'stream/web';
import {FileStorageConfig} from './core/FileStorageConfig';
import {CoreFileStorage} from './core/CoreFileStorage';
import {Data, FileStorage as FileStorageInterface} from './types';
import {transformDataToStream} from './utils';

export {FileStorageConfig, KB, MB} from './core/FileStorageConfig';

type CaCreateOptions = GetFirstArgument<typeof ContentAddressableStorage.build>;
type Options = RequiredSelected<Partial<CaCreateOptions>, 'clusterAddress'>;

export class FileStorage implements FileStorageInterface {
    readonly config: FileStorageConfig;
    readonly caStorage: ContentAddressableStorage;

    private readonly fs: CoreFileStorage;

    constructor(caStorage: ContentAddressableStorage, config: FileStorageConfig = new FileStorageConfig()) {
        this.fs = new CoreFileStorage(caStorage, config);
        this.caStorage = caStorage;
        this.config = config;
    }

    static async build(
        storageOptions: Options,
        config: FileStorageConfig = new FileStorageConfig(),
        secretPhrase: string,
    ): Promise<FileStorage> {
        return new FileStorage(await ContentAddressableStorage.build(storageOptions, secretPhrase), config);
    }

    disconnect(): Promise<void> {
        return this.caStorage.disconnect();
    }

    async upload(
        bucketId: bigint,
        data: Data,
        tags: Array<Tag> = [],
        storeOptions: StoreOptions = {},
    ): Promise<PieceUri> {
        const stream = await transformDataToStream(data);
        const reader = stream.pipeThrough(new streamWeb.TransformStream(this.fs.chunkTransformer())).getReader();

        return await this.fs.uploadFromStreamReader(bucketId, reader, tags, undefined, storeOptions);
    }

    read(bucketId: bigint, cid: string, readOptions: ReadOptions = {}): streamWeb.ReadableStream<Uint8Array> {
        return new streamWeb.ReadableStream<Uint8Array>(
            this.fs.createReadUnderlyingSource(bucketId, cid, undefined, readOptions),
            new streamWeb.CountQueuingStrategy({highWaterMark: this.fs.config.parallel}),
        );
    }

    readDecrypted(
        bucketId: bigint,
        cid: string,
        dek: Uint8Array,
        readOptions: ReadOptions = {},
    ): streamWeb.ReadableStream<Uint8Array> {
        return new streamWeb.ReadableStream<Uint8Array>(
            this.fs.createReadUnderlyingSource(bucketId, cid, dek, readOptions),
            new streamWeb.CountQueuingStrategy({highWaterMark: this.fs.config.parallel}),
        );
    }

    async uploadEncrypted(
        bucketId: bigint,
        data: Data,
        tags: Array<Tag> = [],
        encryptionOptions: EncryptionOptions,
        storeOptions: StoreOptions = {},
    ): Promise<PieceUri> {
        const stream = await transformDataToStream(data);
        const reader = stream.pipeThrough(new streamWeb.TransformStream(this.fs.chunkTransformer())).getReader();

        return await this.fs.uploadFromStreamReader(bucketId, reader, tags, encryptionOptions, storeOptions);
    }

    readLinks(
        bucketId: bigint,
        links: Array<Link>,
        readOptions: ReadOptions = {},
    ): streamWeb.ReadableStream<Uint8Array> | ReadableStream<Uint8Array> {
        return new streamWeb.ReadableStream<Uint8Array>(
            this.fs.createReadUnderlyingSource(bucketId, links, undefined, readOptions),
            new streamWeb.CountQueuingStrategy({highWaterMark: this.fs.config.parallel}),
        );
    }

    readDecryptedLinks(
        bucketId: bigint,
        links: Array<Link>,
        dek: Uint8Array,
        readOptions: ReadOptions = {},
    ): streamWeb.ReadableStream<Uint8Array> | ReadableStream<Uint8Array> {
        return new streamWeb.ReadableStream<Uint8Array>(
            this.fs.createReadUnderlyingSource(bucketId, links, dek, readOptions),
            new streamWeb.CountQueuingStrategy({highWaterMark: this.fs.config.parallel}),
        );
    }
}
