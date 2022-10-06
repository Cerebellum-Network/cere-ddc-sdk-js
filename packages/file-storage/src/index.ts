export {FileStorageConfig, KB, MB} from './core/FileStorageConfig';

import {PathLike} from 'fs';
import {
    ContentAddressableStorage,
    EncryptionOptions,
    Link,
    PieceUri,
    StorageOptions,
    Tag,
} from '@cere-ddc-sdk/content-addressable-storage';
import {FileStorageConfig} from './core/FileStorageConfig';
import {CoreFileStorage} from './core/CoreFileStorage';
import {FileStorage as FileStorageInterface} from './type';
import * as streamWeb from 'stream/web';
import {Readable} from 'node:stream';
import {open} from 'node:fs/promises';

type Data = streamWeb.ReadableStream<Uint8Array> | Readable | PathLike | Uint8Array;

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
        storageOptions: StorageOptions,
        config: FileStorageConfig = new FileStorageConfig(),
        secretPhrase?: string,
    ): Promise<FileStorage> {
        return new FileStorage(await ContentAddressableStorage.build(storageOptions, secretPhrase), config);
    }

    async upload(bucketId: bigint, data: Data, tags: Array<Tag> = [], session?: Uint8Array): Promise<PieceUri> {
        const stream = await transformDataToStream(data);
        const reader = stream.pipeThrough(new streamWeb.TransformStream(this.fs.chunkTransformer())).getReader();
        return await this.fs.uploadFromStreamReader(bucketId, reader, tags, undefined, session);
    }

    read(bucketId: bigint, cid: string, session: Uint8Array): streamWeb.ReadableStream<Uint8Array> {
        return new streamWeb.ReadableStream<Uint8Array>(
            this.fs.createReadUnderlyingSource(bucketId, session, cid),
            new streamWeb.CountQueuingStrategy({highWaterMark: this.fs.config.parallel}),
        );
    }

    readDecrypted(bucketId: bigint, cid: string, dek: Uint8Array, session: Uint8Array): ReadableStream<Uint8Array> {
        return new streamWeb.ReadableStream<Uint8Array>(
            this.fs.createReadUnderlyingSource(bucketId, session, cid, dek),
            new streamWeb.CountQueuingStrategy({highWaterMark: this.fs.config.parallel}),
        );
    }

    async uploadEncrypted(
        bucketId: bigint,
        data: Data,
        tags: Array<Tag> = [],
        encryptionOptions: EncryptionOptions,
        session?: Uint8Array,
    ): Promise<PieceUri> {
        const stream = await transformDataToStream(data);
        const reader = stream.pipeThrough(new streamWeb.TransformStream(this.fs.chunkTransformer())).getReader();
        return await this.fs.uploadFromStreamReader(bucketId, reader, tags, encryptionOptions, session);
    }

    readLinks(bucketId: bigint, links: Array<Link>, session?: Uint8Array): ReadableStream<Uint8Array> {
        return new streamWeb.ReadableStream<Uint8Array>(
            this.fs.createReadUnderlyingSource(bucketId, session, links),
            new streamWeb.CountQueuingStrategy({highWaterMark: this.fs.config.parallel}),
        );
    }

    readDecryptedLinks(
        bucketId: bigint,
        links: Array<Link>,
        dek: Uint8Array,
        session?: Uint8Array,
    ): ReadableStream<Uint8Array> {
        return new streamWeb.ReadableStream<Uint8Array>(
            this.fs.createReadUnderlyingSource(bucketId, session, links, dek),
            new streamWeb.CountQueuingStrategy({highWaterMark: this.fs.config.parallel}),
        );
    }
}

async function transformDataToStream(data: Data): Promise<streamWeb.ReadableStream<Uint8Array>> {
    if (data instanceof streamWeb.ReadableStream) {
        return data;
    } else if (data instanceof Readable) {
        return readableToStream(data);
    } else if (data instanceof Uint8Array) {
        return new streamWeb.ReadableStream<Uint8Array>({
            pull(controller) {
                controller.enqueue(data);
                controller.close();
            },
        });
    } else {
        return await pathToStream(data as PathLike);
    }
}

function readableToStream(readable: Readable): streamWeb.ReadableStream<Uint8Array> {
    async function* generator() {
        for await (const chunk of readable) {
            yield chunk;
        }
    }

    const dataGenerator = generator();
    return new streamWeb.ReadableStream({
        async pull(controller) {
            const data = await dataGenerator.next();
            if (!data.done) {
                controller.enqueue(data.value);
            } else {
                controller.close();
            }
        },
    });
}

async function pathToStream(filePath: PathLike): Promise<streamWeb.ReadableStream<Uint8Array>> {
    const file = await open(filePath, 'r');

    return new streamWeb.ReadableStream({
        async cancel() {
            await file.close();
        },
        async pull(controller) {
            const {bytesRead, buffer} = await file.read();

            if (bytesRead === 0) {
                await file.close();
                controller.close();
            }

            controller.enqueue(buffer.slice(buffer.byteOffset, bytesRead));
        },
    });
}
