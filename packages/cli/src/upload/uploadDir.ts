import { Stats } from 'fs';
import fs from 'fs/promises';
import path from 'path';
import { DagNode, DdcClient, Link } from '@cere-ddc-sdk/ddc-client';

import { uploadFile } from './uploadFile';

export type UploadDirOptions = {
  bucketId: string;
  name?: string;
};

async function uploadFileLink(client: DdcClient, bucketId: bigint, rootDir: string, filePath: string, stats: Stats) {
  const cid = await uploadFile(client, filePath, stats, {
    bucketId: bucketId.toString(),
  });

  return new Link(cid, stats.size, path.relative(rootDir, filePath));
}

async function uploadDirLinks(client: DdcClient, bucketId: bigint, rootDir: string, currentDir?: string) {
  const links: Promise<Link>[] = [];
  const dir = currentDir || rootDir;
  const files = await fs.readdir(dir);

  for (const fileName of files) {
    // Skip hidden files
    if (fileName.startsWith('.')) {
      continue;
    }

    const filePath = path.join(dir, fileName);
    const stats = await fs.stat(filePath);
    const subLinks = stats.isDirectory()
      ? await uploadDirLinks(client, bucketId, rootDir, filePath)
      : [uploadFileLink(client, bucketId, rootDir, filePath, stats)];

    links.push(...subLinks);
  }

  return links;
}

export const uploadDir = async (client: DdcClient, path: string, options: UploadDirOptions) => {
  const bucketId = BigInt(options.bucketId);
  const linkPromises = await uploadDirLinks(client, bucketId, path);
  const fileLinks = await Promise.all(linkPromises);

  const rootDagNode = new DagNode(new Date().toISOString(), fileLinks);
  const rootDagNodeUri = await client.store(bucketId, rootDagNode, {
    name: options.name,
  });

  return rootDagNodeUri.cid;
};