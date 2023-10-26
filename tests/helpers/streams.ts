import {randomBytes} from 'crypto';
import {u8aConcat} from '@polkadot/util';
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
    let content = new Uint8Array([]);
    for await (const chunk of stream) {
        content = u8aConcat(content, chunk);
    }

    return content;
};
