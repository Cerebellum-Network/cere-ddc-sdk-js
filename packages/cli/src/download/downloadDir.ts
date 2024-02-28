import fs from 'fs/promises';
import path from 'path';
import { DagNodeUri, DdcClient } from '@cere-ddc-sdk/ddc-client';

import { downloadFile } from './downloadFile';
import { isCLIDirData } from '../upload/uploadDir';

export type DownloadDirOptions = {
  bucketId: string;
};

export const downloadDir = async (
  client: DdcClient,
  source: string,
  dest: string,
  { bucketId }: DownloadDirOptions,
) => {
  const dagUri = new DagNodeUri(BigInt(bucketId), source);
  const response = await client.read(dagUri);

  try {
    const data = JSON.parse(response.data.toString());

    if (!isCLIDirData(data)) {
      throw new Error();
    }
  } catch (e) {
    throw new Error('The requested directory was not uploaded by the CLI.');
  }

  await fs.mkdir(dest, { recursive: true });
  const promises = response.links.map((link) => {
    const filePath = path.join(dest, link.name);

    return downloadFile(client, link.cid, filePath, { bucketId });
  });

  await Promise.all(promises);
};
