import { Buffer } from 'buffer';

import * as dag from './DagApi';
import { Cid } from './Cid';

export class Link implements Omit<dag.Link, 'cid'> {
  constructor(
    public cid: string,
    public size: number,
    public name = '',
  ) {}
}

export class Tag implements dag.Tag {
  constructor(
    public key: string,
    public value: string,
  ) {}
}

export class DagNode {
  private dataBuffer: Buffer;

  constructor(
    data: Uint8Array | string | Buffer,
    public links: Link[] = [],
    public tags: Tag[] = [],
  ) {
    this.dataBuffer = Buffer.from(data);
  }

  get size() {
    return dag.Node.toBinary(mapDagNodeToAPI(this)).byteLength;
  }

  get data(): Buffer {
    return this.dataBuffer;
  }

  set data(data: Uint8Array | string | Buffer) {
    this.dataBuffer = Buffer.from(data);
  }

  static isDagNode(object: unknown): object is DagNode {
    const maybeNode = object as DagNode | null;

    if (object instanceof DagNode) {
      return true;
    }

    return (
      typeof maybeNode === 'object' &&
      maybeNode?.data instanceof Uint8Array &&
      Array.isArray(maybeNode.links) &&
      Array.isArray(maybeNode.tags)
    );
  }
}

export class DagNodeResponse extends DagNode {
  protected cidObject: Cid;

  constructor(cid: string | Uint8Array | Cid, data: Uint8Array, dagLinks: dag.Link[] = [], tags: dag.Tag[] = []) {
    const links = dagLinks.map((link) => ({ ...link, cid: new Cid(link.cid).toString() }));

    super(new Uint8Array(data), links, tags);

    this.cidObject = new Cid(cid);
  }

  get cid() {
    return this.cidObject.toString();
  }
}

export const mapDagNodeToAPI = (node: DagNode): dag.Node => ({
  ...node,
  data: node.data,
  links: node.links.map((link) => ({
    ...link,
    cid: new Cid(link.cid).toBytes(),
  })),
});
