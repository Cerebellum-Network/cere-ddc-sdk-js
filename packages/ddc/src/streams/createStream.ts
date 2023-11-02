import {ReadableStream, TransformStream} from 'stream/web';
import {CONTENT_CHUNK_SIZE} from '../constants';

export type Content = Uint8Array | Iterable<Uint8Array> | AsyncIterable<Uint8Array>;
export type ContentStream = ReadableStream<Uint8Array>;

const withChunkSize = (chunkSize: number) => {
    let buffer = Buffer.from([]);

    return new TransformStream<Uint8Array>({
        transform(data, controller) {
            buffer = Buffer.concat([buffer, data]);

            while (buffer.byteLength >= chunkSize) {
                controller.enqueue(buffer.slice(0, chunkSize));
                buffer = buffer.slice(chunkSize);
            }
        },

        flush(controller) {
            if (buffer.byteLength) {
                controller.enqueue(buffer.slice());
            }
        },
    });
};

export const createContentStream = (input: Content | ContentStream, chunkSize = CONTENT_CHUNK_SIZE): ContentStream => {
    const content = input instanceof Uint8Array ? [input] : input;
    const asyncIterator = (async function* () {
        return yield* content;
    })();

    let stream: ContentStream = new ReadableStream<Uint8Array>({
        async pull(controller) {
            const {done, value} = await asyncIterator.next();

            if (value) {
                controller.enqueue(value);
            }

            if (done) {
                controller.close();
            }
        },
    });

    return stream.pipeThrough(withChunkSize(chunkSize));
};
