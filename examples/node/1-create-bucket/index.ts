import { DdcClient, TESTNET } from '@cere-ddc-sdk/ddc-client';

const CERE = 10_000_000_000n;

/**
 * The wallet should have enough CERE to pay for the transaction fees
 */
const user = 'hybrid label reunion only dawn maze asset draft cousin height flock nation';

/**
 * The DDC cluster where the bucket will be created
 */
const clusterId = '0x825c4b2352850de9986d9d28568db6f0c023a1e3';

/**
 * Create a DDC client instance and connect it to DDC TESTNET
 */
const client = await DdcClient.create(user, TESTNET);

/**
 * Get current deposit of the DDC customer
 */
const deposit = await client.getDeposit();
console.log('Current deposit', deposit / CERE, 'CERE');

/**
 * If the deposit is 0, deposit 5 CERE
 */
if (deposit === 0n) {
  await client.depositBalance(5n * CERE);
  console.log('Deposited 5 CERE');
}

/**
 * Create a public bucket
 */
const bucketId = await client.createBucket(clusterId, {
  isPublic: true,
});

console.log('Public bucket created', bucketId);
console.log('Copy the bucket ID and use it in other examples');

/**
 * Disconnect the client
 */
await client.disconnect();
