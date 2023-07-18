import {ddcBucketAbi} from '../abi';

export type SmartContractOptions = {
    rpcUrl?: string;
    contractAddress: string;
    abi: Record<string, unknown>;
};

export const MAINNET: SmartContractOptions = {
    rpcUrl: 'wss://rpc.qanet.cere.network/ws',
    contractAddress: '6Q7C6G3Hpz43tSDPotqT1wYHupTpEJ54oAv3QrAM7TnCF2oY',
    abi: ddcBucketAbi,
};

export const TESTNET: SmartContractOptions = {
    rpcUrl: 'wss://rpc.devnet.cere.network/ws',
    contractAddress: '6U4v33M7LmJ8ZPXBtcYRvF5cuttLvZqQQEcfpbfzBrqTSUbg',
    abi: ddcBucketAbi,
};

export const DEVNET: SmartContractOptions = {
    rpcUrl: 'wss://archive.devnet.cere.network/ws',
    contractAddress: '6SrAzgZBdn7aeoXZzXS6jkbNmnN18fQUHUWeN21NB7yLEt3U',
    abi: ddcBucketAbi,
};

/**
 * TODO: Remove if not used
 *
 * @deprecated
 */
export const STAGENET = TESTNET;
