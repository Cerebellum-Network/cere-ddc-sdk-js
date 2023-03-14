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
    contractAddress: '6VC3Qrna1FiSm5kG8hcpT7JSES3E2V9k5c3oRYyWjpHo9Vvz',
    abi: ddcBucketAbi,
};
