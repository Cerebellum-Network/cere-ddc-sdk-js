import { DdcClient, File, TESTNET, AuthToken, UriSigner, AuthTokenOperation } from '@cere-ddc-sdk/ddc-client';
import path from 'path';
import { fileURLToPath } from 'url';
import * as fs from 'fs';

// The Bob's wallet should have enough CERE to pay for the transaction fees
const bob = 'hybrid label reunion only dawn maze asset draft cousin height flock nation';
const bobSigner = new UriSigner(bob);
/**
 * The Alice wallet doesn't require any tokens because it accesses Bob's bucket so Bob pays for it.
 * Actually the Alice doesn't need to have a wallet on blockchain, it can be a simple key pair used to sign access tokens.
 */
const alice = 'system visit notice before step medal top theme oblige river inner bracket';
const aliceSigner = new UriSigner(alice);

// The DDC cluster where the bucket will be created (mainnet cluster id is '0x0059f5ada35eee46802d80750d5ca4a490640511')
const clusterId = '0x825c4b2352850de9986d9d28568db6f0c023a1e3';

// Create a DDC client instance
const client = await DdcClient.create(bob, TESTNET);

// Create a private bucket
const bucketId = await client.createBucket(clusterId, { isPublic: false });
console.log('Private bucket created', bucketId);

// Detect the current directory
const dir = path.dirname(fileURLToPath(import.meta.url));

const pathToFileToUpload = path.resolve(dir, '../assets/nature.jpg');

// Upload file
const fileSize = fs.statSync(pathToFileToUpload).size;
const fileToUpload = new File(fs.createReadStream(pathToFileToUpload), { size: fileSize });
const uploadedFileUri = await client.store(bucketId, fileToUpload);
console.log('File stored into bucket', bucketId, 'with CID', uploadedFileUri.cid);
console.log(
  "The file can't be accessed by this URL because bucket is private and access token required",
  `https://cdn.testnet.cere.network/${bucketId}/${uploadedFileUri.cid}`,
);

// Create an access token that is signed by a Bob and can be shared so that anyone having this token can access a bucket (or specific file)
const bobToken = new AuthToken({
  bucketId,
  pieceCid: uploadedFileUri.cid,
  operations: [AuthTokenOperation.GET],
});
await bobToken.sign(bobSigner);
console.log(
  "The file can be accessed by this URL (Bob's token passed in query parameters)",
  `https://cdn.testnet.cere.network/${bucketId}/${uploadedFileUri.cid}?token=${bobToken.toString()}`,
);

/**
 * Create an access token that is signed by a Bob and is granted to Alice so that only Alice can use this token to access a content.
 * The Bobs token can't be used directly because he has specified an Alice in a token 'subject' so this token should be wrapped into another token that is signed by Alice
 */
const bobTokenGrantedToAlice = await client.grantAccess(aliceSigner.address, {
  bucketId,
  operations: [AuthTokenOperation.GET],
  pieceCid: uploadedFileUri.cid,
});
// Alice wraps Bob's token (aka token chain) and sign wrapped token by Alice key pair. The token expiration time is 5 minutes.
const aliceToken = new AuthToken({
  operations: [AuthTokenOperation.GET],
  pieceCid: uploadedFileUri.cid,
  prev: bobTokenGrantedToAlice,
  expiresIn: 5 * 60 * 1000,
});
await aliceToken.sign(aliceSigner);
console.log(
  "The file can be accessed by this URL (Alice's token passed in query parameters)",
  `https://cdn.testnet.cere.network/${bucketId}/${uploadedFileUri.cid}?token=${aliceToken.toString()}`,
);

await client.disconnect();
