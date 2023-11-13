import {randomBytes} from 'crypto';

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
