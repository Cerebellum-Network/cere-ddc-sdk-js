import * as fs from "fs";
import {PathLike} from "fs";
import {ContentAddressableStorage, Link, Piece, PieceUri, Scheme} from "@cere-ddc-sdk/content-addressable-storage";
import {FileStorageConfig} from "./FileStorageConfig";
import {IndexedLink} from "./model/IndexedLink";
import * as stream from "stream";
import {Readable, Transform, TransformCallback} from "stream";
import {ChunkData} from "./model/ChunkData";

const ParallelTransform = require('parallel-transform');
const encode = new TextEncoder().encode;

export class FileStorage {

    private readonly config: FileStorageConfig;
    private readonly caStorage: ContentAddressableStorage;

    constructor(scheme: Scheme, gatewayNodeUrl: string, config: FileStorageConfig = new FileStorageConfig()) {
        this.config = config;
        this.caStorage = new ContentAddressableStorage(scheme, gatewayNodeUrl);
    }

    async upload(bucketId: bigint, file: PathLike): Promise<PieceUri> {
        const stream = fs.createReadStream(file, {highWaterMark: this.config.chunkSizeInBytes})
            .pipe(this.indexedDataStream())
            .pipe(this.uploadStream(bucketId))
            .on("error", (err) => {
                throw err
            });

        const indexedLinks = await this.collect<IndexedLink>(stream);

        const links = indexedLinks
            .sort((prev, next) => prev.position - next.position)
            .map(e => e.link);

        return this.caStorage.store(bucketId, new Piece(encode("metadata"), [], links));
    }

    async read(bucketId: bigint, cid: string): Promise<Uint8Array> {
        const stream = await this.readToStream(bucketId, cid);
        const chunks = await this.collect<ChunkData>(stream);

        let size = 0;
        chunks.forEach(e => size += e.position);

        let result = new Uint8Array(size);
        chunks.forEach(e => result.set(e.data, e.position))

        return result
    }

    async download(bucketId: bigint, cid: string, file: PathLike) {
        const stream = await this.readToStream(bucketId, cid)

        fs.open(file, fs.constants.O_WRONLY | fs.constants.O_CREAT, async (err, fd) => {
            const iterableStream = stream.pipe(this.iterableStream());
            for await (const chunk of iterableStream) {
                const buffer = new Buffer(chunk.data);
                fs.writeSync(fd, buffer, 0, buffer.length, chunk.position);
            }
        });
    }

    private async collect<T>(stream: Readable): Promise<Array<T>> {
        stream = stream.pipe(this.iterableStream());
        const result = new Array<T>();

        for await (const value of stream) {
            result.push(value);
        }

        return result;
    }

    private iterableStream(): Transform {
        return new Transform(
            {
                objectMode: true,
                transform(data: any, encoding: BufferEncoding, callback: TransformCallback) {
                    callback(null, data);
                }
            }
        );
    }

    private async readToStream(bucketId: bigint, cid: string): Promise<Readable> {
        const headPiece = await this.caStorage.read(bucketId, cid)

        return stream.Readable.from(headPiece.links)
            .pipe(this.indexedLinkStream())
            .pipe(this.readStream(bucketId))
            .on("error", (err) => {
                throw err
            });
    }

    private indexedLinkStream(): Transform {
        let position = 0;

        return new Transform(
            {
                objectMode: true,
                transform(link: Link, encoding: BufferEncoding, callback: TransformCallback) {
                    const indexedLink = new IndexedLink(position, link);
                    position += Number(link.size);
                    callback(null, indexedLink);
                }
            }
        );
    }

    private readStream(bucketId: bigint): Transform {
        return new ParallelTransform(this.config.parallel,
            {objectMode: true, ordered: false},
            (indexedLink: IndexedLink, callback: TransformCallback) => {
                this.caStorage.read(bucketId, indexedLink.link.cid)
                    .then(piece => {
                        if (indexedLink.link.size !== BigInt(piece.data.length)) {
                            callback(new Error("Invalid piece size"))
                        }

                        const chunkData = new ChunkData(indexedLink.position, piece.data);
                        callback(null, chunkData);
                    })
                    .catch(callback);
            }
        );
    }

    private indexedDataStream(): Transform {
        let position = 0;

        return new Transform(
            {
                readableObjectMode: true,
                writableObjectMode: false,
                transform(data: Buffer, encoding: BufferEncoding, callback: TransformCallback) {
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
                console.log(JSON.stringify(chunkData.data))
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