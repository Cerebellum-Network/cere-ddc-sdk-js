import {Cid} from './Cid';
import {CnsApi} from './CnsApi';
import {DagApi} from './DagApi';
import {FileApi, ReadFileRange} from './FileApi';
import {RpcTransport} from './RpcTransport';
import {MultipartPiece, Piece, PieceResponse} from './Piece';
import {DagNode, DagNodeResponse, mapDagNodeToAPI} from './DagNode';
import {Signer} from './Signer';
import {CnsRecord, CnsRecordResponse, mapCnsRecordToAPI} from './CnsRecord';

export type StorageNodeConfig = {
    rpcHost: string;
    signer?: Signer;
};

export type PieceReadOptions = {
    range?: ReadFileRange;
};

export class StorageNode {
    private signer?: Signer;
    private dagApi: DagApi;
    private fileApi: FileApi;
    private cnsApi: CnsApi;

    constructor({rpcHost, signer}: StorageNodeConfig) {
        const transport = new RpcTransport(rpcHost);

        this.signer = signer;
        this.dagApi = new DagApi(transport);
        this.fileApi = new FileApi(transport);
        this.cnsApi = new CnsApi(transport);
    }

    async storePiece(bucketId: number, piece: Piece | MultipartPiece) {
        if (piece instanceof MultipartPiece) {
            return this.storeMultipartPiece(bucketId, piece);
        }

        const cidBytes = await this.fileApi.putRawPiece(
            {
                bucketId,
                isMultipart: piece.isPart,
                offset: piece.offset,
            },
            piece.body,
        );

        return new Cid(cidBytes).toString();
    }

    private async storeMultipartPiece(bucketId: number, piece: MultipartPiece) {
        const cid = await this.fileApi.putMultipartPiece({
            bucketId,
            partHashes: piece.partHashes,
            partSize: piece.meta.partSize,
            totalSize: piece.meta.totalSize,
        });

        return new Cid(cid).toString();
    }

    async storeDagNode(bucketId: number, node: DagNode) {
        const cidBytes = await this.dagApi.putNode({
            bucketId,
            node: mapDagNodeToAPI(node),
        });

        return new Cid(cidBytes).toString();
    }

    async readPiece(bucketId: number, cid: string, options?: PieceReadOptions) {
        const cidObject = new Cid(cid);
        const contentStream = this.fileApi.getFile({
            bucketId,
            cid: cidObject.toBytes(),
            range: options?.range,
        });

        return new PieceResponse(cid, contentStream, {
            range: options?.range,
        });
    }

    async getDagNode(bucketId: number, cid: string) {
        const cidObject = new Cid(cid);
        const node = await this.dagApi.getNode({
            bucketId,
            cid: cidObject.toBytes(),
        });

        return node && new DagNodeResponse(cid, new Uint8Array(node.data), node.links, node.tags);
    }

    async storeCnsRecord(bucketId: number, record: CnsRecord) {
        if (!record.signature && this.signer) {
            await this.signer.isReady();

            record.sign(this.signer);
        }

        return this.cnsApi.putRecord({
            bucketId,
            record: mapCnsRecordToAPI(record),
        });
    }

    async getCnsRecord(bucketId: number, name: string) {
        const record = await this.cnsApi.getRecord({bucketId, name});

        return record && new CnsRecordResponse(record.cid, record.name, record.signature);
    }
}
