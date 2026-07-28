import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { DdcClient, File } from '@cere-ddc-sdk/ddc-client';
import type { ClusterId } from '@cere-ddc-sdk/blockchain';

/**
 * The wallet should have enough CERE to pay for the transaction fees
 */
const user = 'hybrid label reunion only dawn maze asset draft cousin height flock nation';

/**
 * The DDC cluster where the bucket lives
 */
const clusterId: ClusterId = '0x825c4b2352850de9986d9d28568db6f0c023a1e3';

/**
 * The DDC bucket where the file will be stored
 */
const bucketId = 12068n;

/**
 * Detect the current directory
 */
const dir = path.dirname(fileURLToPath(import.meta.url));

/**
 * The file to be stored
 */
const inputFilePath = path.resolve(dir, '../assets/nature.jpg');

/**
 * The path to store the downloaded file
 */
const outputFilePath = path.resolve(dir, '../assets/nature-downloaded.jpg');

/**
 * Create a DDC client instance and connect it to DDC TESTNET
 */
const client = await DdcClient.create(user, {
  blockchain: 'testnet',
  clusterId,
  storageUrl: 'https://storage.testnet.dragon-1.xyz',
  cdnUrl: 'https://cdn.testnet.dragon-1.xyz',
});

/**
 * Read the file stats
 */
const inputFileStats = fs.statSync(inputFilePath);

/**
 * Create the file read stream
 */
const inputFileStream = fs.createReadStream(inputFilePath);

/**
 * Create a DDC file instance
 */
const ddcFile = new File(inputFileStream, {
  size: inputFileStats.size,
});

/**
 * Store the file into DDC
 */
const fileUri = await client.store(bucketId, ddcFile);
console.log('File stored into bucket', bucketId, 'with CID', fileUri.cid);
console.log('The file can be accessed by this URL', `https://cdn.testnet.dragon-1.xyz/${bucketId}/${fileUri.cid}`);

/**
 * Read the file from DDC
 */
const fileResponse = await client.read(fileUri);
const outputFileStream = fs.createWriteStream(outputFilePath);

/**
 * Stream the content to the destination file
 */
await pipeline(Readable.fromWeb(fileResponse.body), outputFileStream);
console.log('The file downloaded to', path.basename(outputFilePath));

/**
 * Disconnect the client
 */
await client.disconnect();
