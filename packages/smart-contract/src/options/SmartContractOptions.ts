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
    rpcUrl: 'wss://rpc.devnet.cere.network/ws',
    contractAddress: '6U4v33M7LmJ8ZPXBtcYRvF5cuttLvZqQQEcfpbfzBrqTSUbg',
    abi: ddcBucketAbi,
};

export const DEVNET: SmartContractOptions = {
    rpcUrl: 'wss://archive.devnet.cere.network/ws',
    contractAddress: '6UH2M3Peg2jSNvMPFQpUQaCU46ZEgYSzWEmp2QqptZA7E3B4',
    abi: ddcBucketAbi,
};

/**
 * TODO: Remove if not used
 *
 * @deprecated
 */
export const STAGENET = TESTNET;
