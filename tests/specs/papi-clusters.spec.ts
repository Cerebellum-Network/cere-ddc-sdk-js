import { Binary } from 'polkadot-api';
import { connect } from '@cere-ddc-sdk/blockchain/papi';
import { ClusterStatus } from '@cere-ddc-sdk/blockchain';

const describeChain = process.env.CERE_CHAIN_TESTS ? describe : describe.skip;

describeChain('papi clusters (live, devnet)', () => {
  it('listClusters() returns camelCase Cluster shapes', async () => {
    const client = connect({ network: 'devnet' });
    try {
      const clusters = await client.clusters.listClusters();
      expect(clusters.length).toBeGreaterThan(0);
      const c = clusters[0];
      expect(c.clusterId).toMatch(/^0x/);
      expect(typeof c.managerId).toBe('string');
      expect(c.props).toHaveProperty('erasureCodingTotal');
      expect(Object.values(ClusterStatus)).toContain(c.status);
    } finally {
      client.disconnect();
    }
  }, 60_000);

  it('findClusterById() round-trips a known cluster and getClusterGovernmentParams() re-maps costPer*', async () => {
    const client = connect({ network: 'devnet' });
    try {
      const [first] = await client.clusters.listClusters();
      const found = await client.clusters.findClusterById(first.clusterId);
      expect(found?.clusterId).toBe(first.clusterId);
      const gov = await client.clusters.getClusterGovernmentParams(first.clusterId);
      expect(gov).toBeDefined();
      expect(typeof gov!.costPerMbStored).toBe('bigint');
      expect('customerDepositContract' in gov!).toBe(true);
    } finally {
      client.disconnect();
    }
  }, 60_000);

  it('findClusterById() returns undefined for an unknown cluster', async () => {
    const client = connect({ network: 'devnet' });
    try {
      const missing = await client.clusters.findClusterById(('0x' + '00'.repeat(20)) as any);
      expect(missing).toBeUndefined();
    } finally {
      client.disconnect();
    }
  }, 60_000);

  it('mutating builders encode and are runtime-compatible (no submit)', async () => {
    const client = connect({ network: 'devnet' });
    try {
      // Use a real, validly-checksummed SS58 address observed on this chain (the
      // known cluster's own reserve/manager id) rather than a hand-typed literal:
      // papi's AccountId codec strictly validates the SS58 checksum (unlike the
      // legacy polkadot.js path, which tolerated malformed placeholder strings).
      const [first] = await client.clusters.listClusters();
      const reserve = first.reserveId;
      const gov = (await client.clusters.getClusterGovernmentParams(first.clusterId))!;
      const create = client.clusters.createCluster(('0x' + '11'.repeat(20)) as any, reserve, {}, gov);
      expect(Binary.toHex(await create.getEncodedData())).toMatch(/^0x/);
      await client.assertCompatible('DdcClusters', 'create_cluster');

      const key = first.managerId;
      const add = client.clusters.addStorageNodeToCluster(('0x' + '11'.repeat(20)) as any, key, 'Genesis' as any);
      expect(Binary.toHex(await add.getEncodedData())).toMatch(/^0x/);
      await client.assertCompatible('DdcClusters', 'add_node');

      const remove = client.clusters.removeStorageNodeFromCluster(('0x' + '11'.repeat(20)) as any, key);
      expect(Binary.toHex(await remove.getEncodedData())).toMatch(/^0x/);
      await client.assertCompatible('DdcClusters', 'remove_node');

      const setParams = client.clusters.setClusterParams(('0x' + '11'.repeat(20)) as any, {});
      expect(Binary.toHex(await setParams.getEncodedData())).toMatch(/^0x/);
      await client.assertCompatible('DdcClusters', 'set_cluster_params');
    } finally {
      client.disconnect();
    }
  }, 60_000);
});
