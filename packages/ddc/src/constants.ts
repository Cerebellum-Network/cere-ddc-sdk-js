import { GrpcStatus } from './grpc/status';

export const KB = 1024;
export const MB = 1024 * KB;

/**
 * Maximum size of a piece of content, in bytes.
 *
 * @hidden
 */
export const MAX_PIECE_SIZE = 128 * MB;

/**
 * Size of a chunk of a content stream, in bytes.
 */
export const CONTENT_CHUNK_SIZE = 64 * KB;

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
 * gRPC error codes that should trigger a retry of the operation.
 */
export const RETRYABLE_GRPC_ERROR_CODES = [GrpcStatus.UNAVAILABLE];

/**
 * Maximum number of attempts to retry an operation.
 */
export const RETRY_MAX_ATTEPTS = 5;

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
