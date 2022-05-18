export {FileStorageConfig, KB, MB} from "./core/FileStorageConfig";

import {PathLike} from "fs";
import {PieceUri} from "@cere-ddc-sdk/content-addressable-storage";
import {SchemeInterface} from "@cere-ddc-sdk/core";
import {FileStorageConfig} from "./core/FileStorageConfig";
import {CoreFileStorage} from "./core/CoreFileStorage";
import {FileStorage as FileStorageInterface} from "./type";
import * as streamWeb from "stream/web";
import {Readable} from "node:stream";
import {open} from 'node:fs/promises';

type Data = streamWeb.ReadableStream<Uint8Array> | Readable | PathLike | Uint8Array

export class FileStorage implements FileStorageInterface {

    private readonly fs: CoreFileStorage;

    constructor(scheme: SchemeInterface, gatewayNodeUrl: string, config: FileStorageConfig = new FileStorageConfig()) {
        this.fs = new CoreFileStorage(scheme, gatewayNodeUrl, config);
    }

    async upload(bucketId: bigint, data: Data): Promise<PieceUri> {
        const stream = await transformDataToStream(data);
        const reader = stream.pipeThrough(new streamWeb.TransformStream(this.fs.chunkTransformer())).getReader();
        return await this.fs.uploadFromStreamReader(bucketId, reader);
    }

    read(bucketId: bigint, cid: string): streamWeb.ReadableStream<Uint8Array> {
        return new streamWeb.ReadableStream<Uint8Array>(this.fs.createReadUnderlyingSource(bucketId, cid),
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