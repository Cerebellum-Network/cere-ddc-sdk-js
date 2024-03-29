import * as cns from './CnsApi';
import { Cid } from './Cid';
import { Signature } from './signature';

/**
 * The `CnsRecord` class represents a CNS record.
 *
 * @group Content Name System (CNS)
 *
 * @example
 *
 * ```typescript
 * const cid = '...';
 * const name = 'example';
 * const record = new CnsRecord(cid, name);
 *
 * console.log(CnsRecord.isCnsRecord(record)); // true
 * ```
 */
export class CnsRecord implements Omit<cns.Record, 'cid' | 'signature'> {
  /**
   * The content identifier (CID) of the CNS record.
   */
  readonly cid: string;

  /**
   * The name of the CNS record.
   */
  readonly name: string;

  constructor(cid: string, name: string) {
    this.cid = cid;
    this.name = name;
  }

  /**
   * Checks if an object is an instance of `CnsRecord`.
   *
   * @param object - The object to check.
   *
   * @returns `true` if the object is an instance of `CnsRecord` or has the same properties as a `CnsRecord`, `false` otherwise.
   */
  static isCnsRecord(object: unknown): object is CnsRecord {
    const maybeRecord = object as CnsRecord | null;

    if (object instanceof CnsRecord) {
      return true;
    }

    return (
      typeof maybeRecord === 'object' && typeof maybeRecord?.cid === 'string' && typeof maybeRecord.name === 'string'
    );
  }
}

/**
 * The `CnsRecordResponse` class represents a response for a CNS record.
 *
 * @group Content Name System (CNS)
 */
export class CnsRecordResponse extends CnsRecord {
  /**
   * The signature of the response as a `Signature` object.
   */
  readonly signature: Signature;

  constructor(cid: string | Uint8Array, name: string, signature: Signature) {
    super(new Cid(cid).toString(), name);

    this.signature = signature;
  }
}

export const mapCnsRecordToAPI = ({ name, cid }: CnsRecord): Omit<cns.Record, 'signature'> => ({
  name,
  cid: new Cid(cid).toBytes(),
});
