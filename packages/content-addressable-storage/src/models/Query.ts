import {Tag} from "./Tag.js";

export class Query {
    constructor(
        readonly bucketId: bigint,
        readonly tags: Array<Tag>,
        readonly skipData: boolean = false
    ) {
    }
}
