import {
    PieceStoreOptions,
    PieceReadOptions,
    MAX_PIECE_SIZE,
    Piece,
    MultipartPiece,
    splitStream,
    Router,
    RouterOperation,
} from '@cere-ddc-sdk/ddc';

import {File, FileResponse} from './File';

export type FileStorageConfig = {
    router: Router;
};

export type FileReadOptions = PieceReadOptions;
export type FileStoreOptions = PieceStoreOptions;

export class FileStorage {
    private router: Router;

    constructor({router}: FileStorageConfig) {
        this.router = router;
    }

    private async storeLarge(bucketId: number, file: File, options?: FileStoreOptions) {
        const storageNode = await this.router.getNode(RouterOperation.STORE_PIECE);
        const cidPromises = await splitStream(file.body, MAX_PIECE_SIZE, (content, multipartOffset) => {
            const piece = new Piece(content, {multipartOffset});

            return storageNode.storePiece(bucketId, piece);
        });

        const parts = await Promise.all(cidPromises);

        return storageNode.storePiece(
            bucketId,
            new MultipartPiece(parts, {
                totalSize: file.size,
                partSize: MAX_PIECE_SIZE,
            }),
            options,
        );
    }

    private async storeSmall(bucketId: number, file: File, options?: FileStoreOptions) {
        const storageNode = await this.router.getNode(RouterOperation.STORE_PIECE);
        const piece = new Piece(file.body);

        return storageNode.storePiece(bucketId, piece, options);
    }

    async store(bucketId: number, file: File, options?: FileStoreOptions) {
        if (file.size > MAX_PIECE_SIZE) {
            return this.storeLarge(bucketId, file, options);
        }

        return this.storeSmall(bucketId, file, options);
    }

    async read(bucketId: number, cid: string, options?: FileReadOptions) {
        const storageNode = await this.router.getNode(RouterOperation.STORE_PIECE);
        const piece = await storageNode.readPiece(bucketId, cid, options);

        return new FileResponse(piece.cid, piece.body, options);
    }
}
