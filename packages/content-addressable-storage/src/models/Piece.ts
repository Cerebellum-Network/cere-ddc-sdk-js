import {Tag} from "./Tag";
import {Link} from "./Link";
import type {Piece as PbPiece} from "@cere-ddc-sdk/proto";

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
        return new Piece(this.data, this.tags, this.links, this.cid);
    }

    static isPiece(obj: any): obj is Piece {
        return obj instanceof Piece || (obj instanceof Object && obj.data instanceof Uint8Array && obj.tags instanceof Array && obj.links instanceof Array);
    }

    toProto(bucketId: bigint): PbPiece {
        return {
            bucketId: Number(bucketId),
            data: this.data,
            tags: this.tags,
            links: this.links
        };
    }
}
