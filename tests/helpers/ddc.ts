import {CidBuilder} from '@cere-ddc-sdk/core';
import {Piece, Tag} from '@cere-ddc-sdk/content-addressable-storage';
import {BucketId} from '@cere-ddc-sdk/smart-contract/types';
import {Piece as ProtoPiece} from '@cere-ddc-sdk/proto';
import {StorageNodeConfig} from '@cere-ddc-sdk/ddc';

export const getPieceCid = async (bucketId: BucketId, piece: Piece) => {
    const cidBuilder = new CidBuilder();
    const pbPiece = piece.toProto(bucketId);
    const pieceAsBytes = ProtoPiece.toBinary(pbPiece);

    return cidBuilder.build(pieceAsBytes);
};

export const getDataCid = async (bucketId: BucketId, data: Uint8Array, tags: Tag[] = []) => {
    return getPieceCid(bucketId, new Piece(data, tags));
};

export const getStorageNodes = (): StorageNodeConfig[] => [
    {grpcUrl: 'grpc://localhost:9091', httpUrl: 'http://localhost:8091'},
    {grpcUrl: 'grpc://localhost:9092', httpUrl: 'http://localhost:8092'},
    {grpcUrl: 'grpc://localhost:9093', httpUrl: 'http://localhost:8093'},
    {grpcUrl: 'grpc://localhost:9094', httpUrl: 'http://localhost:8094'},
];
