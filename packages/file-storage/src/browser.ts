export {FileStorageConfig, KB, MB} from "./core/FileStorageConfig";

import {PieceUri} from "@cere-ddc-sdk/content-addressable-storage";
import {SchemeInterface} from "@cere-ddc-sdk/core";
import {FileStorageConfig} from "./core/FileStorageConfig";
import {CoreFileStorage} from "./core/CoreFileStorage";
import {FileStorage as FileStorageInterface} from "./type";

type Data = ReadableStream<Uint8Array> | Blob | string | Uint8Array

export class FileStorage implements FileStorageInterface {

    private readonly fs: CoreFileStorage;

    constructor(scheme: SchemeInterface, gatewayNodeUrl: string, config: FileStorageConfig = new FileStorageConfig()) {
        this.fs = new CoreFileStorage(scheme, gatewayNodeUrl, config);
    }

    async upload(bucketId: bigint, data: Data): Promise<PieceUri> {
        const stream = await transformDataToStream(data);
        const reader = stream.pipeThrough(new TransformStream(this.fs.chunkTransformer())).getReader();
        return await this.fs.uploadFromStreamReader(bucketId, reader);
    }

    read(bucketId: bigint, cid: string): ReadableStream<Uint8Array> {
        return new ReadableStream<Uint8Array>(this.fs.createReadUnderlyingSource(bucketId, cid),
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