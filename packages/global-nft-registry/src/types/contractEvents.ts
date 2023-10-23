import {AccountId, Balance, BucketId, ClusterId, NodeKey, Params} from './contractTypes';

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

    NodeCreated: {
        nodeKey: NodeKey;
        providerId: AccountId;
        rentPerMonth: Balance;
        nodeParams: Params;
    };

    CdnNodeCreated: {
        cdnNodeKey: NodeKey;
        providerId: AccountId;
        cdnNodeParams: Params;
        undistributedPayment: Balance;
    };
};

export type ContractEvent = keyof ContractEventArgsMap;
export type ContractEventArgs<T extends ContractEvent> = ContractEventArgsMap[T];
