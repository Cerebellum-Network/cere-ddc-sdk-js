import {StorageNode, MAX_PIECE_SIZE, MultipartPiece} from '@cere-ddc-sdk/ddc';

import {File, FileResponse} from './File';
import {FilePart} from './FilePart';

export type FileStorageConfig = {};
export type FileReadOptions = {};
export type FileStoreOptions = {};

export class FileStorage {
    constructor(private storageNode: StorageNode) {}

    async store(bucketId: bigint, file: File, options?: FileStoreOptions) {
        const cids: Promise<string>[] = [];

        let totalSize = 0n;
        let currentPart: FilePart | undefined;
        for await (const chunk of file.body) {
            if (!currentPart) {
                currentPart = new FilePart({
                    multipartOffset: totalSize,
                });

                cids.push(this.storageNode.storePiece(bucketId, currentPart));
            }

            totalSize += BigInt(chunk.byteLength);
            await currentPart.writer.write(chunk);

            if (currentPart.size === MAX_PIECE_SIZE) {
                await currentPart.writer.close();

                currentPart = undefined;
            }
        }

        await currentPart?.writer.close();
        const parts = await Promise.all(cids);

        return this.storageNode.storePiece(
            bucketId,
            new MultipartPiece(parts, {
                totalSize,
                partSize: BigInt(MAX_PIECE_SIZE),
            }),
        );
    }

    async read(bucketId: bigint, cid: string, options?: FileReadOptions) {
        const piece = await this.storageNode.readPiece(bucketId, cid);

        return new FileResponse(piece.cid, piece.body);
    }
}
