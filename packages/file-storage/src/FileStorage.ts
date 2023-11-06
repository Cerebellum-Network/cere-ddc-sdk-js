import {
    PieceReadOptions,
    MAX_PIECE_SIZE,
    Piece,
    MultipartPiece,
    splitStream,
    Router,
    RouterOperation,
    StorageNode,
    CnsRecord,
    Cid,
} from '@cere-ddc-sdk/ddc';

import {File, FileResponse} from './File';

export type FileStorageConfig = {
    router: Router;
};

export type FileReadOptions = PieceReadOptions;
export type FileStoreOptions = {
    name?: string;
};

export class FileStorage {
    private router: Router;

    constructor({router}: FileStorageConfig) {
        this.router = router;
    }

    private async storeLarge(node: StorageNode, bucketId: number, file: File) {
        const cidPromises = await splitStream(file.body, MAX_PIECE_SIZE, (content, multipartOffset) => {
            const piece = new Piece(content, {multipartOffset});

            return node.storePiece(bucketId, piece);
        });

        const parts = await Promise.all(cidPromises);

        return node.storePiece(
            bucketId,
            new MultipartPiece(parts, {
                totalSize: file.size,
                partSize: MAX_PIECE_SIZE,
            }),
        );
    }

    private async storeSmall(node: StorageNode, bucketId: number, file: File) {
        return node.storePiece(bucketId, new Piece(file.body));
    }

    async store(bucketId: number, file: File, options?: FileStoreOptions) {
        const isLarge = file.size > MAX_PIECE_SIZE;
        const node = await this.router.getNode(RouterOperation.STORE_PIECE);
        const cid = isLarge ? await this.storeLarge(node, bucketId, file) : await this.storeSmall(node, bucketId, file);

        if (options?.name) {
            await node.storeCnsRecord(bucketId, new CnsRecord(cid, options.name));
        }

        return cid;
    }

    async read(bucketId: number, cidOrName: string, options?: FileReadOptions) {
        const node = await this.router.getNode(RouterOperation.READ_PIECE);
        let cid = cidOrName;

        if (!Cid.isCid(cidOrName)) {
            const cnsRecord = await node.getCnsRecord(bucketId, cidOrName);

            if (!cnsRecord) {
                throw new Error(`File with name "${cidOrName}" was not found`);
            }

            cid = cnsRecord.cid;
        }

        const piece = await node.readPiece(bucketId, cid, options);

        return new FileResponse(piece.cid, piece.body, options);
    }
}
