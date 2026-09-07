import type { CereApi } from '../api-types.js';
import type { Sendable } from '../tx.js';
import type { ClusterId, ClusterMember, ClusterProtocolParams, NodePublicKey, ReferendumIndex } from '../../types.js';
import { buildClusterMember, buildProtocolParams } from './mapping.js';

export interface ClustersGovPallet {
  proposeActivateClusterProtocol(clusterId: ClusterId, protocolParams: ClusterProtocolParams): Sendable;
  proposeUpdateClusterProtocol(
    clusterId: ClusterId,
    protocolParams: ClusterProtocolParams,
    member: ClusterMember,
    nodePublicKey?: NodePublicKey,
  ): Sendable;
  voteProposal(clusterId: ClusterId, approve: boolean, member: ClusterMember, nodePublicKey?: NodePublicKey): Sendable;
  closeProposal(clusterId: ClusterId, member: ClusterMember, nodePublicKey?: NodePublicKey): Sendable;
  retractProposal(clusterId: ClusterId): Sendable;
  refundSubmissionDeposit(referendaIndex: ReferendumIndex): Sendable;
}

/**
 * DdcClustersGov pallet: cluster-protocol governance proposals + votes.
 *
 * All calls are writes — verified via encode (`getEncodedData`) +
 * `client.assertCompatible('DdcClustersGov', <call>)` against a live devnet
 * probe; no proposal is ever actually submitted by the tests.
 *
 * Arg field names verified against the `DdcClustersGov` tx block in
 * `cereDevnet.d.ts` (descriptor types `Iah9p413nlasv4`/`I6iiotpri56hrl`/
 * `I6aga6jkk87fpa`/`I2rcppkjrla06r`/`I2u5oaj29tiqbr`/`I6qcgktnpolt59`):
 * both `propose_activate_cluster_protocol` AND `propose_update_cluster_protocol`
 * name their params arg `cluster_protocol_params` (not `protocol_params`/
 * `initial_protocol_params` — that latter name is `DdcClusters.create_cluster`'s,
 * a different pallet); `refund_submission_deposit` names its arg
 * `referenda_index` (not `index`).
 */
export function createClustersGovPallet(api: CereApi): ClustersGovPallet {
  return {
    proposeActivateClusterProtocol(clusterId, protocolParams) {
      return api.tx.DdcClustersGov.propose_activate_cluster_protocol({
        cluster_id: clusterId,
        cluster_protocol_params: buildProtocolParams(protocolParams),
      } as any) as Sendable;
    },
    proposeUpdateClusterProtocol(clusterId, protocolParams, member, nodePublicKey) {
      return api.tx.DdcClustersGov.propose_update_cluster_protocol({
        cluster_id: clusterId,
        cluster_protocol_params: buildProtocolParams(protocolParams),
        member: buildClusterMember(member, nodePublicKey),
      } as any) as Sendable;
    },
    voteProposal(clusterId, approve, member, nodePublicKey) {
      return api.tx.DdcClustersGov.vote_proposal({
        cluster_id: clusterId,
        approve,
        member: buildClusterMember(member, nodePublicKey),
      } as any) as Sendable;
    },
    closeProposal(clusterId, member, nodePublicKey) {
      return api.tx.DdcClustersGov.close_proposal({
        cluster_id: clusterId,
        member: buildClusterMember(member, nodePublicKey),
      } as any) as Sendable;
    },
    retractProposal(clusterId) {
      return api.tx.DdcClustersGov.retract_proposal({ cluster_id: clusterId } as any) as Sendable;
    },
    refundSubmissionDeposit(referendaIndex) {
      return api.tx.DdcClustersGov.refund_submission_deposit({ referenda_index: referendaIndex } as any) as Sendable;
    },
  };
}
