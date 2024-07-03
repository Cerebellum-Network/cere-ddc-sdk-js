import { Stats, createReadStream } from 'fs';
import { DdcClient, File } from '@cere-ddc-sdk/ddc-client';

export type UploadFileOptions = {
  bucketId: string;
  name?: string;
  accessToken?: string;
  correlationId?: string;
};

export const uploadFile = async (
  client: DdcClient,
  path: string,
  stats: Stats,
  { name, bucketId, accessToken, correlationId }: UploadFileOptions,
) => {
  const fileStream = createReadStream(path);
  const ddcFile = new File(fileStream, { size: stats.size });

  const fileUri = await client.store(BigInt(bucketId), ddcFile, { name, accessToken, correlationId });

  return fileUri.cid;
};
