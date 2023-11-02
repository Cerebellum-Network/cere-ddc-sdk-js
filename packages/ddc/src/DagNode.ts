import * as dag from './DagApi';
import {Cid} from './Cid';

export class Link implements dag.Link {
    constructor(public cid: string, public size: number, public name = '') {}
}

export class Tag implements dag.Tag {
    constructor(public key: string, public value: string) {}
}

export class DagNode implements dag.Node {
    constructor(public data: Uint8Array, public links: Link[] = [], public tags: Tag[] = []) {}
}

export class DagNodeResponse extends DagNode {
    protected cidObject: Cid;

    constructor(
        cid: string | Uint8Array,
        readonly data: Uint8Array,
        readonly links: Link[] = [],
        readonly tags: Tag[] = [],
    ) {
        super(data, links, tags);

        this.cidObject = new Cid(cid);
    }

    get cid() {
        return this.cidObject.toString();
    }
}
