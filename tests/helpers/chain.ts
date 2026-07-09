import { Blockchain, UriSigner } from '@cere-ddc-sdk/blockchain';

export const CERE_RPC_URL = process.env.CERE_RPC_URL ?? 'wss://rpc.devnet.cere.network/ws';

/** Skips the whole suite unless CERE_CHAIN_TESTS is set — keeps default CI network-free. */
export const describeChain = process.env.CERE_CHAIN_TESTS ? describe : describe.skip;

export const connectChain = () => Blockchain.connect({ wsEndpoint: CERE_RPC_URL });

/** A funded signer for write-path tests; undefined when CERE_FUNDED_SEED is absent. */
export const fundedSigner = () =>
  process.env.CERE_FUNDED_SEED ? new UriSigner(process.env.CERE_FUNDED_SEED) : undefined;
