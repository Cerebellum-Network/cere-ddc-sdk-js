import {
    PieceStoreOptions,
    PieceReadOptions,
    StorageNode,
    MAX_PIECE_SIZE,
    Piece,
    MultipartPiece,
    ByteCounterStream,
    splitStream,
} from '@cere-ddc-sdk/ddc';

import {File, FileResponse} from './File';

export type FileStorageConfig = {
    storageNode: StorageNode;
};

export type FileReadOptions = PieceReadOptions;
export type FileStoreOptions = PieceStoreOptions;

export class FileStorage {
    private storageNode: StorageNode;

    constructor({storageNode}: FileStorageConfig) {
        this.storageNode = storageNode;
    }

    private async storeLarge(bucketId: bigint, file: File, options?: FileStoreOptions) {
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
            options,
        );
    }

    private async storeSmall(bucketId: bigint, file: File, options?: FileStoreOptions) {
        const piece = new Piece(file.content);

        return this.storageNode.storePiece(bucketId, piece, options);
    }

    async store(bucketId: bigint, file: File, options?: FileStoreOptions) {
        if (file.size && file.size > MAX_PIECE_SIZE) {
            return this.storeLarge(bucketId, file, options);
        }

        return this.storeSmall(bucketId, file, options);
    }

    async read(bucketId: bigint, cid: string, options?: FileReadOptions) {
        const piece = await this.storageNode.readPiece(bucketId, cid);

        return new FileResponse(piece.cid, piece.body, options);
    }
}
