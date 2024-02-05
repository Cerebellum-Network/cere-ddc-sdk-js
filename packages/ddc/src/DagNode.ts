import { Buffer } from 'buffer';

import * as dag from './DagApi';
import { Cid } from './Cid';

/**
 * The `Link` class represents a link in a DAG.
 *
 * @group Directed Acyclic Graph (DAG)
 * @property cid - The content identifier of the link.
 * @property size - The content size on which the link points to.
 * @property name - The name of the link.
 *
 * @example
 *
 * ```typescript
 * const cid = '...';
 * const size = 10;
 * const name = 'example';
 * const link = new Link(cid, size, name);
 *
 * console.log(link);
 * ```
 */
export class Link implements Omit<dag.Link, 'cid'> {
  constructor(
    public cid: string,
    public size: number,
    public name = '',
  ) {}
}

/**
 * The `Tag` class represents a DAG Node tag.
 *
 * @property key - The key of the tag.
 * @property value - The value of the tag.
 *
 * @group Directed Acyclic Graph (DAG)
 * @example
 *
 * ```typescript
 * const key = 'exampleKey';
 * const value = 'exampleValue';
 * const tag = new Tag(key, value);
 *
 * console.log(tag);
 * ```
 */
export class Tag implements dag.Tag {
  constructor(
    public key: string,
    public value: string,
  ) {}
}

/**
 * The `DagNode` class represents a node in a Directed Acyclic Graph (DAG).
 *
 * @group Directed Acyclic Graph (DAG)
 * @property links - The links of the node.
 * @property tags - The tags of the node.
 * @property data - The data of the node as a `Buffer`.
 * @property size - The size of the node.
 *
 * @example
 *
 * ```typescript
 * const data = 'Node data';
 * const links = [new Link('...', 10, 'link1')];
 * const tags = [new Tag('exampleKey', 'exampleValue')];
 * const node = new DagNode(data, links, tags);
 *
 * console.log(DagNode.isDagNode(node)); // true
 * ```
 */
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

  /**
   * Checks if an object is an instance of `DagNode`.
   *
   * @param object - The object to check.
   *
   * @returns `true` if the object is an instance of `DagNode` or has the same properties as a `DagNode`, `false` otherwise.
   */
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

/**
 * The `DagNodeResponse` class represents a response for a DAG Node.
 *
 * @group Directed Acyclic Graph (DAG)
 * @property cid - This getter retrieves the content identifier of the response as a string.
 */
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
