import * as dag from './DagApi';
import {Cid} from './Cid';

export class Link implements dag.Link {
    constructor(public cid: string, public size: number, public name = '') {}
}

export class Tag implements dag.Tag {
    constructor(public key: string, public value: string) {}
}

export class DagNode implements dag.Node {
    public data: Buffer;

    constructor(data: Uint8Array | string | Buffer, public links: Link[] = [], public tags: Tag[] = []) {
        this.data = Buffer.from(data);
    }
}

export class DagNodeResponse extends DagNode {
    protected cidObject: Cid;

    constructor(cid: string | Uint8Array, data: Uint8Array, readonly links: Link[] = [], readonly tags: Tag[] = []) {
        super(new Uint8Array(data), links, tags);

        this.cidObject = new Cid(cid);
    }

    get cid() {
        return this.cidObject.toString();
    }
}
