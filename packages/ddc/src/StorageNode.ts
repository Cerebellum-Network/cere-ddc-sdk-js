import {CnsApi} from './CnsApi';
import {DagApi} from './DagApi';
import {FileApi} from './FileApi';
import {RpcTransport} from './RpcTransport';
import {Piece, PieceResponse} from './Piece';
import {File, FileMetadata, FileResponse} from './File';
import {DagNode, DagNodeResponse} from './DagNode';

type StoreOptions = {
    name?: string;
};

export class StorageNode {
    private dagApi: DagApi;
    private fileApi: FileApi;
    private cnsApi: CnsApi;

    constructor(rpcHost: string) {
        const transport = new RpcTransport(rpcHost);

        this.dagApi = new DagApi(transport);
        this.fileApi = new FileApi(transport);
        this.cnsApi = new CnsApi(transport);
    }

    async store(entity: DagNode, options?: StoreOptions): Promise<string>; // TODO: Figure out why CIDs in DAG are strings
    async store(entity: Piece | File, options?: StoreOptions): Promise<Uint8Array>;
    async store(entity: Piece | File | DagNode, options?: StoreOptions) {
        if (entity instanceof DagNode) {
            return this.dagApi.storeNode({
                node: entity,
                bucketId: Number(entity.bucketId), // TODO: Inconsistent bucketId type
            });
        }

        const cid = await this.fileApi.storeRawPiece(
            {
                bucketId: entity.bucketId.toString(), // TODO: Inconsistent bucketId type
                isMultipart: false,
            },
            entity.content,
        );

        if (options?.name) {
            /**
             * TODO: Not yet implemented API. Inconsistent CID type - figure out how to convert u8a CID to string and back
             */
            await this.assignName(entity.bucketId, cid.toString(), options.name);
        }

        return cid;
    }

    /**
     * TODO: Temp implementation. Should have extra logic about file metadata (size, name, etc)
     * TODO: Implement range access
     */
    async getFile(bucketId: bigint, cid: Uint8Array) {
        const piece = await this.getPiece(bucketId, cid);
        const metadata: FileMetadata = {}; // TODO: Figure out how to retrieve metadata, maybe we need create DagNode for each file to store metadata.

        return new FileResponse(piece.bucketId, piece.cid, piece.body, metadata);
    }

    /**
     * TODO: Implement range access
     */
    async getPiece(bucketId: bigint, cid: Uint8Array) {
        const contentStream = this.fileApi.readPiece({
            cid, // TODO: Figure out how to use string CIDs
            bucketId: bucketId.toString(), // TODO: Inconsistent bucketId type
        });

        return new PieceResponse(bucketId, cid, contentStream);
    }

    async getDagNode(bucketId: bigint, cid: string) {
        const node = await this.dagApi.getNode({
            cid,
            bucketId: Number(bucketId), // TODO: Inconsistent bucketId type
        });

        return node && new DagNodeResponse(bucketId, cid, new Uint8Array(node.data), node.links, node.tags);
    }

    async assignName(bucketId: bigint, cid: string, name: string) {
        return this.cnsApi.assignName({
            cid,
            name,
            bucketId: Number(bucketId), // TODO: Inconsistent bucketId type
        });
    }

    async getCidByName(bucketId: bigint, cid: string, name: string) {
        return this.cnsApi.getCid({
            name,
            bucketId: Number(bucketId), // TODO: Inconsistent bucketId type
        });
    }
}
