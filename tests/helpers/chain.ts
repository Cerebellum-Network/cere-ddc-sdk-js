import { Blockchain, UriSigner } from '@cere-ddc-sdk/blockchain';

export const CERE_RPC_URL = process.env.CERE_RPC_URL ?? 'wss://rpc.devnet.cere.network/ws';

/**
 * Skips the whole suite unless CERE_CHAIN_TESTS is set — keeps default CI network-free.
 *
 * Implemented as a lazy wrapper (not `process.env… ? describe : describe.skip` at module
 * scope) so that importing this module outside the jest test runtime — e.g. from
 * `globalSetup` via the `../helpers` barrel — does not touch the `describe` global, which
 * only exists during test collection. `describe`/`describe.skip` are resolved at call time,
 * which is always inside a spec file where the globals are defined.
 */
export const describeChain = ((...args: Parameters<jest.Describe>) =>
  (process.env.CERE_CHAIN_TESTS ? describe : describe.skip)(...args)) as jest.Describe;

export const connectChain = () => Blockchain.connect({ wsEndpoint: CERE_RPC_URL });

/** A funded signer for write-path tests; undefined when CERE_FUNDED_SEED is absent. */
export const fundedSigner = () =>
  process.env.CERE_FUNDED_SEED ? new UriSigner(process.env.CERE_FUNDED_SEED) : undefined;
