import {
  DdcClient,
  File,
  Link,
  DagNodeUri,
  DagNode,
  JsonSigner,
  TESTNET,
} from '@cere-ddc-sdk/ddc-client';
import * as fs from 'fs';
import {fileURLToPath} from 'url';
import path from 'path';

// The wallet should have enough CERE to pay for the transaction fees
const pathToAccount = './6S5nrcLgUrhC2tLpaG83VLrMndnQ66DPTz7j6PoRnQjZKpvx.json';
const accountPassphrase = '1234';

// The DDC bucket where the file will be stored
const bucketId = BigInt(448924);

// Detect the current directory
const dir = path.dirname(fileURLToPath(import.meta.url));

const pathToFileToUpload = path.resolve(dir, '../assets/nature.jpg');
const fileName = pathToFileToUpload.substring(pathToFileToUpload.lastIndexOf('/') + 1);

// Initialise client using JSON account exported from Cere Wallet
const keyringPair = JSON.parse(fs.readFileSync(path.resolve(dir, pathToAccount)).toString());
const jsonSigner = new JsonSigner(keyringPair, {passphrase: accountPassphrase});
const client = await DdcClient.create(jsonSigner, {...TESTNET, logLevel: 'fatal'});

// Upload file
const fileSize = fs.statSync(pathToFileToUpload).size;
const fileToUpload = new File(fs.createReadStream(pathToFileToUpload), {
  size: fileSize,
});
const uploadedFileUri = await client.store(bucketId, fileToUpload);
console.log('File stored into bucket', bucketId, 'with CID', uploadedFileUri.cid);
console.log('The file can be accessed by this URL', `https://cdn.testnet.cere.network/${bucketId}/${uploadedFileUri.cid}`);

// Attach uploaded file to 'fs' DAG node (where 'fs' is a CNS name used by Developer Console to index files)
const filePathInDeveloperConsole = 'photos/nature/';
const rootDagNode = await client.read(new DagNodeUri(bucketId, 'fs'), {cacheControl: 'no-cache'})
  .catch((res) => {
    if (res.message == 'Cannot resolve CNS name: "fs"') {
      return new DagNode(null);
    } else {
      throw new Error('Failed to fetch \'fs\' DAG node');
    }
  });
rootDagNode.links.push(new Link(uploadedFileUri.cid, fileSize, filePathInDeveloperConsole + fileName));
await client.store(bucketId, rootDagNode, {name: 'fs'});
console.log('The file can be found in developer console in bucket', bucketId, 'and path is', filePathInDeveloperConsole);

await client.disconnect();
