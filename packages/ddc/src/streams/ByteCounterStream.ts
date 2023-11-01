import {TransformStream} from 'stream/web';

export class ByteCounterStream extends TransformStream<Uint8Array> {
    private byteLength = 0n;

    constructor() {
        super({
            transform: (chunk, controller) => {
                this.byteLength += BigInt(chunk.byteLength);

                controller.enqueue(chunk);
            },
        });
    }

    get processedBytes() {
        return this.byteLength;
    }
}
