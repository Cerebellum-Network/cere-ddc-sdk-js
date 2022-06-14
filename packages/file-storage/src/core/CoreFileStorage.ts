import {ContentAddressableStorage, Link, Piece, PieceUri, Tag, EncryptionOptions} from "@cere-ddc-sdk/content-addressable-storage";
import {CidBuilder, CipherInterface, SchemeInterface} from "@cere-ddc-sdk/core";
import {FileStorageConfig} from "./FileStorageConfig";
import {IndexedLink} from "./model/IndexedLink";

export class CoreFileStorage {

    readonly config: FileStorageConfig;
    readonly caStorage: ContentAddressableStorage;

    constructor(scheme: SchemeInterface, cdnNodeUrl: string, config: FileStorageConfig = new FileStorageConfig(), cipher?: CipherInterface, cidBuilder?: CidBuilder) {
        this.config = config;
        this.caStorage = new ContentAddressableStorage(scheme, cdnNodeUrl, cipher, cidBuilder);
    }

    async uploadFromStreamReader(bucketId: bigint, reader: ReadableStreamDefaultReader<Uint8Array>, tags: Array<Tag> = [], encryptionOptions?: EncryptionOptions): Promise<PieceUri> {
        const indexedLinks = await this.storeChunks(bucketId, reader, encryptionOptions);

        if (indexedLinks.length === 0) {
            throw new Error("ReadableStream is empty");
        }

        const links = indexedLinks
            .sort((a, b) => a.position - b.position)
            .map(e => e.link);

        const piece = new Piece(new Uint8Array(), tags, links);
        if (encryptionOptions) {
            return await this.caStorage.storeEncrypted(bucketId, piece, encryptionOptions);
        } else {
            return await this.caStorage.store(bucketId, piece);
        }
    }

    createReadUnderlyingSource(bucketId: bigint, address?: string | Array<Link>, dek?: Uint8Array): UnderlyingSource<Uint8Array> {
        let linksPromise = address instanceof Array<Link> ? Promise.resolve(address) : this.caStorage.read(bucketId, address as string).then(value => value.links);

        let index = 0;
        const runReadPieceTask = () => new Promise<Uint8Array>(async (resolve, reject) => {
            const current = index++;
            const link = (await linksPromise)[current];

            const promisePiece: Promise<Piece> = dek ? this.caStorage.readDecrypted(bucketId, link.cid, dek) : this.caStorage.read(bucketId, link.cid)
            promisePiece.then(piece => resolve(piece.data));
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

    private async storeChunks(bucketId: bigint, reader: ReadableStreamDefaultReader<Uint8Array>, encryptionOptions?: EncryptionOptions): Promise<Array<IndexedLink>> {
        const indexedLinks: Array<IndexedLink> = [];
        const tasks = new Array<Promise<void>>();
        let index = 0;
        for (let i = 0; i < this.config.parallel; i++) {
            tasks.push(new Promise(async (resolve) => {
                let result;
                while (!(result = await reader.read()).done) {
                    const current = index++;

                    const piece = new Piece(result.value)
                    piece.tags.push(new Tag("multipart", "true"));
                    const pieceUri = encryptionOptions ? await this.caStorage.storeEncrypted(bucketId, piece, encryptionOptions)
                        : await this.caStorage.store(bucketId, piece)

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