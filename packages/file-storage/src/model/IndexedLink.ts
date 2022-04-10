import {Link} from "@cere-ddc-sdk/content-addressable-storage";

export class IndexedLink {
    readonly position: number;
    readonly link: Link;

    constructor(position: number, link: Link) {
        this.position = position;
        this.link = link;
    }
}