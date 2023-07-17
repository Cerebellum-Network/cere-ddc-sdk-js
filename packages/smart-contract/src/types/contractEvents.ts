import {AccountId, Balance, BucketId, ClusterId, NodeId, Params} from './contractTypes';

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
        nodeId: NodeId;
        providerId: AccountId;
        rentPerMonth: Balance;
        nodeParams: Params;
    };
};

export type ContractEvent = keyof ContractEventArgsMap;
export type ContractEventArgs<T extends ContractEvent> = ContractEventArgsMap[T];
