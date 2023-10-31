import {TransformStream, WritableStreamDefaultWriter} from 'stream/web';
import {Piece, PieceMeta} from '@cere-ddc-sdk/ddc';

export class FilePart extends Piece {
    size = 0;
    writer: WritableStreamDefaultWriter<Uint8Array>;

    constructor(meta?: PieceMeta) {
        const {readable, writable} = new TransformStream<Uint8Array>({
            transform: (chunk, controller) => {
                controller.enqueue(chunk);

                this.size += chunk.byteLength;
            },
        });

        super(readable, meta);
        this.writer = writable.getWriter();
    }
}
