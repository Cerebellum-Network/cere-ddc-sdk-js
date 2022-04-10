import {Link} from "@cere-ddc-sdk/content-addressable-storage";

export class IndexedLink {
    readonly index: number;
    readonly link: Link;

    constructor(index: number, link: Link) {
        this.index = index;
        this.link = link;
    }
}