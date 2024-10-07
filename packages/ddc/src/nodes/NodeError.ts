import { RpcError } from '@protobuf-ts/runtime-rpc';

export class NodeError extends RpcError {
  correlationId?: string;
  nodeId?: string;

  static fromRpcError(error: RpcError): NodeError {
    const finalError = new NodeError(error.message, error.code, error.meta);

    finalError.methodName = error.methodName;
    finalError.serviceName = error.serviceName;

    return finalError;
  }
}
