import type {ApiPromise} from '@polkadot/api';
import {GlobalNftRegistryAbi, globalNftRegistryAbi} from '../abi';

export type SmartContractOptions = {
    contractAddress: string;
    // abi: Record<string, unknown>;
    abi: GlobalNftRegistryAbi;
    rpcUrl?: string;
    api?: ApiPromise;
};

export const MAINNET: SmartContractOptions = {
    rpcUrl: 'wss://rpc.qanet.cere.network/ws',
    contractAddress: '',
    abi: globalNftRegistryAbi,
};

export const TESTNET: SmartContractOptions = {
    rpcUrl: 'wss://rpc.devnet.cere.network/ws',
    contractAddress: '',
    abi: globalNftRegistryAbi,
};

export const DEVNET: SmartContractOptions = {
    rpcUrl: 'wss://archive.devnet.cere.network/ws',
    contractAddress: '',
    abi: globalNftRegistryAbi,
};

export const STAGENET = TESTNET;
