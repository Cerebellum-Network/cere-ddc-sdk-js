import * as fs from "fs";
import {PathLike} from "fs";
import {ContentAddressableStorage, Link, Piece, PieceUri, Scheme} from "@cere-ddc-sdk/content-addressable-storage/src";
import {FileStorageConfig} from "./FileStorageConfig";
import {IndexedLink} from "./model/IndexedLink";
import {Readable, Transform, TransformCallback} from "stream";
import {ChunkData} from "./model/ChunkData";

let ParallelTransform = require('parallel-transform');

export class FileStorage {

    private readonly config: FileStorageConfig;
    private readonly caStorage: ContentAddressableStorage;

    constructor(scheme: Scheme, gatewayNodeUrl: string, config: FileStorageConfig = new FileStorageConfig()) {
        this.config = config;
        this.caStorage = new ContentAddressableStorage(scheme, gatewayNodeUrl);
    }

    async upload(bucketId: bigint, file: PathLike): Promise<PieceUri> {
        const stream = fs.createReadStream(file)
            .pipe(this.indexedDataStream())
            .pipe(this.uploadStream(bucketId))
            .on("error", (err) => {
                throw  err
            });

        const indexedLinks = await this.collect<IndexedLink>(stream)

        const links = indexedLinks
            .sort((prev, next) => prev.index - next.index)
            .map(e => e.link);

        return this.caStorage.store(bucketId, new Piece(new TextEncoder().encode("metadata"), [], links))
    }

    private async collect<T>(stream: Readable): Promise<Array<T>> {
        stream = this.iterableStream(stream)
        const result = new Array<T>()

        for await (const value of stream) {
            result.push(value)
        }

        return result
    }

    private iterableStream(stream: Readable): Readable {
        return stream.pipe(new Transform(
                {
                    objectMode: stream.readableObjectMode,
                    transform(data: any, encoding: BufferEncoding, callback: TransformCallback) {
                        callback(null, data);
                    }
                }
            )
        )
    }

    private indexedDataStream(): Transform {
        let position = 0;

        return new Transform(
            {
                readableObjectMode: false,
                writableObjectMode: true,
                transform(data: Uint8Array, encoding: BufferEncoding, callback: TransformCallback) {
                    const chunkData = new ChunkData(position, data);
                    position += data.length;
                    callback(null, chunkData);
                }
            }
        );
    }

    private uploadStream(bucketId: bigint): Transform {
        return new ParallelTransform(this.config.parallel,
            {objectMode: true, ordered: false},
            (chunkData: ChunkData, callback: TransformCallback) => {
                this.caStorage.store(bucketId, new Piece(chunkData.data))
                    .then(pieceUri => {
                        const link = new Link(pieceUri.cid, BigInt(chunkData.data.length));
                        const indexedLink = new IndexedLink(chunkData.position, link);
                        callback(null, indexedLink);
                    })
                    .catch(callback);
            }
        );
    }
}