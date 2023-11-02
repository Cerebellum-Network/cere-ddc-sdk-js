export type DdcEntity = 'file' | 'dag-node';

export type FileUri = DdcUri<'file'>;
export type DagNodeUri = DdcUri<'dag-node'>;

export class DdcUri<T extends DdcEntity = DdcEntity> {
    constructor(readonly bucketId: number, readonly cid: string, readonly entity: T) {}
}
