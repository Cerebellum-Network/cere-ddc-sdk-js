import path from 'path';
import fs from 'fs/promises';
import { Stats, createReadStream } from 'fs';
import { fileURLToPath } from 'url';
import { DdcClient, File, Link, DagNode, TESTNET } from '@cere-ddc-sdk/ddc-client';

/**
 * The wallet should have enough CERE to pay for the transaction fees
 */
const user = 'hybrid label reunion only dawn maze asset draft cousin height flock nation';

/**
 * The DDC bucket where the file will be stored
 */
const bucketId = 12068n;

/**
 * Detect the current directory
 */
const rootDir = path.dirname(fileURLToPath(import.meta.url));

/**
 * The website directory to be uploaded
 */
const websiteDir = path.resolve(rootDir, 'website');

/**
 * The website CNS name
 */
const websiteCnsName = 'website-example';

/**
 * Create a DDC client instance and connect it to DDC TESTNET
 */
const client = await DdcClient.create(user, TESTNET);

/**
 * Uploads a file into DDC and returns a DAG link to it
 */
async function uploadFile(filePath: string, { size }: Stats) {
  const fileStream = createReadStream(filePath);
  const file = new File(fileStream, { size });

  const { cid } = await client.store(bucketId, file);

  console.log('File:', path.relative(rootDir, filePath), 'stored into bucket', bucketId, 'with CID', cid);

  return new Link(cid, size, path.relative(websiteDir, filePath));
}

/**
 * Traverse the website directory and upload all files into DDC. Returns a list of DAG links to the files.
 */
async function uploadDir(dir = websiteDir) {
  const links: Promise<Link>[] = [];
  const files = await fs.readdir(dir);

  for (const fileName of files) {
    const filePath = path.join(dir, fileName);
    const stats = await fs.stat(filePath);
    const subLinks = stats.isDirectory() ? await uploadDir(filePath) : [uploadFile(filePath, stats)];

    links.push(...subLinks);
  }

  return links;
}

console.log('Uploading website from', websiteDir, 'to bucket', bucketId);
const fileLinks = await Promise.all(await uploadDir(websiteDir));

/**
 * Create and store a DAG node with the list of links to the website files
 */
const websiteNode = new DagNode('v1.0.0', fileLinks);
const websiteNodeUri = await client.store(bucketId, websiteNode, {
  name: websiteCnsName,
});

console.log('Website uploaded into bucket', bucketId, 'with CID', websiteNodeUri.cid);
console.log(
  'The website can be accessed by this URL',
  `https://storage.testnet.cere.network/${bucketId}/${websiteCnsName}`,
);

/**
 * Disconnect the client
 */
await client.disconnect();
