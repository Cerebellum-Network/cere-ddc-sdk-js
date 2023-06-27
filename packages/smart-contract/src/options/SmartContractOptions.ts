import {ddcBucketAbi} from '../abi';

export type SmartContractOptions = {
    rpcUrl?: string;
    contractAddress: string;
    abi: Record<string, unknown>;
};

export const MAINNET: SmartContractOptions = {
    rpcUrl: 'NOT_DEPLOYED_YET',
    contractAddress: 'NOT_DEPLOYED_YET',
    abi: ddcBucketAbi,
};

export const TESTNET: SmartContractOptions = {
    rpcUrl: 'wss://rpc.devnet.cere.network/ws',
    contractAddress: '6So8eqxMyWAxJ4ZZ2wCcJym7Cy6BYkc4V8GZZD9wgdCqWMQB',
    abi: ddcBucketAbi,
};

export const DEVNET: SmartContractOptions = {
    rpcUrl: 'wss://archive.devnet.cere.network/ws',
    contractAddress: '6SfBsKbfPUTN35GCcqAHSMY4MemedK2A73VeJ34Z2FV6PB4r',
    abi: ddcBucketAbi,
};

export const STAGENET: SmartContractOptions = {
    rpcUrl: 'wss://archive.devnet.cere.network/ws',
    contractAddress: '6TfcHJxGnkPHgDSjmrEcghZS8vMbMfp2BRnSKGYaKa9zD437',
    abi: ddcBucketAbi,
};
