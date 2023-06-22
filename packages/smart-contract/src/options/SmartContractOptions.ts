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
    rpcUrl: 'wss://archive.devnet.cere.network/ws',
    contractAddress: '6Ut3yTBNgmGBD9noJRaVHwUoFAswZ8SujnJiu6ChEs7Vi8ew',
    abi: ddcBucketAbi,
};

export const STAGENET: SmartContractOptions = {
    rpcUrl: 'wss://archive.devnet.cere.network/ws',
    contractAddress: '6TfcHJxGnkPHgDSjmrEcghZS8vMbMfp2BRnSKGYaKa9zD437',
    abi: ddcBucketAbi,
};

