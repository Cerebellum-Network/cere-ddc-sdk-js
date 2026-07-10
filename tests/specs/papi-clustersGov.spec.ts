import { Binary } from 'polkadot-api';
import { connect } from '@cere-ddc-sdk/blockchain/papi';
import { ClusterMember } from '@cere-ddc-sdk/blockchain';

const describeChain = process.env.CERE_CHAIN_TESTS ? describe : describe.skip;

describeChain('papi clustersGov (live, devnet)', () => {
  it('all proposal/vote builders encode + are runtime-compatible (no submit)', async () => {
    const client = connect({ network: 'devnet' });
    try {
      const [first] = await client.clusters.listClusters();
      const clusterId = first.clusterId;
      const gov = (await client.clusters.getClusterGovernmentParams(clusterId))!;

      // A real, validly-checksummed SS58 address (the cluster's own manager id) reused
      // as a stand-in node public key: this is a pure-encode test (no submit), so any
      // valid SS58 string round-trips through the codec fine — it doesn't need to be a
      // real node's key. papi's codec strictly validates the SS58 checksum, unlike the
      // legacy polkadot.js path.
      const nodeKey = first.managerId;

      const activate = client.clustersGov.proposeActivateClusterProtocol(clusterId, gov);
      expect(Binary.toHex(await activate.getEncodedData())).toMatch(/^0x/);

      const update = client.clustersGov.proposeUpdateClusterProtocol(
        clusterId,
        gov,
        ClusterMember.NodeProvider,
        nodeKey,
      );
      expect(Binary.toHex(await update.getEncodedData())).toMatch(/^0x/);

      const vote = client.clustersGov.voteProposal(clusterId, true, ClusterMember.ClusterManager);
      expect(Binary.toHex(await vote.getEncodedData())).toMatch(/^0x/);

      const close = client.clustersGov.closeProposal(clusterId, ClusterMember.ClusterManager);
      expect(Binary.toHex(await close.getEncodedData())).toMatch(/^0x/);

      const retract = client.clustersGov.retractProposal(clusterId);
      expect(Binary.toHex(await retract.getEncodedData())).toMatch(/^0x/);

      const refund = client.clustersGov.refundSubmissionDeposit(0);
      expect(Binary.toHex(await refund.getEncodedData())).toMatch(/^0x/);

      await client.assertCompatible('DdcClustersGov', 'propose_activate_cluster_protocol');
      await client.assertCompatible('DdcClustersGov', 'propose_update_cluster_protocol');
      await client.assertCompatible('DdcClustersGov', 'vote_proposal');
      await client.assertCompatible('DdcClustersGov', 'close_proposal');
      await client.assertCompatible('DdcClustersGov', 'retract_proposal');
      await client.assertCompatible('DdcClustersGov', 'refund_submission_deposit');
    } finally {
      client.disconnect();
    }
  }, 60_000);

  it('proposeUpdateClusterProtocol/voteProposal/closeProposal throw without a node key for NodeProvider', async () => {
    const client = connect({ network: 'devnet' });
    try {
      const [first] = await client.clusters.listClusters();
      const clusterId = first.clusterId;
      const gov = (await client.clusters.getClusterGovernmentParams(clusterId))!;

      expect(() =>
        client.clustersGov.proposeUpdateClusterProtocol(clusterId, gov, ClusterMember.NodeProvider),
      ).toThrow();
      expect(() => client.clustersGov.voteProposal(clusterId, true, ClusterMember.NodeProvider)).toThrow();
      expect(() => client.clustersGov.closeProposal(clusterId, ClusterMember.NodeProvider)).toThrow();
    } finally {
      client.disconnect();
    }
  }, 60_000);
});
