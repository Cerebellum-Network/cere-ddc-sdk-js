import { Binary } from 'polkadot-api';
import { connect, ClusterNodeKind, ClusterStatus } from '@cere-ddc-sdk/blockchain/papi';

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

  it('filterNodeKeysByClusterId() and clusterHasStorageNode() read node membership for a live cluster', async () => {
    const client = connect({ network: 'devnet' });
    try {
      const [first] = await client.clusters.listClusters();
      const keys = await client.clusters.filterNodeKeysByClusterId(first.clusterId);
      expect(Array.isArray(keys)).toBe(true);
      if (keys.length > 0) {
        expect(typeof keys[0]).toBe('string');
        expect(await client.clusters.clusterHasStorageNode(first.clusterId, keys[0])).toBe(true);
      }

      // A syntactically valid SS58 address (the cluster's own manager id) that this test
      // dynamically confirms is not one of the cluster's storage node keys, so the
      // false-path is exercised without hardcoding an address.
      const notANode = first.managerId;
      if (!keys.includes(notANode as any)) {
        expect(await client.clusters.clusterHasStorageNode(first.clusterId, notANode as any)).toBe(false);
      }
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

      // `key` reuses a cluster manager's AccountId as a StorageNodePublicKey: this is a
      // pure-encode test (no submit), so any valid SS58 string round-trips through the
      // codec fine — it doesn't need to be a real storage node's key.
      const key = first.managerId;
      const add = client.clusters.addStorageNodeToCluster(
        ('0x' + '11'.repeat(20)) as any,
        key,
        ClusterNodeKind.Genesis,
      );
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
