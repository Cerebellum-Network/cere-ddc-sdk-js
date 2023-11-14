import type {ApiPromise} from '@polkadot/api';
import {ddcBucketAbi} from '../abi';

export type SmartContractOptions = {
    contractAddress: string;
    abi: Record<string, unknown>;
    rpcUrl?: string;
    api?: ApiPromise;
};

export const MAINNET: SmartContractOptions = {
    rpcUrl: 'wss://rpc.testnet.cere.network/ws',
    contractAddress: '6V8CVz1iuDH361tizGzcrdW8xxF775Rjmv6Hg2gz6fqfmEsg',
    abi: ddcBucketAbi,
};

export const TESTNET: SmartContractOptions = {
    rpcUrl: 'wss://rpc.testnet.cere.network/ws',
    contractAddress: '6V8CVz1iuDH361tizGzcrdW8xxF775Rjmv6Hg2gz6fqfmEsg',
    abi: ddcBucketAbi,
};

export const DEVNET: SmartContractOptions = {
    rpcUrl: 'wss://rpc.testnet.cere.network/ws',
    contractAddress: '6TaAuTbpfuCUMcQyyaRyzeoEsMYehJmaPLPeXhEcHkwr9J6v',
    abi: ddcBucketAbi,
};

/**
 * TODO: Remove if not used
 *
 * @deprecated
 */
export const STAGENET = TESTNET;
