import type {ApiPromise} from '@polkadot/api';
import {ddcBucketAbi} from '../abi';

export type SmartContractOptions = {
    contractAddress: string;
    abi: Record<string, unknown>;
    rpcUrl?: string;
    api?: ApiPromise;
};

export const MAINNET: SmartContractOptions = {
    rpcUrl: 'wss://rpc.qanet.cere.network/ws',
    contractAddress: '6Q7C6G3Hpz43tSDPotqT1wYHupTpEJ54oAv3QrAM7TnCF2oY',
    abi: ddcBucketAbi,
};

export const TESTNET: SmartContractOptions = {
    rpcUrl: 'wss://rpc.testnet.cere.network/ws',
    contractAddress: '6TokurXU4KdNUgHm85tPrFad1cVVT2QZp7jnCxdciFLfF1Mj',
    abi: ddcBucketAbi,
};

export const DEVNET: SmartContractOptions = {
    rpcUrl: 'wss://archive.devnet.cere.network/ws',
    contractAddress: '6U7MUyRTQNLVwTao9JuvDFoiJxsk6HNtQZ8XFswPrkLmQPjx',
    abi: ddcBucketAbi,
};

/**
 * TODO: Remove if not used
 *
 * @deprecated
 */
export const STAGENET = TESTNET;
