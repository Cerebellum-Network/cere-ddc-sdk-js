export {FileStorageConfig, KB, MB} from "./core/FileStorageConfig";

import {PieceUri, SchemeInterface} from "@cere-ddc-sdk/content-addressable-storage";
import {FileStorageConfig} from "./core/FileStorageConfig";
import {CoreFileStorage} from "./core/FileStorage";
import {FileStorageInterface} from "./core/FileStorage.interface";

export class FileStorage implements FileStorageInterface {

    private readonly fs: CoreFileStorage;

    constructor(scheme: SchemeInterface, gatewayNodeUrl: string, config: FileStorageConfig = new FileStorageConfig()) {
        this.fs = new CoreFileStorage(scheme, gatewayNodeUrl, config);
    }

    async upload(bucketId: bigint, stream: ReadableStream<Uint8Array>): Promise<PieceUri> {
        const reader = stream.pipeThrough(new TransformStream(this.fs.chunkTransformer())).getReader();
        return await this.fs.uploadFromStreamReader(bucketId, reader);
    }

    read(bucketId: bigint, cid: string): ReadableStream<Uint8Array> {
        return new ReadableStream<Uint8Array>(this.fs.createReadUnderlyingSource(bucketId, cid),
            new CountQueuingStrategy({highWaterMark: this.fs.config.parallel}));
    }
}