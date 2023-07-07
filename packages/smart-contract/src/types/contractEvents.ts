import {AccountId, BucketId, ClusterId} from './contractTypes';

export type ContractEventArgsMap = {
    ClusterCreated: {
        clusterId: ClusterId;
        manager: AccountId;
    };

    CdnClusterCreated: {
        clusterId: ClusterId;
        manager: AccountId;
    };

    BucketCreated: {
        bucketId: BucketId;
        ownerId: AccountId;
    };
};

export type ContractEvent = keyof ContractEventArgsMap;
export type ContractEventArgs<T extends ContractEvent> = ContractEventArgsMap[T];
