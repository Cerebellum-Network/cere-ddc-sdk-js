export const CERE = 10_000_000_000n;
export const KB = 1024;
export const MB = 1024 * KB;
export const DDC_BLOCK_SIZE = 16 * 1024;
export const ROOT_USER_SEED = 'hybrid label reunion only dawn maze asset draft cousin height flock nation';
export const ROOT_ACCOUNT_TYPE = 'sr25519';
export const BLOCKCHAIN_MAX_BLOCK_WEIGHT = 2_000_000_000_000;
// Generous startup ceilings so the suite also works on machines that run the amd64 node
// images under emulation (e.g. Apple Silicon). These are max waits — the wait strategy
// exits early as soon as the readiness log line appears, so this is a no-op on fast CI.
export const STORAGE_NODE_MAX_STARTUP_TIME = 120_000;
export const BLOCKCHAIN_NODE_MAX_STARTUP_TIME = 120_000;
export const DDC_CLUSTER_STAKE = 100_000; // CERE tokens
