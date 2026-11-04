import { RpcError } from '@protobuf-ts/runtime-rpc';

import { GrpcStatus } from '../grpc/status';
import {
  MESSAGE_GATED_GRPC_ERROR_CODES,
  RETRYABLE_GRPC_ERROR_CODES,
  SDK_TIMEOUT_ERROR_MESSAGE_PATTERNS,
  TRANSIENT_ERROR_MESSAGE_PATTERNS,
} from '../constants';

const toCodeNames = (codes: GrpcStatus[]) => new Set<string>(codes.map((code) => GrpcStatus[code]));

const retryableCodes = toCodeNames(RETRYABLE_GRPC_ERROR_CODES);
const messageGatedCodes = toCodeNames(MESSAGE_GATED_GRPC_ERROR_CODES);
const cancelledCode = GrpcStatus[GrpcStatus.CANCELLED];

const matchesAny = (message: string, patterns: readonly RegExp[]) => patterns.some((pattern) => pattern.test(message));

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

/**
 * Tells whether a failed node operation is worth repeating because the failure is transient and node-side,
 * such as a node restarting, a coordinator missing its replication quorum or a dropped connection.
 *
 * Only `RpcError`s qualify. `UNAVAILABLE`, `DEADLINE_EXCEEDED` and `RESOURCE_EXHAUSTED` are always retryable.
 * `UNKNOWN` and `INTERNAL` are retryable only when the message names a quorum shortfall or a connection
 * failure, and `CANCELLED` only when it comes from the SDK's own inactivity timeout. Every other error,
 * including `PERMISSION_DENIED`, `UNAUTHENTICATED`, `INVALID_ARGUMENT` and `NOT_FOUND`, is final.
 *
 * @param error - The error thrown by a node operation.
 *
 * @returns `true` if repeating the operation may succeed.
 *
 * @example
 *
 * ```typescript
 * isRetryableNodeError(new NodeError('failed to put raw piece: got less than 12 results (8), total: 13', 'UNKNOWN')); // true
 * isRetryableNodeError(new NodeError('access denied', 'PERMISSION_DENIED')); // false
 * ```
 */
export const isRetryableNodeError = (error: unknown): boolean => {
  if (!(error instanceof RpcError)) {
    return false;
  }

  if (retryableCodes.has(error.code)) {
    return true;
  }

  if (messageGatedCodes.has(error.code)) {
    return matchesAny(error.message, TRANSIENT_ERROR_MESSAGE_PATTERNS);
  }

  if (error.code === cancelledCode) {
    return matchesAny(error.message, SDK_TIMEOUT_ERROR_MESSAGE_PATTERNS);
  }

  return false;
};
