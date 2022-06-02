import {Tag} from "@cere-ddc-sdk/content-addressable-storage/src";

type Data = ReadableStream<Uint8Array> | string | Uint8Array

export class PieceArray {
    data: Data;
    tags: Array<Tag>;
    cid?: string;

    constructor(data: Data, tags: Array<Tag> = new Array<Tag>(), cid?: string) {
        this.data = data;
        this.tags = tags;
        this.cid = cid
    }

    isPiece(chunkSize: number): boolean {
        return this.data instanceof Uint8Array && this.data.length <= chunkSize;
    }

    async* dataReader() {
        if (this.data === null || typeof this.data === "string") {
            return;
        }

        if (this.data instanceof Uint8Array) {
            yield this.data;
        } else {
            const stream = this.data as ReadableStream<Uint8Array>;
            const reader = stream.getReader();

            let result
            while (!(result = await reader.read()).done) {
                yield result.value;
            }
        }
    }
}