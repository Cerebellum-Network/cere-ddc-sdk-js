import { connect } from '@cere-ddc-sdk/blockchain/papi';

const describeChain = process.env.CERE_CHAIN_TESTS ? describe : describe.skip;

describeChain('papi customers — buckets (live, devnet)', () => {
  it('getBucketsCount + listBuckets return domain shapes; getBucket round-trips / undefined', async () => {
    const client = connect({ network: 'devnet' });
    try {
      const count = await client.customers.getBucketsCount();
      expect(count).toBeGreaterThanOrEqual(0);
      const buckets = await client.customers.listBuckets();
      expect(Array.isArray(buckets)).toBe(true);
      if (buckets.length) {
        const b = buckets[0];
        expect(typeof b.bucketId).toBe('bigint');
        expect(typeof b.isPublic).toBe('boolean');
        const found = await client.customers.getBucket(b.bucketId);
        expect(found?.bucketId).toBe(b.bucketId);
      }
      const missing = await client.customers.getBucket(2n ** 62n);
      expect(missing).toBeUndefined();
    } finally {
      client.disconnect();
    }
  }, 60_000);

  it('bucket write builders encode + are runtime-compatible (no submit)', async () => {
    const { Binary } = await import('polkadot-api');
    const client = connect({ network: 'devnet' });
    try {
      const clusterId = (await client.api.query.DdcClusters.Clusters.getEntries())[0].keyArgs[0];
      const create = client.customers.createBucket(clusterId as any, { isPublic: true });
      expect(Binary.toHex(await create.getEncodedData())).toMatch(/^0x/);
      const setp = client.customers.setBucketParams(1n, { isPublic: false });
      expect(Binary.toHex(await setp.getEncodedData())).toMatch(/^0x/);
      const rm = client.customers.removeBuckets(1n);
      expect(Binary.toHex(await rm.getEncodedData())).toMatch(/^0x/);
      const rmBatch = client.customers.removeBuckets(1n, 2n);
      expect(Binary.toHex(await rmBatch.getEncodedData())).toMatch(/^0x/);
      await client.assertCompatible('DdcCustomers', 'create_bucket');
      await client.assertCompatible('DdcCustomers', 'set_bucket_params');
      await client.assertCompatible('DdcCustomers', 'remove_bucket');
    } finally {
      client.disconnect();
    }
  }, 60_000);
});
