import {Cid} from './Cid';
import {CnsApi} from './CnsApi';
import {DagApi} from './DagApi';
import {FileApi, ReadFileRange} from './FileApi';
import {RpcTransport} from './RpcTransport';
import {MultipartPiece, Piece, PieceResponse} from './Piece';
import {DagNode, DagNodeResponse} from './DagNode';

export type StorageNodeConfig = {
    rpcHost: string;
};

type NamingOptions = {
    name?: string;
};

export type PieceStoreOptions = NamingOptions & {};
export type DagNodeStoreOptions = NamingOptions & {};
export type PieceReadOptions = {
    range?: ReadFileRange;
};

export class StorageNode {
    private dagApi: DagApi;
    private fileApi: FileApi;
    private cnsApi: CnsApi;

    constructor({rpcHost}: StorageNodeConfig) {
        const transport = new RpcTransport(rpcHost);

        this.dagApi = new DagApi(transport);
        this.fileApi = new FileApi(transport);
        this.cnsApi = new CnsApi(transport);
    }

    async storePiece(bucketId: bigint, piece: Piece | MultipartPiece, options?: PieceStoreOptions) {
        if (piece instanceof MultipartPiece) {
            return this.storeMultipartPiece(bucketId, piece, options);
        }

        const cidBytes = await this.fileApi.putRawPiece(
            {
                bucketId: bucketId.toString(), // TODO: Inconsistent bucketId type,
                isMultipart: piece.isPart,
                offset: piece.offset,
            },
            piece.content,
        );

        const cid = new Cid(cidBytes).toString();

        if (options?.name) {
            await this.assignName(bucketId, cid, options.name);
        }

        return cid;
    }

    private async storeMultipartPiece(bucketId: bigint, piece: MultipartPiece, options?: PieceStoreOptions) {
        const cid = await this.fileApi.putMultipartPiece({
            bucketId: bucketId.toString(), // TODO: Inconsistent bucketId type,
            partHashes: piece.partHashes,
            partSize: piece.meta.partSize,
            totalSize: piece.meta.totalSize,
        });

        return new Cid(cid).toString();
    }

    async storeDagNode(bucketId: bigint, node: DagNode, options?: DagNodeStoreOptions) {
        const cidBytes = await this.dagApi.putNode({
            node: node,
            bucketId: Number(bucketId), // TODO: Inconsistent bucketId type
        });

        const cid = new Cid(cidBytes).toString();

        if (options?.name) {
            await this.assignName(bucketId, cid, options.name);
        }

        return cid;
    }

    async readPiece(bucketId: bigint, cid: string, options?: PieceReadOptions) {
        const cidObject = new Cid(cid);
        const contentStream = this.fileApi.getFile({
            cid: cidObject.toBytes(),
            bucketId: bucketId.toString(), // TODO: Inconsistent bucketId type
            range: options?.range,
        });

        return new PieceResponse(cidObject, contentStream, {
            range: options?.range,
        });
    }

    async getDagNode(bucketId: bigint, cid: string) {
        const cidObject = new Cid(cid);
        const node = await this.dagApi.getNode({
            cid: cidObject.toString(),
            bucketId: Number(bucketId), // TODO: Inconsistent bucketId type
        });

        return node && new DagNodeResponse(cidObject, new Uint8Array(node.data), node.links, node.tags);
    }

    async assignName(bucketId: bigint, cid: string, name: string) {
        return this.cnsApi.assignName({
            cid,
            name,
            bucketId: Number(bucketId), // TODO: Inconsistent bucketId type
        });
    }

    async getCidByName(bucketId: bigint, name: string) {
        return this.cnsApi.getCid({
            name,
            bucketId: Number(bucketId), // TODO: Inconsistent bucketId type
        });
    }
}
