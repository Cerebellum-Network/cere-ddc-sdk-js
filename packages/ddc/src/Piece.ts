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
    private iterator: AsyncIterator<Uint8Array>;

    constructor(readonly bucketId: bigint, readonly cid: Uint8Array, readonly body: ReadableStream<Uint8Array>) {
        this.iterator = this.body[Symbol.asyncIterator]();
    }

    async arrayBuffer() {
        return arrayBuffer(this.iterator);
    }

    async text() {
        return text(this.iterator);
    }

    async json() {
        return json(this.iterator);
    }
}
