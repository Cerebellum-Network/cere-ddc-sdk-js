/**
 * The DDC operations that a `Router`/`EndpointResolver` maps to an endpoint.
 */
export enum RouterOperation {
  READ_DAG_NODE = 'read-dag-node',
  STORE_DAG_NODE = 'store-dag-node',
  READ_PIECE = 'read-piece',
  STORE_PIECE = 'store-piece',
  STORE_CNS_RECORD = 'store-cns-record',
  READ_CNS_RECORD = 'read-cns-record',
}
