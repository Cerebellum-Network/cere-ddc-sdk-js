import {ContentAddressableStorage, Link, Piece, PieceUri, Scheme} from "@cere-ddc-sdk/content-addressable-storage";
import {FileStorageConfig} from "./FileStorageConfig";
import * as webStream from "node:stream/web";

const encoder = new TextEncoder();

export class FileStorage {

    private readonly config: FileStorageConfig;
    private readonly caStorage: ContentAddressableStorage;

    constructor(scheme: Scheme, gatewayNodeUrl: string, config: FileStorageConfig = new FileStorageConfig()) {
        this.config = config;
        this.caStorage = new ContentAddressableStorage(scheme, gatewayNodeUrl);
    }

    async upload(bucketId: bigint, stream: webStream.ReadableStream): Promise<PieceUri> {
        const reader = stream.pipeThrough(this.chunkedStream()).getReader();

        let result;
        const links = new Array<Link>();
        while (!(result = await reader.read()).done) {
            const chunk: Uint8Array = result.value;
            const pieceUri = await this.caStorage.store(bucketId, new Piece(chunk));
            links.push(new Link(pieceUri.cid, BigInt(chunk.length)));
        }

        return await this.caStorage.store(bucketId, new Piece(encoder.encode("metadata"), [], links));
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
        }, new webStream.CountQueuingStrategy({ highWaterMark: this.config.chunkSizeInBytes }))
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