import {BucketId} from '@cere-ddc-sdk/smart-contract/types';
import {Cid} from '@cere-ddc-sdk/ddc';

export type DdcEntity = 'file' | 'dag-node';

export type DdcUriOptions = {
    name?: string;
};

export class DdcUri<T extends DdcEntity = DdcEntity> {
    readonly cid?: string;
    readonly name?: string;

    constructor(readonly bucketId: BucketId, cidOrName: string, readonly entity: T, options?: DdcUriOptions) {
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

export class FileUri extends DdcUri<'file'> {
    constructor(bucketId: BucketId, cidOrName: string, options?: DdcUriOptions) {
        super(bucketId, cidOrName, 'file', options);
    }
}

export class DagNodeUri extends DdcUri<'dag-node'> {
    constructor(bucketId: BucketId, cidOrName: string, options?: DdcUriOptions) {
        super(bucketId, cidOrName, 'dag-node', options);
    }
}
