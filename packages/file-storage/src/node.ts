export {FileStorageConfig, KB, MB} from "./core/FileStorageConfig"

import {PieceUri, Scheme} from "@cere-ddc-sdk/content-addressable-storage";
import {FileStorageConfig} from "./core/FileStorageConfig";
import {FileStorage as CoreFileStorage} from "./core/FileStorage"
import * as streamWeb from "stream/web"

export class FileStorage {

    private readonly fs: CoreFileStorage;

    constructor(scheme: Scheme, gatewayNodeUrl: string, config: FileStorageConfig = new FileStorageConfig()) {
        this.fs = new CoreFileStorage(scheme, gatewayNodeUrl, config)
    }

    async upload(bucketId: bigint, stream: streamWeb.ReadableStream<Uint8Array>): Promise<PieceUri> {
        const reader = stream.pipeThrough(new streamWeb.TransformStream(this.fs.chunkTransformer())).getReader();
        return await this.fs.uploadFromStreamReader(bucketId, reader)
    }

    read(bucketId: bigint, cid: string): streamWeb.ReadableStream<Uint8Array> {
        return new streamWeb.ReadableStream<Uint8Array>(this.fs.createReadUnderlyingSource(bucketId, cid),
            new streamWeb.CountQueuingStrategy({highWaterMark: this.fs.config.parallel}))
    }
}