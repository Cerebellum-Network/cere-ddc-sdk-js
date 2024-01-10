import { GrpcStatus } from './grpc/status';

export const KB = 1024;
export const MB = 1024 * KB;

export const MAX_PIECE_SIZE = 128 * MB;
export const CONTENT_CHUNK_SIZE = 64 * KB;
export const HTTPS_DEFAULT_PORT = 443;
export const AUTH_TOKEN_EXPIRATION_TIME = 30 * 24 * 60 * 60 * 1000; // One month

export const RETRYABLE_GRPC_ERROR_CODES = [GrpcStatus.UNAVAILABLE];
export const RETRY_MAX_ATTEPTS = 5;
