import { DdcClient, File, JsonSigner } from '@cere-ddc-sdk/ddc-client';
import type { ClusterId } from '@cere-ddc-sdk/blockchain';
import * as fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// The wallet should have enough CERE to pay for the transaction fees
const pathToAccount = './6S5nrcLgUrhC2tLpaG83VLrMndnQ66DPTz7j6PoRnQjZKpvx.json';
const accountPassphrase = '1234';

// The DDC cluster where the bucket lives
const clusterId: ClusterId = '0x825c4b2352850de9986d9d28568db6f0c023a1e3';

// The DDC bucket where the file will be stored
const bucketId = BigInt(448920);

// Detect the current directory
const dir = path.dirname(fileURLToPath(import.meta.url));

// Create DDC client instance using JSON account exported from Cere Wallet
const keyringPair = JSON.parse(fs.readFileSync(path.resolve(dir, pathToAccount)).toString());
const jsonSigner = new JsonSigner(keyringPair, accountPassphrase);
const client = await DdcClient.create(jsonSigner, {
  blockchain: 'testnet',
  clusterId,
  storageUrl: 'https://storage.testnet.dragon-1.xyz',
  cdnUrl: 'https://cdn.testnet.dragon-1.xyz',
});

// Upload file
const pathToFileToUpload = path.resolve(dir, '../assets/nature.jpg');
const fileToUpload = new File(fs.createReadStream(pathToFileToUpload), { size: fs.statSync(pathToFileToUpload).size });
const uploadedFileUri = await client.store(bucketId, fileToUpload);
console.log(
  'The file can be accessed by this URL',
  `https://cdn.testnet.dragon-1.xyz/${bucketId}/${uploadedFileUri.cid}`,
);
console.log('File stored into bucket', bucketId, 'with CID', uploadedFileUri.cid);

await client.disconnect();
