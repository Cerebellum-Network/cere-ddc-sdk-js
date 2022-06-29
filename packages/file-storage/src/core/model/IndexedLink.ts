import {Link} from "@cere-ddc-sdk/content-addressable-storage";

export class IndexedLink {
    constructor(
        readonly position: number,
        readonly link: Link
    ) {
    }
}