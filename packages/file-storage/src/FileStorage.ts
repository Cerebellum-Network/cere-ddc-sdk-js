import {StorageNode, MAX_PIECE_SIZE} from '@cere-ddc-sdk/ddc';

import {File} from './File';
import {FilePart} from './FilePart';

export type FileStorageConfig = {};
export type FileReadOptions = {};
export type FileStoreOptions = {};

export class FileStorage {
    constructor(private storageNode: StorageNode) {}

    async store(bucketId: bigint, file: File, options?: FileStoreOptions) {
        const cids: Promise<string>[] = [];

        let currentPart: FilePart | undefined;
        for await (const chunk of file.body) {
            if (!currentPart) {
                currentPart = new FilePart();

                cids.push(this.storageNode.storePiece(bucketId, currentPart));
            }

            if (MAX_PIECE_SIZE - currentPart.size) {
                await currentPart.writer.write(chunk.slice(0, MAX_PIECE_SIZE - currentPart.size));
            }

            if (currentPart.size === MAX_PIECE_SIZE) {
                await currentPart.writer.close();

                currentPart = undefined;
            }
        }

        await currentPart?.writer.close();

        console.log(await Promise.all(cids));
    }

    async read(bucketId: bigint, cid: string, options?: FileReadOptions) {}
}
