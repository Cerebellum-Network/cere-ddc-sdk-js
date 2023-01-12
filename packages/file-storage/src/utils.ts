import streamWeb from 'stream/web';
import {Readable} from 'node:stream';
import {PathLike} from 'fs';
import {open} from 'node:fs/promises';
import { Data } from './types';

export async function transformDataToStream(data: Data): Promise<streamWeb.ReadableStream<Uint8Array>> {
    if (data instanceof streamWeb.ReadableStream) {
        return data;
    } else if (data instanceof Readable) {
        return readableToStream(data);
    } else if (data instanceof Uint8Array) {
        return new streamWeb.ReadableStream<Uint8Array>({
            pull(controller) {
                controller.enqueue(data);
                controller.close();
            },
        });
    } else {
        return await pathToStream(data as PathLike);
    }
}

export function readableToStream(readable: Readable): streamWeb.ReadableStream<Uint8Array> {
    async function* generator() {
        for await (const chunk of readable) {
            yield chunk;
        }
    }

    const dataGenerator = generator();
    return new streamWeb.ReadableStream({
        async pull(controller) {
            const data = await dataGenerator.next();
            if (!data.done) {
                controller.enqueue(data.value);
            } else {
                controller.close();
            }
        },
    });
}

export async function pathToStream(filePath: PathLike): Promise<streamWeb.ReadableStream<Uint8Array>> {
    const file = await open(filePath, 'r');

    return new streamWeb.ReadableStream({
        async cancel() {
            await file.close();
        },
        async pull(controller) {
            const {bytesRead, buffer} = await file.read();

            if (bytesRead === 0) {
                await file.close();
                controller.close();
            }

            controller.enqueue(buffer.slice(buffer.byteOffset, bytesRead));
        },
    });
}
