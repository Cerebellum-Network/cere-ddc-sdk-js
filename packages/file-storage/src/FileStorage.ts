import {ContentAddressableStorage, Link, Piece, PieceUri, Scheme} from "@cere-ddc-sdk/content-addressable-storage";
import {FileStorageConfig} from "./FileStorageConfig";
import * as webStream from "node:stream/web";
import {IndexedLink} from "./model/IndexedLink";

const encoder = new TextEncoder();

export class FileStorage {

    private readonly config: FileStorageConfig;
    private readonly caStorage: ContentAddressableStorage;

    constructor(scheme: Scheme, gatewayNodeUrl: string, config: FileStorageConfig = new FileStorageConfig()) {
        this.config = config;
        this.caStorage = new ContentAddressableStorage(scheme, gatewayNodeUrl);
    }

    async upload(bucketId: bigint, stream: webStream.ReadableStream): Promise<PieceUri> {
        const indexedLinks: Array<IndexedLink> = []
        await stream.pipeThrough(this.chunkedStream()).pipeTo(this.uploadStream(bucketId, indexedLinks));
        //const indexedLinks = await this.uploadPieces(bucketId, reader)

        if (indexedLinks.length === 0) {
            throw new Error("ReadableStream is empty");
        }

        const links = indexedLinks
            .sort((a, b) => a.position - b.position)
            .map(e => e.link);
        return await this.caStorage.store(bucketId, new Piece(encoder.encode("metadata"), [], links));
    }

    private uploadStream(bucketId: bigint, indexedLinks: Array<IndexedLink>): webStream.WritableStream {
        const storage = this.caStorage;
        const parallel = this.config.parallel

        const savePiece = (chunk: Uint8Array) => {
            return storage.store(bucketId, new Piece(chunk))
                .then(uri => {
                    indexedLinks.push(new IndexedLink(index++, new Link(uri.cid, BigInt(chunk.length))));
                })
        }

        let index = 0;
        const tasks = new Array<Promise<void>>()
        return new webStream.WritableStream<Uint8Array>({
                async write(chunk) {
                    if (tasks.length >= parallel) {
                        let i = 0;
                        const index = await Promise.race(tasks.map(e => e.then(() => i++)));
                        tasks.splice(index, 1);
                    }

                    tasks.push(savePiece(chunk));

                    return;
                },
                async close() {
                    await Promise.all(tasks)
                }
            },
            new webStream.CountQueuingStrategy({highWaterMark: this.config.parallel})
        );
    }

    read(bucketId: bigint, cid: string): webStream.ReadableStream {
        const storage = this.caStorage;
        let linksPromise = storage.read(bucketId, cid).then(value => value.links);
        let index = 0;
        return new webStream.ReadableStream<Uint8Array>({
            start(controller) {
                linksPromise.catch(controller.error);
            },
            async pull(controller) {
                const links = await linksPromise;
                if (index < links.length) {
                    const link = links[index];
                    const piece = await storage.read(bucketId, link.cid);
                    if (BigInt(piece.data.length) !== link.size) {
                        controller.error(new Error("Invalid piece size"));
                    }

                    controller.enqueue(piece.data);
                    index++;
                } else {
                    controller.close()
                }
            }
        }, new webStream.CountQueuingStrategy({highWaterMark: this.config.parallel}))
    }

    private chunkedStream(): webStream.TransformStream<Uint8Array, Uint8Array> {
        const chunkSize = this.config.chunkSizeInBytes;
        let prefix = new Uint8Array();
        return new webStream.TransformStream<Uint8Array, Uint8Array>({
                start() {
                },
                transform(chunk, controller) {
                    if (chunk.length === 0) {
                        return;
                    } else if (chunk.length + prefix.length < chunkSize) {
                        prefix = FileStorage.concat([prefix, chunk]);
                        return;
                    }

                    let offset = chunkSize - prefix.length;
                    controller.enqueue(FileStorage.concat([prefix, chunk.subarray(0, offset)]));
                    prefix = new Uint8Array();

                    while (offset < chunk.length) {
                        const newOffset = offset + chunkSize;
                        if (chunk.length < newOffset) {
                            prefix = chunk.subarray(offset, newOffset);
                        } else {
                            controller.enqueue(chunk.subarray(offset, newOffset));
                        }
                        offset = newOffset;
                    }
                },
                flush(controller) {
                    if (prefix.length !== 0) {
                        controller.enqueue(prefix)
                    }
                }
            }
        );
    }

    private static concat(arrays: Array<Uint8Array>): Uint8Array {
        const len = arrays.reduce((acc, curr) => acc + curr.length, 0);

        const output = new Uint8Array(len);
        let offset = 0;

        for (const arr of arrays) {
            output.set(arr, offset);
            offset += arr.length;
        }

        return output;
    }
}