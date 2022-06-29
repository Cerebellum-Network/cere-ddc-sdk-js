import {stringToU8a} from "@polkadot/util";

const decoder = new TextDecoder();

export class Tag {
    key: Uint8Array;
    value: Uint8Array;
    searchable: SearchType;

    constructor(key: Uint8Array | string, value: Uint8Array | string, searchable: SearchType = SearchType.RANGE) {
        this.key = key instanceof Uint8Array ? key : stringToU8a(key);
        this.value = value instanceof Uint8Array ? value : stringToU8a(value);
        this.searchable = searchable;
    }

    get keyString(): string {
        return decoder.decode(this.key);
    }

    get valueString(): string {
        return decoder.decode(this.value);
    }
}

export enum SearchType {
    RANGE = 0,
    NOT_SEARCHABLE = 1
}
