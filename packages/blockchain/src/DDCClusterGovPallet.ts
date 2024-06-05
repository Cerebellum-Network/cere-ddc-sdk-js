import { ApiPromise } from '@polkadot/api';
import { Sendable } from './Blockchain';
import { ClusterId, ClusterMember, ClusterProtocolParams, NodePublicKey, ReferendumIndex } from './types';

/**
 * This class provides methods to interact with the DDC Cluster Goverment pallet on the blockchain.
 *
 * @group Pallets
 * @example
 *
 * ```typescript
 * const clusterId = '0x...';
 * const protocolParams = { ... };
 * const member = ClusterMember.ClusterManager;
 *
 * const tx = blockchain.ddcClusterGov.proposeUpdateClusterProtocol(clusterId, protocolParams, member);
 *
 * await blockchain.send(tx, { account });
 * ```
 */
export class DDCClusterGovPallet {
  constructor(private apiPromise: ApiPromise) {}

  /**
   * Creates a local proposal within a cluster, intended to activate the cluster in the network with specific protocol parameters such as validators, treasury fees, and pricing for stored and streamed bytes.
   * Only cluster members, namely the cluster manager and node providers, have voting rights on this proposal.
   * Furthermore, only the cluster manager has the authority to create this type of proposal.
   *
   * @param clusterId - The ID of the cluster.
   */
  proposeActivateClusterProtocol(clusterId: ClusterId, protocolParams: ClusterProtocolParams) {
    return this.apiPromise.tx.ddcClusterGov.proposeActivateClusterProtocol(clusterId, protocolParams) as Sendable;
  }

  /**
   * Creates a local proposal within a cluster, intended to update protocol parameters (like validators, treasury fee, pricing for stored and streamed bytes, etc.) of a previously activated cluster in the network.
   * Only cluster members, such as the cluster manager and node providers, can vote on this type of proposal.
   * Any cluster member has the ability to create this type of proposal.
   *
   * @param clusterId - The ID of the cluster.
   * @param protocolParams - The new protocol parameters.
   * @param member - The member who is creating the proposal.
   * @param podePublicKey - The public key of the node provider. Needed in case the member is ClusterMember.NodeProvider.
   *
   * @returns An extrinsic to propose the update of the cluster protocol.
   *
   * @example
   *
   * ```typescript
   * const clusterId = '0x...';
   * const protocolParams = { ... };
   * const member = ClusterMember.ClusterManager;
   *
   * const tx = blockchain.ddcClusterGov.proposeUpdateClusterProtocol(clusterId, protocolParams, member);
   *
   * await blockchain.send(tx, { account });
   * ```
   */
  proposeUpdateClusterProtocol(
    clusterId: ClusterId,
    protocolParams: ClusterProtocolParams,
    member: ClusterMember,
    nodePublicKey?: NodePublicKey,
  ): Sendable {
    return this.apiPromise.tx.ddcClusterGov.proposeUpdateClusterProtocol(
      clusterId,
      protocolParams,
      this.createClusterMember(member, nodePublicKey),
    ) as Sendable;
  }

  /**
   * Votes for a local proposal within a cluster. Only cluster members, such as the cluster manager and node providers, are permitted to vote.
   *
   * @param clusterId - The ID of the cluster.
   * @param approve - Whether to approve the proposal.
   * @param member - The member who is voting.
   * @param podePublicKey - The public key of the node provider. Needed in case the member is ClusterMember.NodeProvider.
   *
   * @returns An extrinsic to vote on the proposal.
   *
   * @example
   *
   * ```typescript
   * const clusterId = '0x...';
   * const approve = true;
   * const member = ClusterMember.ClusterManager;
   *
   * const tx = blockchain.ddcClusterGov.voteProposal(clusterId, approve, member);
   *
   * await blockchain.send(tx, { account });
   * ```
   */
  voteProposal(clusterId: ClusterId, approve: boolean, member: ClusterMember, podePublicKey?: NodePublicKey) {
    return this.apiPromise.tx.ddcClusterGov.voteProposal(
      clusterId,
      approve,
      this.createClusterMember(member, podePublicKey),
    ) as Sendable;
  }

  /**
   * This method allows to retract a local proposal within a cluster. Only the proposal's author can submit it.
   *
   * @param clusterId - The ID of the cluster.
   * @param member - The member who is retracting the proposal.
   * @param podePublicKey - The public key of the node provider. Needed in case the member is ClusterMember.NodeProvider.
   * @returns An extrinsic to retract the proposal.
   *
   * @example
   *
   * ```typescript
   * const clusterId = '0x...';
   * const member = ClusterMember.ClusterManager;
   *
   * const tx = blockchain.ddcClusterGov.retractProposal(clusterId, member);
   *
   * await blockchain.send(tx, { account });
   * ```
   */
  closeProposal(clusterId: ClusterId, member: ClusterMember, podePublicKey?: NodePublicKey) {
    return this.apiPromise.tx.ddcClusterGov.closeProposal(
      clusterId,
      this.createClusterMember(member, podePublicKey),
    ) as Sendable;
  }

  /**
   * Closes a local proposal within a cluster. If the required approval threshold is met, it will automatically initiate a public referendum in the OpenGov.
   * Here, any CERE token holder can vote on the cluster's proposal, thereby influencing the network's economics.
   * If the required approval threshold is not met, the local (internal) proposal will be withdrawn without initiating a public referendum.
   * Any cluster member can close the proposal once the approval threshold or expiration time is reached.
   *
   * @param clusterId - The ID of the cluster.
   * @returns An extrinsic to retract the proposal.
   *
   * @example
   *
   * ```typescript
   * const clusterId = '0x...';
   * const tx = blockchain.ddcClusterGov.retractProposal(clusterId);
   *
   * await blockchain.send(tx, { account });
   * ```
   */
  retractProposal(clusterId: ClusterId) {
    return this.apiPromise.tx.ddcClusterGov.retractProposal(clusterId) as Sendable;
  }

  /**
   * Refunds the submission deposit made by the proposal's author when creating a local proposal.
   *
   * @param referendaIndex - The index of the referendum.
   *
   * @returns An extrinsic to refund the submission deposit.
   *
   * @example
   *
   * ```typescript
   * const referendaIndex = 0;
   * const tx = blockchain.ddcClusterGov.refundSubmissionDeposit(referendaIndex);
   *
   * await blockchain.send(tx, { account });
   * ```
   */
  refundSubmissionDeposit(referendaIndex: ReferendumIndex) {
    return this.apiPromise.tx.ddcClusterGov.refundSubmissionDeposit(referendaIndex) as Sendable;
  }

  private createClusterMember(member: ClusterMember, nodePublicKey?: NodePublicKey) {
    if (member === ClusterMember.ClusterManager) {
      return ClusterMember.ClusterManager;
    }

    if (!nodePublicKey) {
      throw new Error('Node public key is required to create a cluster member enum.');
    }

    return {
      [ClusterMember.NodeProvider]: nodePublicKey,
    };
  }
}
