import {Buffer} from 'buffer';
import {TransformStream, ReadableStream, WritableStreamDefaultWriter as Writer} from 'stream/web';

export type SplitStreamMapper<T = any> = (stream: ReadableStream, offset: number) => T;

export const splitStream = async <T = any>(
    stream: ReadableStream<Uint8Array>,
    splitBy: number,
    mapper: SplitStreamMapper<T>,
) => {
    const out: T[] = [];

    let totalSize = 0;
    let currentSize = 0;
    let currentWriter: Writer<Uint8Array> | undefined;
    let reaminingBytes = new Uint8Array([]);

    for await (const chunk of stream) {
        const data = Buffer.concat([reaminingBytes, chunk]);

        if (!currentWriter) {
            const {readable, writable} = new TransformStream();

            currentWriter = writable.getWriter();
            totalSize += currentSize;
            currentSize = 0;

            out.push(mapper(readable, totalSize));
        }

        const toWrite = Math.min(splitBy - currentSize, data.byteLength);
        await currentWriter.write(data.slice(0, toWrite));

        currentSize += toWrite;
        reaminingBytes = data.slice(toWrite);

        if (currentSize === splitBy) {
            await currentWriter.close();

            currentWriter = undefined;
        }
    }

    if (reaminingBytes.byteLength) {
        currentWriter?.write(reaminingBytes);
    }

    await currentWriter?.close();

    return out;
};
