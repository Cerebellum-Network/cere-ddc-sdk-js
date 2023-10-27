import {ReadableStream} from 'stream/web';

import {PieceContent} from './FileApi';
import {Piece, PieceResponse} from './Piece';

export type FileMetadata = {
    size?: bigint;
};

export class File extends Piece {
    constructor(bucketId: bigint, content: PieceContent | Uint8Array, readonly metadata?: FileMetadata) {
        super(bucketId, content);
    }
}

export class FileResponse extends PieceResponse {
    constructor(bucketId: bigint, cid: Uint8Array, body: ReadableStream<Uint8Array>, readonly metadata?: FileMetadata) {
        super(bucketId, cid, body);
    }
}
