import { DdcClient } from '@cere-ddc-sdk/ddc-client';

export type CreateBucketOptions = {
  isPublic: boolean;
};

export const createBucket = async (client: DdcClient, options: CreateBucketOptions) => {
  return client.createBucket({
    isPublic: options.isPublic,
  });
};
