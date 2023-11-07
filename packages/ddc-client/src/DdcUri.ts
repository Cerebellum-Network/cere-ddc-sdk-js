import {BucketId} from '@cere-ddc-sdk/smart-contract/types';
import {Cid} from '@cere-ddc-sdk/ddc';

export type DdcEntity = 'file' | 'dag-node';

export class DdcUri<T extends DdcEntity = DdcEntity> {
    readonly cid?: string;
    readonly name?: string;

    constructor(readonly bucketId: BucketId, readonly cidOrName: string, readonly entity: T) {
        if (Cid.isCid(cidOrName)) {
            this.cid = cidOrName;
        } else {
            this.name = cidOrName;
        }
    }
}

export class FileUri extends DdcUri<'file'> {
    constructor(bucketId: BucketId, cidOrName: string) {
        super(bucketId, cidOrName, 'file');
    }
}

export class DagNodeUri extends DdcUri<'dag-node'> {
    constructor(bucketId: BucketId, cidOrName: string) {
        super(bucketId, cidOrName, 'dag-node');
    }
}
