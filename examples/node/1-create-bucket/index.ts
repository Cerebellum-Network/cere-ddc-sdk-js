import { DdcClient, UriSigner } from '@cere-ddc-sdk/ddc-client';
import type { ClusterId } from '@cere-ddc-sdk/blockchain';

const CERE = 10_000_000_000n;

/**
 * The wallet should have enough CERE to pay for the transaction fees
 */
const user = 'material own find flush hour view off begin crater weather world arrow';

/**
 * The DDC cluster where the bucket will be created (mainnet cluster id is
 * '0x0059f5ada35eee46802d80750d5ca4a490640511')
 */
const clusterId: ClusterId = '0x825c4b2352850de9986d9d28568db6f0c023a1e3';

/**
 * Create a DDC client instance and connect it to DDC TESTNET
 */
const client = await DdcClient.create(new UriSigner(user, { type: 'ed25519' }), {
  blockchain: 'testnet',
  clusterId,
  storageUrl: 'https://storage.testnet.dragon-1.xyz',
  cdnUrl: 'https://cdn.testnet.dragon-1.xyz',
});

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
const bucketId = await client.createBucket({
  isPublic: true,
});

console.log('Public bucket created', bucketId);
console.log('Copy the bucket ID and use it in other examples');

/**
 * Disconnect the client
 */
await client.disconnect();
