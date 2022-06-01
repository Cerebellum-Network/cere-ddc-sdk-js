import {stringToU8a} from "@polkadot/util";
import {Tag} from "@cere-ddc-sdk/content-addressable-storage/src";

type Data = ReadableStream<Uint8Array> | string | Uint8Array

export class Object {
    data: Data;
    tags: Array<Tag>;
    cid?: string;

    constructor(data: Data, tags: Array<Tag> = new Array<Tag>(), cid?: string) {
        this.data = data;
        this.tags = tags;
        this.cid = cid
    }

    isPiece(chunkSize: number): boolean {
        if (this.data instanceof Uint8Array) {
            return true;
        }

        return false;
    }

    async dataAsBytes(): Promise<Uint8Array> {
        if (this.data instanceof Uint8Array) {
            return this.data
        }

        if (this.data instanceof String) {
            return stringToU8a(this.data)
        }

        if (this.data instanceof Blob) {
            const arrayBuffer = await this.data.arrayBuffer()
            return new Uint8Array(arrayBuffer)
        }

        if (this.data instanceof ReadableStream<Uint8Array>) {
            let result = [];
            const reader = this.data.getReader();
            let chunk;
            while (!(chunk = await reader.read()).done) {
                result.push(...chunk.value);
            }

            return new Uint8Array(result)
        }

        return Promise.reject("Unsupported data type")
    }
}