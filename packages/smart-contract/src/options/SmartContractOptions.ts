import {ddcBucketAbi} from "../abi/ddc_bucket.js";

export class SmartContractOptions {
    rpcUrl?: string;
    contractAddress!: string;
    abi?: any
}

export const MAINNET: SmartContractOptions = {
    rpcUrl: "NOT_DEPLOYED_YET",
    contractAddress: "NOT_DEPLOYED_YET",
    abi: ddcBucketAbi
}

export const TESTNET: SmartContractOptions = {
    rpcUrl: "wss://rpc.testnet.cere.network/ws",
    contractAddress: "5DTZfAcmZctJodfa4W88BW5QXVBxT4v7UEax91HZCArTih6U",
    abi: ddcBucketAbi
}

export const DEVNET: SmartContractOptions = {
    rpcUrl: "wss://rpc.v2.devnet.cere.network/ws",
    contractAddress: "5GqwX528CHg1jAGuRsiwDwBVXruUvnPeLkEcki4YFbigfKsC",
    abi: ddcBucketAbi
}
