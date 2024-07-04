import path from 'path';
import { mkdir } from 'fs/promises';
import { createWriteStream } from 'fs';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { DdcClient, FileUri } from '@cere-ddc-sdk/ddc-client';

export type DownloadFileOptions = {
  bucketId: string;
  accessToken?: string;
  correlationId?: string;
};

export const downloadFile = async (
  client: DdcClient,
  source: string,
  dest: string,
  { bucketId, accessToken, correlationId }: DownloadFileOptions,
) => {
  await mkdir(path.dirname(dest), { recursive: true });

  const fileUri = new FileUri(BigInt(bucketId), source);
  const fileResponse = await client.read(fileUri, { accessToken, correlationId });
  const outputFileStream = createWriteStream(dest);

  await pipeline(Readable.fromWeb(fileResponse.body), outputFileStream);
};
