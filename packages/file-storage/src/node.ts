import {EncryptionOptions} from "@cere-ddc-sdk/core/src/crypto/encryption/EncryptionOptions";

export {FileStorageConfig, KB, MB} from "./core/FileStorageConfig";

import {PathLike} from "fs";
import {ContentAddressableStorage, Link, PieceUri, Tag} from "@cere-ddc-sdk/content-addressable-storage";
import {CidBuilder, CipherInterface, SchemeInterface} from "@cere-ddc-sdk/core";
import {FileStorageConfig} from "./core/FileStorageConfig";
import {CoreFileStorage} from "./core/CoreFileStorage";
import {FileStorage as FileStorageInterface} from "./type";
import * as streamWeb from "stream/web";
import {Readable} from "node:stream";
import {open} from 'node:fs/promises';

type Data = streamWeb.ReadableStream<Uint8Array> | Readable | PathLike | Uint8Array

export class FileStorage implements FileStorageInterface {

    readonly config: FileStorageConfig;
    readonly caStorage: ContentAddressableStorage;

    private readonly fs: CoreFileStorage;

    constructor(scheme: SchemeInterface, gatewayNodeUrl: string, config?: FileStorageConfig, cipher?: CipherInterface, cidBuilder?: CidBuilder) {
        this.fs = new CoreFileStorage(scheme, gatewayNodeUrl, config, cipher, cidBuilder);
        this.caStorage = this.fs.caStorage;
        this.config = this.fs.config;
    }

    async upload(bucketId: bigint, data: Data, tags: Array<Tag> = []): Promise<PieceUri> {
        const stream = await transformDataToStream(data);
        const reader = stream.pipeThrough(new streamWeb.TransformStream(this.fs.chunkTransformer())).getReader();
        return await this.fs.uploadFromStreamReader(bucketId, reader, tags);
    }

    read(bucketId: bigint, cid: string): streamWeb.ReadableStream<Uint8Array> {
        return new streamWeb.ReadableStream<Uint8Array>(this.fs.createReadUnderlyingSource(bucketId, cid),
            new streamWeb.CountQueuingStrategy({highWaterMark: this.fs.config.parallel}));
    }

    readDecrypted(bucketId: bigint, cid: string, dek: string): ReadableStream<Uint8Array> {
        return new streamWeb.ReadableStream<Uint8Array>(this.fs.createReadUnderlyingSource(bucketId, cid, dek),
            new streamWeb.CountQueuingStrategy({highWaterMark: this.fs.config.parallel}));
    }

    async uploadEncrypted(bucketId: bigint, data: Data, tags: Array<Tag> = [], encryptionOptions: EncryptionOptions): Promise<PieceUri> {
        const stream = await transformDataToStream(data);
        const reader = stream.pipeThrough(new streamWeb.TransformStream(this.fs.chunkTransformer())).getReader();
        return await this.fs.uploadFromStreamReader(bucketId, reader, tags, encryptionOptions);
    }

    readLinks(bucketId: bigint, links: Array<Link>): ReadableStream<Uint8Array> {
        return new streamWeb.ReadableStream<Uint8Array>(this.fs.createReadUnderlyingSource(bucketId, links),
            new streamWeb.CountQueuingStrategy({highWaterMark: this.fs.config.parallel}));
    }

    readDecryptedLinks(bucketId: bigint, links: Array<Link>, dek: string): ReadableStream<Uint8Array> {
        return new streamWeb.ReadableStream<Uint8Array>(this.fs.createReadUnderlyingSource(bucketId, links, dek),
            new streamWeb.CountQueuingStrategy({highWaterMark: this.fs.config.parallel}));
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
            }
        });
    } else {
        return await pathToStream(data as PathLike);
    }
}

function readableToStream(readable: Readable): streamWeb.ReadableStream<Uint8Array> {
    async function* generator() {
        for await (const chunk of readable) {
            yield(chunk);
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
        }
    });
}

async function pathToStream(filePath: PathLike): Promise<streamWeb.ReadableStream<Uint8Array>> {
    const file = await open(filePath, "r");

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

            controller.enqueue(buffer.slice(buffer.byteOffset, bytesRead))
        }
    });
}