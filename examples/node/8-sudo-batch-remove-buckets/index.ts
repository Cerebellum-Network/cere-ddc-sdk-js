import * as fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { UriSigner, TESTNET } from '@cere-ddc-sdk/ddc-client';
import { Blockchain } from '@cere-ddc-sdk/blockchain';

import JSONBig from 'json-bigint';

/**
 * Sudo account mnemonic. Make sure you never publish it.
 */
const sudo = new UriSigner('bottom drive obey lake curtain smoke basket hold race lonely fit walk');

/**
 * Create the blockchain RPC client instance and connect it to DDC TESTNET.
 */
const blockchain = new Blockchain({ wsEndpoint: TESTNET.blockchain });
await blockchain.isReady();

/**
 * Get a list of existing buckets.
 */
const buckets = await blockchain.ddcCustomers.listBuckets();
console.log('Total number of buckets:', buckets.length);

/**
 * Make a list of buckets to remove.
 */
const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)));
const parse = JSONBig({ useNativeBigInt: true, alwaysParseAsBig: true }).parse;
const keep = parse(fs.readFileSync(path.resolve(dir, 'keep.json')).toString());
const bucketsToRemove = buckets
  .filter((bucket) => !bucket.isRemoved)
  .filter((bucket) => !keep.keepBucketIds.includes(bucket.bucketId))
  .filter((bucket) => !keep.keepBucketsOwnedBy.includes(bucket.ownerId));
console.log('Number of buckets to remove:', bucketsToRemove.length);

/**
 * Group buckets by owner.
 */
const bucketsByOwner = new Map<string, bigint[]>();
for (const bucket of bucketsToRemove) {
  if (!bucketsByOwner.has(bucket.ownerId)) {
    bucketsByOwner.set(bucket.ownerId, []);
  }
  bucketsByOwner.get(bucket.ownerId)!.push(bucket.bucketId);
}

/**
 * Remove buckets, one transaction per owner.
 */
for (const [ownerId, bucketIds] of bucketsByOwner) {
  console.log('Removing buckets for owner:', ownerId);

  const removeBucketTx = blockchain.ddcCustomers.removeBuckets(...bucketIds);
  const sudoAsTx = blockchain.sudoAs(ownerId, removeBucketTx);

  const response = await blockchain.send(sudoAsTx, { account: sudo });
  const removedBucketIds = blockchain.ddcCustomers.extractRemovedBucketIds(response.events);
  console.log('\tBuckets', removedBucketIds, 'removed in TX:', response.txHash);
}

/**
 * Disconnect from the RPC node.
 */
await blockchain.disconnect();
