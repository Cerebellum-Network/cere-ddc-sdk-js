/**
 * Raised when the connected runtime doesn't actually support a call the papi
 * client needs — e.g. an older network whose runtime predates a pallet/call
 * shape. Surfaces a clear failure instead of a cryptic encode error.
 */
export class ChainIncompatibleError extends Error {
  constructor(
    message: string,
    /** The Cere network whose runtime was incompatible. */
    public readonly network?: string,
    /** The pallet call that wasn't supported, e.g. `"DdcClustersGov.propose_activate_cluster_protocol"`. */
    public readonly call?: string,
  ) {
    super(message);
    this.name = 'ChainIncompatibleError';
  }
}
