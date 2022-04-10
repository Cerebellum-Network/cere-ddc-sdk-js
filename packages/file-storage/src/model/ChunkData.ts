export class ChunkData {
    readonly position: number;
    readonly data: Uint8Array;

    constructor(position: number, data: Uint8Array) {
        this.position = position
        this.data = data
    }
}