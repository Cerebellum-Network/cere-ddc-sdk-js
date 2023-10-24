import type {ApiPromise} from '@polkadot/api';
import {GlobalNftRegistryAbi, globalNftRegistryAbi} from '../abi';

export type GlobalNftRegistryOptions = {
    contractAddress: string;
    // abi: Record<string, unknown>;
    abi: GlobalNftRegistryAbi;
    rpcUrl?: string;
    api?: ApiPromise;
};

export const MAINNET: GlobalNftRegistryOptions = {
    rpcUrl: 'wss://rpc.qanet.cere.network/ws',
    contractAddress: '',
    abi: globalNftRegistryAbi,
};

export const TESTNET: GlobalNftRegistryOptions = {
    rpcUrl: 'wss://rpc.devnet.cere.network/ws',
    contractAddress: '',
    abi: globalNftRegistryAbi,
};

export const DEVNET: GlobalNftRegistryOptions = {
    rpcUrl: 'wss://archive.devnet.cere.network/ws',
    contractAddress: '',
    abi: globalNftRegistryAbi,
};

export const STAGENET = TESTNET;