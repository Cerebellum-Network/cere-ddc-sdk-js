import {Tag} from "./Tag.js";
import {Link} from "./Link.js";

export class Piece {
    data: Uint8Array;
    tags: Array<Tag>;
    links: Array<Link>;
    cid?: string;

    constructor(data: Uint8Array, tags: Array<Tag> = new Array<Tag>(), links: Array<Link> = new Array<Link>(), cid?: string) {
        this.data = data;
        this.tags = tags;
        this.cid = cid;
        this.links = links;
    }

    clone(): Piece {
        return new Piece(this.data, this.tags, this.links, this.cid)
    }
}
