export type DdcEntity = 'file' | 'dag-node';

export class DdcUri<T extends DdcEntity = DdcEntity> {
    constructor(readonly bucketId: number, readonly cid: string, readonly entity: T) {}
}
