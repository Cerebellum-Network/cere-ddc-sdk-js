import {EncryptionOptions} from "@cere-ddc-sdk/core/src/crypto/encryption/EncryptionOptions";

export {FileStorageConfig, KB, MB} from "./core/FileStorageConfig";

import {ContentAddressableStorage, Link, PieceUri} from "@cere-ddc-sdk/content-addressable-storage";
import {CidBuilder, CipherInterface, SchemeInterface} from "@cere-ddc-sdk/core";
import {FileStorageConfig} from "./core/FileStorageConfig";
import {CoreFileStorage} from "./core/CoreFileStorage";
import {FileStorage as FileStorageInterface} from "./type";

type Data = ReadableStream<Uint8Array> | Blob | string | Uint8Array

export class FileStorage implements FileStorageInterface {

    readonly config: FileStorageConfig;
    readonly caStorage: ContentAddressableStorage;

    private readonly fs: CoreFileStorage;

    constructor(scheme: SchemeInterface, gatewayNodeUrl: string, config?: FileStorageConfig, cipher?: CipherInterface, cidBuilder?: CidBuilder) {
        this.fs = new CoreFileStorage(scheme, gatewayNodeUrl, config, cipher, cidBuilder);
        this.caStorage = this.fs.caStorage;
        this.config = this.fs.config;
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

    readDecrypted(bucketId: bigint, cid: string, dek: string): ReadableStream<Uint8Array> {
        return new ReadableStream<Uint8Array>(this.fs.createReadUnderlyingSource(bucketId, cid, dek),
            new CountQueuingStrategy({highWaterMark: this.fs.config.parallel}));
    }

    async uploadEncrypted(bucketId: bigint, data: Data, encryptionOptions: EncryptionOptions): Promise<PieceUri> {
        const stream = await transformDataToStream(data);
        const reader = stream.pipeThrough(new TransformStream(this.fs.chunkTransformer())).getReader();
        return await this.fs.uploadFromStreamReader(bucketId, reader, encryptionOptions);
    }

    readLinks(bucketId: bigint, links: Array<Link>): ReadableStream<Uint8Array> {
        return new ReadableStream<Uint8Array>(this.fs.createReadUnderlyingSource(bucketId, links),
            new CountQueuingStrategy({highWaterMark: this.fs.config.parallel}));
    }

    readDecryptedLinks(bucketId: bigint, links: Array<Link>, dek: string): ReadableStream<Uint8Array> {
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