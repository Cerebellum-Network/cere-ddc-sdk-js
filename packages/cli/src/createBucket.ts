import { DdcClient } from '@cere-ddc-sdk/ddc-client';

export type CreateBucketOptions = {
  isPublic: boolean;
  clusterId: string;
};

export const createBucket = async (client: DdcClient, options: CreateBucketOptions) => {
  // TODO(Task 3): `options.clusterId` is now redundant with the `clusterId` on the
  // client's own config (single-cluster SDK); drop it from `CreateBucketOptions`/the
  // CLI `--clusterId` flag once callers are updated.
  return client.createBucket({
    isPublic: options.isPublic,
  });
};
