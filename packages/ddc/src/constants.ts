import { GrpcStatus } from './grpc/status';

export const KB = 1024;
export const MB = 1024 * KB;

export const MAX_PIECE_SIZE = 128 * MB;
export const CONTENT_CHUNK_SIZE = 64 * KB;
export const HTTPS_DEFAULT_PORT = 443;
export const AUTH_TOKEN_EXPIRATION_TIME = 30 * 24 * 60 * 60 * 1000; // One month

export const RETRYABLE_GRPC_ERROR_CODES = [GrpcStatus.UNAVAILABLE];
export const RETRY_MAX_ATTEPTS = 5;

export const PING_THRESHOLD = 10; // Minimum number of nodes to ping before any DDC operation
export const PING_THRESHOLD_INC = 2; // Number of nodes to ping more in background after each operation
export const PING_LATENCY_GROUP = 100; // The coeficient in ms to group nodes by latency
export const PING_BACKGROUND_DELAY = 100; // Delay in ms before starting background pings after an operation
export const PING_ABORT_TIMEOUT = 1000; // Timeout in ms for aborting a ping request
