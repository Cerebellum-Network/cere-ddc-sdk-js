import * as fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { UriSigner, TESTNET } from '@cere-ddc-sdk/ddc-client';
import { connect } from '@cere-ddc-sdk/blockchain';

import JSONBig from 'json-bigint';

/**
 * Sudo account mnemonic. Make sure you never publish it.
 */
const sudo = new UriSigner('bottom drive obey lake curtain smoke basket hold race lonely fit walk');

/**
 * Create the blockchain RPC client instance and connect it to DDC TESTNET.
 */
const client = connect(TESTNET.blockchain);

/**
 * Get a list of existing buckets.
 */
const buckets = await client.customers.listBuckets();
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

  const removeBucketTx = client.customers.removeBuckets(...bucketIds);
  const sudoAsTx = client.tx.sudoAs(ownerId, removeBucketTx);

  const response = await client.tx.send(sudoAsTx, { signer: sudo });
  const removedBucketIds = client.customers.extractRemovedBucketIds(response.events);
  console.log('\tBuckets', removedBucketIds, 'removed in TX:', response.txHash);
}

/**
 * Disconnect from the RPC node.
 */
client.disconnect();
