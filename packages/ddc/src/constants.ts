import { GrpcStatus } from './grpc/status';

export const KB = 1024;
export const MB = 1024 * KB;

/**
 * Minimum size of a piece of content, in bytes.
 *
 * @hidden
 */
export const MIN_PIECE_SIZE = 4 * MB;

/**
 * Maximum size of a piece of content, in bytes.
 *
 * @hidden
 */
export const MAX_PIECE_SIZE = 128 * MB;

/**
 * Size of a chunk of a content stream, in bytes.
 * 4 MB (recomended gRPC message size) minus 100 KB reserved for the message structure.
 */
export const CONTENT_CHUNK_SIZE = 4 * MB - 100 * KB;

/**
 * Default port for HTTPS connections.
 */
export const HTTPS_DEFAULT_PORT = 443;

/**
 * Expiration time for an authentication token, in milliseconds.
 * This is set to one month.
 */
export const AUTH_TOKEN_EXPIRATION_TIME = 30 * 24 * 60 * 60 * 1000;

/**
 * Default inactivity timeout for gRPC requests, in milliseconds.
 * This is set to 30 seconds.
 */
export const GRPC_REQUEST_INACTIVITY_TIMEOUT = 30 * 1000;

/**
 * gRPC error codes that always indicate a transient, node-side failure, so the operation is retried.
 */
export const RETRYABLE_GRPC_ERROR_CODES = [
  GrpcStatus.UNAVAILABLE,
  GrpcStatus.DEADLINE_EXCEEDED,
  GrpcStatus.RESOURCE_EXHAUSTED,
];

/**
 * gRPC error codes that are too generic to retry on their own. An error with one of these codes is retried
 * only when its message matches one of `TRANSIENT_ERROR_MESSAGE_PATTERNS`.
 */
export const MESSAGE_GATED_GRPC_ERROR_CODES = [GrpcStatus.UNKNOWN, GrpcStatus.INTERNAL];

/**
 * Error messages that identify a transient failure behind a generic `UNKNOWN` or `INTERNAL` status.
 */
export const TRANSIENT_ERROR_MESSAGE_PATTERNS: readonly RegExp[] = [
  /**
   * The coordinating storage node could not reach its replication quorum, for example
   * "failed to put raw piece: got less than 12 results (8), total: 13".
   */
  /got less than \d+ results/i,

  /**
   * The node failed to reach a peer, for example "connection error: desc = transport: Error while dialing: dial tcp ...: i/o timeout".
   */
  /dial tcp/i,
  /connection (error|refused|reset|closed)/i,
  /i\/o timeout/i,
  /broken pipe/i,
  /transport is closing/i,
  /error reading from server/i,

  /**
   * A peer call inside the node failed with a transient status and the node passed it through as text.
   */
  /code = (Unavailable|DeadlineExceeded|ResourceExhausted)\b/,

  /**
   * The grpc-web transport lost the connection before the node completed its response, which is what a
   * node restart looks like from the client.
   */
  /response closed without (headers|grpc-status)/i,

  /**
   * The native gRPC transport had its HTTP/2 stream reset underneath it.
   */
  /RST_STREAM/,
];

/**
 * Error messages that identify the SDK's own request inactivity timeout behind a `CANCELLED` status.
 *
 * Callers have no way to cancel a request through the SDK, so a client-side cancellation can only come from
 * that timeout, which is a stalled node rather than a caller decision.
 */
export const SDK_TIMEOUT_ERROR_MESSAGE_PATTERNS: readonly RegExp[] = [
  /**
   * Raised by the SDK timeout interceptor and passed through by the grpc-web transport.
   */
  /^Request timed out$/,

  /**
   * Raised by the native gRPC transport, which ignores the abort reason.
   */
  /^Cancelled on client$/,
];

/**
 * Default number of retries after the first attempt, so an operation is attempted at most three times.
 */
export const RETRY_MAX_RETRIES = 2;

/**
 * Default delay before the first retry, in milliseconds. Each later delay doubles, and every delay is
 * multiplied by a random factor between 1 and 2 to spread retries from many clients.
 */
export const RETRY_MIN_TIMEOUT = 500;

/**
 * Default upper bound for a single delay between retries, in milliseconds.
 */
export const RETRY_MAX_TIMEOUT = 2000;

/**
 * Minimum number of nodes to ping before any DDC operation.
 */
export const PING_THRESHOLD = 10;

/**
 * Number of additional nodes to ping in the background after each operation.
 */
export const PING_THRESHOLD_INC = 2;

/**
 * Coefficient in milliseconds to group nodes by latency.
 */
export const PING_LATENCY_GROUP = 100;

/**
 * Delay in milliseconds before starting background pings after an operation.
 */
export const PING_BACKGROUND_DELAY = 100;

/**
 * Timeout in milliseconds for aborting a ping request.
 */
export const PING_ABORT_TIMEOUT = 1000;
