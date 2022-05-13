import {PathLike} from "fs";

export {FileStorageConfig, KB, MB} from "./core/FileStorageConfig";

import {PieceUri} from "@cere-ddc-sdk/content-addressable-storage";
import {SchemeInterface} from "@cere-ddc-sdk/core";
import {FileStorageConfig} from "./core/FileStorageConfig";
import {CoreFileStorage} from "./core/CoreFileStorage";
import {FileStorage as FileStorageInterface} from "./type";
import * as streamWeb from "stream/web";
import {Readable} from "node:stream";

type Data = streamWeb.ReadableStream<Uint8Array> | Readable | PathLike | Uint8Array

export class FileStorage implements FileStorageInterface {

    private readonly fs: CoreFileStorage;

    constructor(scheme: SchemeInterface, gatewayNodeUrl: string, config: FileStorageConfig = new FileStorageConfig()) {
        this.fs = new CoreFileStorage(scheme, gatewayNodeUrl, config);
    }

    async upload(bucketId: bigint, data: Data): Promise<PieceUri> {
        const stream = this.transformDataToStream(data);
        const reader = stream.pipeThrough(new streamWeb.TransformStream(this.fs.chunkTransformer())).getReader();
        return await this.fs.uploadFromStreamReader(bucketId, reader);
    }

    read(bucketId: bigint, cid: string): streamWeb.ReadableStream<Uint8Array> {
        return new streamWeb.ReadableStream<Uint8Array>(this.fs.createReadUnderlyingSource(bucketId, cid),
            new streamWeb.CountQueuingStrategy({highWaterMark: this.fs.config.parallel}));
    }

    private transformDataToStream(data: Data): streamWeb.ReadableStream<Uint8Array> {
        if (data instanceof streamWeb.ReadableStream) {
            return data;
        }

        return undefined!;
    }
}