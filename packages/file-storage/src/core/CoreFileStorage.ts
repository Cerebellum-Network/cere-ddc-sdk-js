import type {UnderlyingSource} from 'stream/web';
import {
    ContentAddressableStorage,
    Link,
    Piece,
    PieceUri,
    Tag,
    EncryptionOptions,
    StoreOptions,
    ReadOptions,
} from '@cere-ddc-sdk/content-addressable-storage';

import {FileStorageConfig} from './FileStorageConfig';
import {IndexedLink} from './model/IndexedLink';

const multipartTag = 'multipart';

export class CoreFileStorage {
    readonly config: FileStorageConfig;
    readonly caStorage: ContentAddressableStorage;

    constructor(caStorage: ContentAddressableStorage, config: FileStorageConfig) {
        this.config = config;
        this.caStorage = caStorage;
    }

    async createHeadPiece(
        bucketId: bigint,
        reader: ReadableStreamDefaultReader<Uint8Array>,
        tags: Array<Tag> = [],
        encryptionOptions?: EncryptionOptions,
    ) {
        const headPiece = new Piece(new Uint8Array(), tags, []);

        while (true) {
            const {done, value} = await reader.read();

            if (done) {
                break;
            }

            const piece = new Piece(value, [new Tag(multipartTag, 'true')]);

            piece.cid = await this.caStorage.buildCid(bucketId, piece, encryptionOptions);
            headPiece.links.push(new Link(piece.cid!, BigInt(value.byteLength)));
        }

        headPiece.cid = await this.caStorage.buildCid(bucketId, headPiece, encryptionOptions);

        return headPiece;
    }

    async uploadFromStreamReader(
        bucketId: bigint,
        reader: ReadableStreamDefaultReader<Uint8Array>,
        tags: Array<Tag> = [],
        encryptionOptions?: EncryptionOptions,
        storeOptions: StoreOptions = {},
    ): Promise<PieceUri> {
        const indexedLinks = await this.storeChunks(bucketId, reader, encryptionOptions, storeOptions);

        if (indexedLinks.length === 0) {
            throw new Error('Upload data is empty');
        }

        const links = indexedLinks.sort((a, b) => a.position - b.position).map((e) => e.link);

        const piece = new Piece(new Uint8Array(), tags, links);
        if (encryptionOptions) {
            return await this.caStorage.storeEncrypted(bucketId, piece, encryptionOptions, storeOptions);
        } else {
            return await this.caStorage.store(bucketId, piece, storeOptions);
        }
    }

    createReadUnderlyingSource(
        bucketId: bigint,
        address?: string | Array<Link>,
        dek?: Uint8Array,
        readOptions: ReadOptions = {},
    ): UnderlyingSource<Uint8Array> {
        let linksPromise =
            address instanceof Array
                ? Promise.resolve(address)
                : this.caStorage.read(bucketId, address as string, readOptions).then((value) => value.links);

        let index = 0;
        const runReadPieceTask = async () => {
            const current = index++;
            const link = (await linksPromise)[current];

            const piece = dek
                ? await this.caStorage.readDecrypted(bucketId, link.cid, dek, readOptions)
                : await this.caStorage.read(bucketId, link.cid, readOptions);

            return piece.data;
        };

        const tasksPromise = linksPromise.then((e) =>
            Array(Math.min(e.length, this.config.parallel)).fill(0).map(runReadPieceTask),
        );

        return {
            start(controller) {
                linksPromise.catch(controller.error);
            },
            async pull(controller) {
                const tasks = await tasksPromise;
                const currentTask = tasks.shift();
                const taskResult = currentTask ? await currentTask : new Uint8Array();
                controller.enqueue(taskResult);
                if (index < (await linksPromise).length) {
                    tasks.push(runReadPieceTask());
                }

                if (tasks.length === 0) {
                    controller.close();
                }
            },
        };
    }

    chunkTransformer(): Transformer<Uint8Array, Uint8Array> {
        const chunkSize = this.config.pieceSizeInBytes;
        let prefix = new Uint8Array();
        return {
            start() {},
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
            },
        };
    }

    private async storeChunks(
        bucketId: bigint,
        reader: ReadableStreamDefaultReader<Uint8Array>,
        encryptionOptions?: EncryptionOptions,
        storeOptions: StoreOptions = {},
    ): Promise<Array<IndexedLink>> {
        const indexedLinks: Array<IndexedLink> = [];
        const tasks = new Array<Promise<void>>();
        let index = 0;
        for (let i = 0; i < this.config.parallel; i++) {
            const task = async () => {
                let result;
                while (!(result = await reader.read()).done) {
                    const current = index++;

                    const piece = new Piece(result.value);
                    piece.tags.push(new Tag(multipartTag, 'true'));
                    const pieceUri = encryptionOptions
                        ? await this.caStorage.storeEncrypted(bucketId, piece, encryptionOptions, storeOptions)
                        : await this.caStorage.store(bucketId, piece, storeOptions);

                    indexedLinks.push(new IndexedLink(current, new Link(pieceUri.cid, BigInt(result.value.length))));
                }
            };

            tasks.push(task());
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
