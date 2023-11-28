import * as cns from './CnsApi';
import { Cid } from './Cid';
import { Signature } from './signature';

export class CnsRecord implements Omit<cns.Record, 'cid' | 'signature'> {
  constructor(
    readonly cid: string,
    readonly name: string,
  ) {}

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
