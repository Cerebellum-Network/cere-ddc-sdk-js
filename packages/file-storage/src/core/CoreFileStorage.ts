import {
    ContentAddressableStorage,
    Link,
    Piece,
    PieceUri,
    SchemeInterface
} from "@cere-ddc-sdk/content-addressable-storage";
import {FileStorageConfig} from "./FileStorageConfig";
import {IndexedLink} from "./model/IndexedLink";
import {ReadableStreamDefaultReader, Transformer, UnderlyingSource} from "./stream"

const encoder = new TextEncoder();

export class CoreFileStorage {

    readonly config: FileStorageConfig;
    readonly caStorage: ContentAddressableStorage;

    constructor(scheme: SchemeInterface, cdnNodeUrl: string, config: FileStorageConfig = new FileStorageConfig()) {
        this.config = config;
        this.caStorage = new ContentAddressableStorage(scheme, cdnNodeUrl);
    }

    async uploadFromStreamReader(bucketId: bigint, reader: ReadableStreamDefaultReader<Uint8Array>): Promise<PieceUri> {
        const indexedLinks = await this.storeChunks(bucketId, reader);

        if (indexedLinks.length === 0) {
            throw new Error("ReadableStream is empty");
        }

        const links = indexedLinks
            .sort((a, b) => a.position - b.position)
            .map(e => e.link);
        return await this.caStorage.store(bucketId, new Piece(encoder.encode("metadata"), [], links));
    }

    createReadUnderlyingSource(bucketId: bigint, cid: string): UnderlyingSource<Uint8Array> {
        let linksPromise = this.caStorage.read(bucketId, cid).then(value => value.links);

        let index = 0;
        const runReadPieceTask = () => new Promise<Uint8Array>(async (resolve, reject) => {
            const current = index++;
            const link = (await linksPromise)[current];

            this.caStorage.read(bucketId, link.cid).then(piece => {
                if (BigInt(piece.data.length) !== link.size) {
                    reject(new Error("Invalid piece size"));
                }

                resolve(piece.data);
            })
        });

        const tasksPromise = linksPromise
            .then(e => Array(Math.min(e.length, this.config.parallel)).fill(0).map(() => runReadPieceTask()));

        return {
            start(controller) {
                linksPromise.catch(controller.error);
            },
            async pull(controller) {
                const tasks = await tasksPromise;
                controller.enqueue(await tasks.shift());
                if (index < (await linksPromise).length) {
                    tasks.push(runReadPieceTask());
                }

                if (tasks.length === 0) {
                    controller.close();
                }
            }
        }
    }

    chunkTransformer(): Transformer<Uint8Array, Uint8Array> {
        const chunkSize = this.config.chunkSizeInBytes;
        let prefix = new Uint8Array();
        return {
            start() {
            },
            transform(chunk, controller) {
                if (chunk.length === 0) {
                    return;
                } else if (chunk.length + prefix.length < chunkSize) {
                    prefix = CoreFileStorage.concat([prefix, chunk]);
                    return;
                }

                let offset = chunkSize - prefix.length;
                controller.enqueue(CoreFileStorage.concat([prefix, chunk.subarray(0, offset)]));
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
                    controller.enqueue(prefix);
                }
            }
        }
    }

    private async storeChunks(bucketId: bigint, reader: ReadableStreamDefaultReader<Uint8Array>): Promise<Array<IndexedLink>> {
        const indexedLinks: Array<IndexedLink> = [];
        const tasks = new Array<Promise<void>>();
        let index = 0;
        for (let i = 0; i < this.config.parallel; i++) {
            tasks.push(new Promise(async (resolve) => {
                let result;
                while (!(result = await reader.read()).done) {
                    const current = index;
                    index++;
                    const pieceUri = await this.caStorage.store(bucketId, new Piece(result.value));

                    indexedLinks.push(new IndexedLink(current, new Link(pieceUri.cid, BigInt(result.value.length))));
                }
                resolve();
            }));
        }

        await Promise.all(tasks);

        return indexedLinks;
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