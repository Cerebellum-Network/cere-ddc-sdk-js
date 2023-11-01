import {ReadableStream} from 'stream/web';

export type Content = Iterable<Uint8Array> | AsyncIterable<Uint8Array>;
export type ContentStream = ReadableStream<Uint8Array>;

export const createContentStream = (content: Content): ContentStream => {
    if (content instanceof ReadableStream) {
        return content;
    }

    const asyncIterator = (async function* () {
        return yield* content;
    })();

    return new ReadableStream<Uint8Array>({
        async pull(controller) {
            const {done, value} = await asyncIterator.next();

            if (value) {
                controller.enqueue(new Uint8Array(value));
            }

            if (done) {
                controller.close();
            }
        },
    });
};
