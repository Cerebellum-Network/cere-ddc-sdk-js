import { cereDevnet, cereTestnet, cereMainnet } from '#descriptors';

export type CereNetwork = 'devnet' | 'testnet' | 'mainnet';

export const DESCRIPTORS = { devnet: cereDevnet, testnet: cereTestnet, mainnet: cereMainnet } as const;

export const CERE_WS: Record<CereNetwork, string> = {
  devnet: 'wss://rpc.devnet.cere.network/ws',
  testnet: 'wss://rpc.testnet.cere.network/ws',
  mainnet: 'wss://rpc.mainnet.cere.network/ws',
};
