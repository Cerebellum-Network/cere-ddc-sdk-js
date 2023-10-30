import * as dag from './DagApi';
import {Cid} from './Cid';

export class Link implements dag.Link {
    constructor(public cid: string, public size: bigint, public name = '') {}
}

export class Tag implements dag.Tag {
    constructor(public key: string, public value: string) {}
}

export class DagNode implements dag.Node {
    constructor(public bucketId: bigint, public data: Uint8Array, public links: Link[] = [], public tags: Tag[] = []) {}
}

export class DagNodeResponse extends DagNode {
    constructor(
        readonly bucketId: bigint,
        protected cidObject: Cid,
        readonly data: Uint8Array,
        readonly links: Link[] = [],
        readonly tags: Tag[] = [],
    ) {
        super(bucketId, data, links, tags);
    }

    get cid() {
        return this.cidObject.toString();
    }
}
