import {StorageNode, MAX_PIECE_SIZE, Piece, MultipartPiece, ByteCounterStream, splitStream} from '@cere-ddc-sdk/ddc';

import {File, FileResponse} from './File';

export type FileStorageConfig = {};
export type FileReadOptions = {};
export type FileStoreOptions = {};

export class FileStorage {
    constructor(private storageNode: StorageNode) {}

    async store(bucketId: bigint, file: File, options?: FileStoreOptions) {
        const byteCounter = new ByteCounterStream();
        const cidPromises = await splitStream(file.body.pipeThrough(byteCounter), MAX_PIECE_SIZE, (content) => {
            const piece = new Piece(content, {
                multipartOffset: byteCounter.processedBytes,
            });

            return this.storageNode.storePiece(bucketId, piece);
        });

        const parts = await Promise.all(cidPromises);

        return this.storageNode.storePiece(
            bucketId,
            new MultipartPiece(parts, {
                totalSize: byteCounter.processedBytes,
                partSize: MAX_PIECE_SIZE,
            }),
        );
    }

    async read(bucketId: bigint, cid: string, options?: FileReadOptions) {
        const piece = await this.storageNode.readPiece(bucketId, cid);

        return new FileResponse(piece.cid, piece.body);
    }
}
