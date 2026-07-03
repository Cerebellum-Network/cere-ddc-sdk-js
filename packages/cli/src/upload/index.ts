import fs from 'fs/promises';

import { uploadDir } from './uploadDir';
import { uploadFile } from './uploadFile';
import { DdcClient } from '@cere-ddc-sdk/ddc-client';

export type UploadOptions = {
  bucketId: string;
  name?: string;
  correlationId?: string;
};

export const upload = async (client: DdcClient, path: string, options: UploadOptions) => {
  const stats = await fs.stat(path);
  const isDirectory = stats.isDirectory();

  const uploadPromise = isDirectory ? uploadDir(client, path, options) : uploadFile(client, path, stats, options);

  return {
    isDirectory,
    cid: await uploadPromise,
  };
};
