import { DdcClient } from '@cere-ddc-sdk/ddc-client';

export type CreateBucketOptions = {
  isPublic: boolean;
  clusterId: string;
};

export const createBucket = async (client: DdcClient, options: CreateBucketOptions) => {
  const clusterId = options.clusterId as `0x${string}`;

  return client.createBucket(clusterId, {
    isPublic: options.isPublic,
  });
};
