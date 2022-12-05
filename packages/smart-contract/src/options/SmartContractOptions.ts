import {ddcBucketAbi} from '../abi/ddc_bucket';

export type SmartContractOptions = {
    rpcUrl?: string;
    contractAddress: string;
    abi: Record<string, unknown>;
}

export const MAINNET: SmartContractOptions = {
    rpcUrl: 'NOT_DEPLOYED_YET',
    contractAddress: 'NOT_DEPLOYED_YET',
    abi: ddcBucketAbi,
};

export const TESTNET: SmartContractOptions = {
    rpcUrl: 'wss://rpc.devnet.cere.network/ws',
    contractAddress: '5DWvLrLFvFXTHETdMs3kRh9FqjhR6H6Hwt1QMnQviRLjKtms',
    abi: ddcBucketAbi,
};

export const DEVNET: SmartContractOptions = {
    rpcUrl: 'wss://rpc.devnet.cere.network/ws',
    contractAddress: '5Hbb5EKQ98SZhiPvfP6j3G93C8bfvXRF4bzqmKyGuVRwpX89',
    abi: ddcBucketAbi,
};
