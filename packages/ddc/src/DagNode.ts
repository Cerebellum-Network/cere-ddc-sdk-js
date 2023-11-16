import {Buffer} from 'buffer';

import * as dag from './DagApi';
import {Cid} from './Cid';

export class Link implements Omit<dag.Link, 'cid'> {
    constructor(public cid: string, public size: number, public name = '') {}
}

export class Tag implements dag.Tag {
    constructor(public key: string, public value: string) {}
}

export class DagNode {
    public data: Buffer;

    constructor(data: Uint8Array | string | Buffer, public links: Link[] = [], public tags: Tag[] = []) {
        this.data = Buffer.from(data);
    }
}

export class DagNodeResponse extends DagNode {
    protected cidObject: Cid;

    constructor(cid: string | Uint8Array | Cid, data: Uint8Array, dagLinks: dag.Link[] = [], tags: dag.Tag[] = []) {
        const links = dagLinks.map((link) => ({...link, cid: new Cid(link.cid).toString()}));

        super(new Uint8Array(data), links, tags);

        this.cidObject = new Cid(cid);
    }

    get cid() {
        return this.cidObject.toString();
    }
}

export const mapDagNodeToAPI = (node: DagNode): dag.Node => ({
    ...node,
    links: node.links.map((link) => ({
        ...link,
        cid: new Cid(link.cid).toBytes(),
    })),
});
