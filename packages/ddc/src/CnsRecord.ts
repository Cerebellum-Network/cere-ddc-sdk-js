import * as cns from './CnsApi';
import { Cid } from './Cid';
import { Signature } from './signature';

/**
 * The `CnsRecord` class represents a CNS record.
 *
 * @group Content Name System (CNS)
 * @property cid - The content identifier of the CNS record.
 * @property name - The name of the CNS record.
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
  constructor(
    readonly cid: string,
    readonly name: string,
  ) {}

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
 * @property signature - The signature of the response as a `Signature` object.
 */
export class CnsRecordResponse extends CnsRecord {
  constructor(
    cid: string | Uint8Array,
    name: string,
    readonly signature: Signature,
  ) {
    const cidObject = new Cid(cid);

    super(cidObject.toString(), name);
  }
}

export const mapCnsRecordToAPI = ({ name, cid }: CnsRecord): Omit<cns.Record, 'signature'> => ({
  name,
  cid: new Cid(cid).toBytes(),
});
