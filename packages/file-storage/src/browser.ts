export {FileStorageConfig, KB, MB} from "./core/FileStorageConfig.js";

import {
    ContentAddressableStorage,
    EncryptionOptions,
    Link,
    PieceUri,
    StorageOptions,
    Tag
} from "@cere-ddc-sdk/content-addressable-storage";
import {FileStorageConfig} from "./core/FileStorageConfig.js";
import {CoreFileStorage} from "./core/CoreFileStorage.js";
import {FileStorage as FileStorageInterface} from "./type.js";

type Data = ReadableStream<Uint8Array> | Blob | string | Uint8Array

export class FileStorage implements FileStorageInterface {

    readonly config: FileStorageConfig;
    readonly caStorage: ContentAddressableStorage;

    private readonly fs: CoreFileStorage;

    constructor(caStorage: ContentAddressableStorage, config: FileStorageConfig = new FileStorageConfig()) {
        this.fs = new CoreFileStorage(caStorage, config);
        this.caStorage = caStorage;
        this.config = config;
    }

    static async build(storageOptions: StorageOptions, config: FileStorageConfig = new FileStorageConfig(), secretPhrase?: string): Promise<FileStorage> {
        return new FileStorage(await ContentAddressableStorage.build(storageOptions, secretPhrase), config);
    }

    async upload(bucketId: bigint, data: Data, tags: Array<Tag> = []): Promise<PieceUri> {
        const stream = await transformDataToStream(data);
        const reader = stream.pipeThrough(new TransformStream(this.fs.chunkTransformer())).getReader();
        return await this.fs.uploadFromStreamReader(bucketId, reader, tags);
    }

    read(bucketId: bigint, cid: string): ReadableStream<Uint8Array> {
        return new ReadableStream<Uint8Array>(this.fs.createReadUnderlyingSource(bucketId, cid),
            new CountQueuingStrategy({highWaterMark: this.fs.config.parallel}));
    }

    readDecrypted(bucketId: bigint, cid: string, dek: Uint8Array): ReadableStream<Uint8Array> {
        return new ReadableStream<Uint8Array>(this.fs.createReadUnderlyingSource(bucketId, cid, dek),
            new CountQueuingStrategy({highWaterMark: this.fs.config.parallel}));
    }

    async uploadEncrypted(bucketId: bigint, data: Data, tags: Array<Tag> = [], encryptionOptions: EncryptionOptions): Promise<PieceUri> {
        const stream = await transformDataToStream(data);
        const reader = stream.pipeThrough(new TransformStream(this.fs.chunkTransformer())).getReader();
        return await this.fs.uploadFromStreamReader(bucketId, reader, tags, encryptionOptions);
    }

    readLinks(bucketId: bigint, links: Array<Link>): ReadableStream<Uint8Array> {
        return new ReadableStream<Uint8Array>(this.fs.createReadUnderlyingSource(bucketId, links),
            new CountQueuingStrategy({highWaterMark: this.fs.config.parallel}));
    }

    readDecryptedLinks(bucketId: bigint, links: Array<Link>, dek: Uint8Array): ReadableStream<Uint8Array> {
        return new ReadableStream<Uint8Array>(this.fs.createReadUnderlyingSource(bucketId, links, dek),
            new CountQueuingStrategy({highWaterMark: this.fs.config.parallel}));
    }


}

async function transformDataToStream(data: Data): Promise<ReadableStream<Uint8Array>> {
    if (data instanceof ReadableStream) {
        return data;
    } else if (data instanceof Blob) {
        // @ts-ignore lint thinks it's Blob of NodeJS
        return data.stream();
    } else if (data instanceof Uint8Array) {
        return new ReadableStream<Uint8Array>({
            pull(controller) {
                controller.enqueue(data as Uint8Array);
                controller.close();
            }
        });
    } else {
        const response = await fetch(data);
        const emptyStream = () => new ReadableStream<Uint8Array>({
            start(controller) {
                controller.close();
            }
        });

        return response.body || emptyStream();
    }
}