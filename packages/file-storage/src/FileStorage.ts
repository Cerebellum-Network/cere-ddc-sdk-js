import {
    PieceReadOptions,
    MAX_PIECE_SIZE,
    Piece,
    MultipartPiece,
    splitStream,
    Router,
    RouterOperation,
    StorageNode,
    PieceStoreOptions,
    RouterConfig,
} from '@cere-ddc-sdk/ddc';

import {File, FileResponse} from './File';

export type FileStorageConfig = RouterConfig;
export type FileReadOptions = PieceReadOptions;
export type FileStoreOptions = PieceStoreOptions;

export class FileStorage {
    private router: Router;

    constructor(router: Router);
    constructor(config: FileStorageConfig);
    constructor(configOrRouter: FileStorageConfig | Router) {
        this.router = configOrRouter instanceof Router ? configOrRouter : new Router(configOrRouter);
    }

    private async storeLarge(node: StorageNode, bucketId: number, file: File, options?: FileStoreOptions) {
        const parts = await splitStream(file.body, MAX_PIECE_SIZE, (content, multipartOffset) => {
            const piece = new Piece(content, {multipartOffset});

            return node.storePiece(bucketId, piece);
        });

        return node.storePiece(
            bucketId,
            new MultipartPiece(await Promise.all(parts), {totalSize: file.size, partSize: MAX_PIECE_SIZE}),
            options,
        );
    }

    private async storeSmall(node: StorageNode, bucketId: number, file: File, options?: FileStoreOptions) {
        return node.storePiece(bucketId, new Piece(file.body), options);
    }

    async store(bucketId: number, file: File, options?: FileStoreOptions) {
        const isLarge = file.size > MAX_PIECE_SIZE;
        const node = await this.router.getNode(RouterOperation.STORE_PIECE);
        const cid = isLarge
            ? await this.storeLarge(node, bucketId, file, options)
            : await this.storeSmall(node, bucketId, file, options);

        return cid;
    }

    async read(bucketId: number, cidOrName: string, options?: FileReadOptions) {
        const node = await this.router.getNode(RouterOperation.READ_PIECE);
        const piece = await node.readPiece(bucketId, cidOrName, options);

        return new FileResponse(piece.cid, piece.body, options);
    }
}
