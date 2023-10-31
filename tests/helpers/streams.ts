import {randomBytes} from 'crypto';
import {arrayBuffer} from 'stream/consumers';
import {ReadableStream} from 'stream/web';

export const createDataStream = (contentSize: number, chunkSize: number) => {
    let remainingDataSize = contentSize;

    return new ReadableStream<Uint8Array>({
        async pull(controller) {
            if (remainingDataSize > 0) {
                controller.enqueue(new Uint8Array(randomBytes(Math.min(chunkSize, remainingDataSize))));
            } else {
                controller.close();
            }

            remainingDataSize -= chunkSize;
        },
    });
};

export const streamToU8a = async (stream: ReadableStream<Uint8Array>) => {
    return new Uint8Array(await arrayBuffer(stream[Symbol.asyncIterator]()));
};
