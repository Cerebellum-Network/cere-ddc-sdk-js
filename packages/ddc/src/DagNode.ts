import { Buffer } from 'buffer';

import * as dag from './DagApi';
import { Cid } from './Cid';

/**
 * The `Link` class represents a link in a DAG.
 *
 * @group Directed Acyclic Graph (DAG)
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
export class Link {
  /**
   * The content identifier of the link.
   */
  public cid: string;

  /**
   * The content size on which the link points to.
   */
  public size: number;

  /**
   * The name of the link.
   */
  public name = '';

  constructor(cid: string, size: number, name = '') {
    this.cid = cid;
    this.size = size;
    this.name = name;
  }
}

/**
 * The `Tag` class represents a DAG Node tag.
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
export class Tag {
  /**
   * The key of the tag.
   */
  public key: string;

  /**
   * The value of the tag.
   */
  public value: string;

  constructor(key: string, value: string) {
    this.key = key;
    this.value = value;
  }
}

/**
 * The `DagNode` class represents a node in a Directed Acyclic Graph (DAG).
 *
 * @group Directed Acyclic Graph (DAG)
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

  /**
   * The links of the node.
   */
  public links: Link[];

  /**
   * The tags of the node.
   */
  public tags: Tag[];

  constructor(data: Uint8Array | string | Buffer, links: Link[] = [], tags: Tag[] = []) {
    this.dataBuffer = Buffer.from(data);
    this.links = links;
    this.tags = tags;
  }

  /**
   * The size of the node in bytes.
   */
  get size() {
    return dag.Node.toBinary(mapDagNodeToAPI(this)).byteLength;
  }

  /**
   * The data of the node as a `Buffer`.
   */
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
 * @extends DagNode
 */
export class DagNodeResponse extends DagNode {
  protected cidObject: Cid;

  constructor(cid: string | Uint8Array | Cid, data: Uint8Array, dagLinks: dag.Link[] = [], tags: dag.Tag[] = []) {
    const links = dagLinks.map((link) => ({ ...link, cid: new Cid(link.cid).toString() }));

    super(new Uint8Array(data), links, tags);

    this.cidObject = new Cid(cid);
  }

  /**
   * The content identifier of the response as a string.
   */
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
