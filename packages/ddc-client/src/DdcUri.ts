export type DdcEntity = 'file' | 'dag-node';

export class DdcUri<T extends DdcEntity = DdcEntity> {
    constructor(readonly bucketId: number, readonly cid: string, readonly entity: T) {}
}

export class FileUri extends DdcUri<'file'> {
    constructor(bucketId: number, cid: string) {
        super(bucketId, cid, 'file');
    }
}

export class DagNodeUri extends DdcUri<'dag-node'> {
    constructor(bucketId: number, cid: string) {
        super(bucketId, cid, 'dag-node');
    }
}
