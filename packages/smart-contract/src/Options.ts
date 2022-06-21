import {ddcBucketAbi} from "./abi/ddc_bucket.js";

export class Options {
    rpcUrl?: string;
    contractAddress!: string;
    abi?: any
}

export const MAINNET: Options = {
    rpcUrl: "NOT_DEPLOYED_YET",
    contractAddress: "NOT_DEPLOYED_YET",
    abi: ddcBucketAbi
}

export const TESTNET: Options = {
    rpcUrl: "wss://rpc.v2.testnet.cere.network/ws",
    contractAddress: "5DTZfAcmZctJodfa4W88BW5QXVBxT4v7UEax91HZCArTih6U",
    abi: ddcBucketAbi
}

export const DEVNET: Options = {
    rpcUrl: "wss://rpc.devnet.cere.network:9945",
    contractAddress: "5GqwX528CHg1jAGuRsiwDwBVXruUvnPeLkEcki4YFbigfKsC",
    abi: ddcBucketAbi
}
