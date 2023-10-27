import {ReadableStream} from 'stream/web';
import {arrayBuffer, text, json} from 'stream/consumers';

import {PieceContent} from './FileApi';

export class Piece {
    readonly content: PieceContent;

    constructor(readonly bucketId: bigint, content: PieceContent | Uint8Array) {
        this.content = content instanceof Uint8Array ? [content] : content; // TODO: find a better way to use direct Uint8Array input
    }
}

export class PieceResponse {
    constructor(readonly bucketId: bigint, readonly cid: Uint8Array, readonly body: ReadableStream<Uint8Array>) {}

    async arrayBuffer() {
        return arrayBuffer(this.body);
    }

    async text() {
        return text(this.body);
    }

    async json() {
        return json(this.body);
    }
}
