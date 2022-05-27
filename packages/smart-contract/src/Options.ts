const ddcBucketAbi = require("./abi/ddc_bucket.json");

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
    contractAddress: "5DAx9cTNXYKbbMTQUWzh1cZ46Mj14pnyKvshkVWm8fkfh36X",
    abi: ddcBucketAbi
}

export const DEVNET: Options = {
    rpcUrl: "",
    contractAddress: "",
    abi: ddcBucketAbi
}
