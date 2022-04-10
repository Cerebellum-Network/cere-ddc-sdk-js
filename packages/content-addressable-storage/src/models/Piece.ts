import {Tag} from "./Tag";
import {Link} from "./Link";

export class Piece {
    data: Uint8Array;
    tags: Array<Tag>;
    links: Array<Link>;

    constructor(
        data: Uint8Array,
        tags: Array<Tag> = new Array<Tag>(),
        links: Array<Link> = new Array<Link>()
    ) {
        this.data = data;
        this.tags = tags;
        this.links = links;
    }
}
