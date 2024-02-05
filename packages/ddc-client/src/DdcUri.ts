import type { BucketId } from '@cere-ddc-sdk/blockchain';
import { Cid } from '@cere-ddc-sdk/ddc';

export type DdcEntity = 'file' | 'dag-node';

export type DdcUriOptions = {
  name?: string;
};

/**
 * A generic representation of a DDC URI.
 *
 * @property bucketId The bucket identifier.
 * @property cid The Content Identifier (CID) of the entity.
 * @property name The name of the entity.
 * @property entity The type of the entity.
 * @property cidOrName The CID or name of the entity.
 *
 * @template T The type of the entity. Must extend DdcEntity.
 */
export class DdcUri<T extends DdcEntity = DdcEntity> {
  readonly cid: string = '';
  readonly name?: string;

  constructor(
    readonly bucketId: BucketId,
    cidOrName: string,
    readonly entity: T,
    options?: DdcUriOptions,
  ) {
    this.name = options?.name;

    if (Cid.isCid(cidOrName)) {
      this.cid = cidOrName;
    } else {
      this.name ??= cidOrName;
    }
  }

  get cidOrName() {
    const cidOrName = this.cid || this.name;

    if (!cidOrName) {
      throw new Error('Invalid DdcUri: both CID and Name are empty');
    }

    return cidOrName;
  }
}

/**
 * Represents a URI for a file in DDC.
 *
 * A FileUri extends the DdcUri class with the entity type set to 'file'.
 *
 * @group Files
 */
export class FileUri extends DdcUri<'file'> {
  constructor(bucketId: BucketId, cidOrName: string, options?: DdcUriOptions) {
    super(bucketId, cidOrName, 'file', options);
  }
}

/**
 * Represents a URI for a DAG (Directed Acyclic Graph) node in DDC.
 *
 * A DagNodeUri extends the DdcUri class with the entity type set to 'dag-node'.
 *
 * @group Directed Acyclic Graph (DAG)
 */
export class DagNodeUri extends DdcUri<'dag-node'> {
  constructor(bucketId: BucketId, cidOrName: string, options?: DdcUriOptions) {
    super(bucketId, cidOrName, 'dag-node', options);
  }
}
