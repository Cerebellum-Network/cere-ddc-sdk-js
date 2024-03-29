import { base32 } from 'multiformats/bases/base32';

export type CidContentType = 'dag-node' | 'raw-piece' | 'multipart-piece' | 'none';

const cidContentTypeMap: CidContentType[] = ['none', 'dag-node', 'raw-piece', 'multipart-piece'];

/**
 * The `Cid` class represents a Content Identifier (CID) in DDC.
 *
 * @internal
 */
export class Cid {
  private cid: Uint8Array | string;

  constructor(cid: string | Uint8Array | Cid) {
    this.cid = cid instanceof Cid ? cid.toBytes() : cid;
  }

  /**
   * The content hash of the CID.
   */
  get contentHash() {
    return this.toBytes().slice(-32);
  }

  get contentType() {
    return cidContentTypeMap[this.toBytes()[1]];
  }

  /**
   * Converts the CID to a string.
   *
   * @returns The CID as a string.
   */
  toString(): string {
    return typeof this.cid === 'string' ? this.cid : base32.encode(this.cid);
  }

  /**
   * Converts the CID to a `Uint8Array`.
   *
   * @returns The CID as a `Uint8Array`.
   */
  toBytes(): Uint8Array {
    return typeof this.cid === 'string' ? base32.decode(this.cid) : this.cid;
  }

  /**
   * Checks if an object is an instance of `Cid`.
   *
   * @param object - The object to check.
   *
   * @returns `true` if the object is an instance of `Cid` or has the same properties as a `Cid`, `false` otherwise.
   */
  static isCid(cid: string | Uint8Array) {
    try {
      const bytes = new Cid(cid).toBytes();

      return bytes.byteLength > 32; // TODO: Implement proper CID parsing and detection
    } catch {
      return false;
    }
  }
}
