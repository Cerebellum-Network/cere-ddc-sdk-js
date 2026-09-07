import type { TypedApi } from 'polkadot-api';
import { cereMainnet } from '#descriptors';

// Shared alias for the typed papi API. The mainnet descriptor is the static
// baseline for all three networks (see client.ts) — the pallet calls 2b uses
// are identical across nets.
export type CereApi = TypedApi<typeof cereMainnet>;
