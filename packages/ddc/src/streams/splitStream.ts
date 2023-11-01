import {TransformStream, ReadableStream, WritableStreamDefaultWriter as Writer} from 'stream/web';

export type SplitStreamMapper<T = any> = (stream: ReadableStream, index: number) => T;

export const splitStream = async <T = any>(
    stream: ReadableStream<Uint8Array>,
    chunkSize: bigint,
    mapper: SplitStreamMapper<T>,
) => {
    const out: any = [];

    let correntSize = 0n;
    let currentWriter: Writer | undefined;

    for await (const chunk of stream) {
        if (!currentWriter) {
            const {readable, writable} = new TransformStream();

            currentWriter = writable.getWriter();
            correntSize = 0n;

            out.push(mapper(readable, out.length));
        }

        await currentWriter.write(chunk);
        correntSize += BigInt(chunk.byteLength);

        if (correntSize === chunkSize) {
            await currentWriter.close();

            currentWriter = undefined;
        }
    }

    await currentWriter?.close();

    return out;
};
