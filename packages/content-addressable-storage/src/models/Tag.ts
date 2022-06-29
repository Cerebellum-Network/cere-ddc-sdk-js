export class Tag {
    constructor(
        readonly key: string,
        readonly value: string,
        readonly searchable: SearchType = SearchType.RANGE
    ) {
    }
}

export enum SearchType {
    RANGE = 0,
    NOT_SEARCHABLE = 1
}
