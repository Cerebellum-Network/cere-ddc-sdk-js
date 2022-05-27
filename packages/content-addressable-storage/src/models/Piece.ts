import {Tag} from "./Tag";
import {Link} from "./Link";
import {stringToU8a} from "@polkadot/util";
import {blob} from "stream/consumers";

type Data = ReadableStream<Uint8Array> | Blob | string | Uint8Array

export class Piece {
    data: Data;
    tags: Array<Tag>;
    cid?: string;

    constructor(data: Data, tags: Array<Tag> = new Array<Tag>(), cid?: string) {
        this.data = data;
        this.tags = tags;
        this.cid = cid;
    }

    dataSize(): number {
        if (this.data instanceof Uint8Array || this.data instanceof String) {
            return this.data.length
        }

        if (this.data instanceof Blob) {
            return this.data.size
        }

        // undefined
        return -1
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
