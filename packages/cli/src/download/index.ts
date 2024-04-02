import fs from 'fs/promises';
import path from 'path';
import { Cid } from '@cere-ddc-sdk/ddc';
import { DdcClient } from '@cere-ddc-sdk/ddc-client';
import { downloadDir } from './downloadDir';
import { downloadFile } from './downloadFile';

export type DownloadOptions = {
  bucketId: string;
  accessToken?: string;
};

export const download = async (client: DdcClient, source: string, dest: string, options: DownloadOptions) => {
  const bucketId = BigInt(options.bucketId);
  const isCid = Cid.isCid(source);
  const cid = await client.resolveName(bucketId, source, {
    accessToken: options.accessToken,
  });

  if (!cid) {
    throw new Error(`Could not resolve CID for name "${source}"`);
  }

  const stats = await fs.stat(dest).catch(() => null);
  const isRealDir = stats?.isDirectory() || false;
  const isDirPath = dest.endsWith('/');
  const { contentType } = new Cid(cid);
  const isDag = contentType === 'dag-node';

  let destPath: string;

  if (isDag) {
    destPath = isDirPath ? path.join(dest, source) : dest;

    await downloadDir(client, source, destPath, options);
  } else {
    destPath = isDirPath || isRealDir ? path.join(dest, source) : dest;

    await downloadFile(client, source, destPath, options);
  }

  return {
    isDirectory: isDag,
    cnsName: isCid ? null : source,
    dest: destPath,
    cid: cid.toString(),
  };
};
