import { RouterNode } from './Router';

export type ConfigPreset = {
  blockchain: string;
  nodes?: RouterNode[];
};

export const MAINNET: ConfigPreset = {
  blockchain: 'wss://rpc.qanet.cere.network/ws',
};

export const DEVNET: ConfigPreset = {
  blockchain: 'wss://archive.devnet.cere.network/ws',
  nodes: [
    { grpcUrl: 'grpc://38.242.236.247:9090', httpUrl: 'https://storage-1.ddc-devnet.cloud', ssl: true },
    { grpcUrl: 'grpc://38.242.236.247:9091', httpUrl: 'http://38.242.236.247:8081' },
    { grpcUrl: 'grpc://158.220.87.61:9090', httpUrl: 'https://storage-3.ddc-devnet.cloud', ssl: true },
    { grpcUrl: 'grpc://158.220.87.61:9091', httpUrl: 'http://158.220.87.61:8081' },
    { grpcUrl: 'grpc://89.117.79.111:9090', httpUrl: 'https://storage-5.ddc-devnet.cloud', ssl: true },
    { grpcUrl: 'grpc://89.117.79.111:9091', httpUrl: 'http://89.117.79.111:8081' },
    { grpcUrl: 'grpc://154.53.57.124:9090', httpUrl: 'https://storage-7.ddc-devnet.cloud', ssl: true },
    { grpcUrl: 'grpc://154.53.57.124:9091', httpUrl: 'http://154.53.57.124:8081' },
  ],
};

export const TESTNET: ConfigPreset = {
  blockchain: 'wss://rpc.testnet.cere.network/ws',
  nodes: [
    { grpcUrl: 'grpc://154.12.245.141:9090', httpUrl: 'https://storage-1.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://31.220.96.199:9090', httpUrl: 'https://storage-7.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://31.220.96.199:9091', httpUrl: 'http://31.220.96.199:8081' },
    { grpcUrl: 'grpc://31.220.96.198:9090', httpUrl: 'https://storage-9.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://31.220.96.198:9091', httpUrl: 'http://31.220.96.198:8081' },
    { grpcUrl: 'grpc://31.220.96.197:9090', httpUrl: 'https://storage-11.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://209.126.81.124:9090', httpUrl: 'https://storage-15.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://209.126.81.124:9091', httpUrl: 'http://209.126.81.124:8081' },
    { grpcUrl: 'grpc://209.126.80.153:9091', httpUrl: 'http://209.126.80.153:8081' },
    { grpcUrl: 'grpc://209.145.62.255:9091', httpUrl: 'http://209.145.62.255:8081' },
    { grpcUrl: 'grpc://158.220.88.75:9090', httpUrl: 'https://storage-21.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://158.220.88.75:9091', httpUrl: 'http://158.220.88.75:8081' },
    { grpcUrl: 'grpc://158.220.88.74:9091', httpUrl: 'http://158.220.88.74:8081' },
    { grpcUrl: 'grpc://158.220.88.73:9090', httpUrl: 'https://storage-25.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://158.220.88.73:9091', httpUrl: 'http://158.220.88.73:8081' },
    { grpcUrl: 'grpc://38.242.148.54:9090', httpUrl: 'https://storage-27.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://38.242.148.67:9090', httpUrl: 'https://storage-29.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://38.242.148.67:9091', httpUrl: 'http://38.242.148.67:8081' },
    { grpcUrl: 'grpc://38.242.148.78:9090', httpUrl: 'https://storage-31.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://5.78.111.88:9090', httpUrl: 'https://storage-33.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://5.161.48.28:9090', httpUrl: 'https://storage-37.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://5.161.48.28:9091', httpUrl: 'http://5.161.48.28:8081' },
    { grpcUrl: 'grpc://5.161.48.28:9092', httpUrl: 'http://5.161.48.28:8082' },
    { grpcUrl: 'grpc://5.161.48.28:9093', httpUrl: 'http://5.161.48.28:8083' },
    { grpcUrl: 'grpc://128.140.97.160:9090', httpUrl: 'https://storage-42.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://49.13.23.245:9090', httpUrl: 'https://storage-43.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://167.235.231.47:9090', httpUrl: 'https://storage-44.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://95.216.139.48:9090', httpUrl: 'https://storage-47.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://95.217.167.158:9090', httpUrl: 'https://storage-48.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://140.82.50.92:9090', httpUrl: 'https://storage-50.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://149.28.111.44:9090', httpUrl: 'https://storage-51.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://66.135.30.145:9090', httpUrl: 'https://storage-52.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://137.220.57.81:9090', httpUrl: 'https://storage-54.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://149.28.242.196:9090', httpUrl: 'https://storage-56.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://64.176.183.175:9090', httpUrl: 'https://storage-57.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://45.76.131.46:9090', httpUrl: 'https://storage-58.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://108.61.198.218:9090', httpUrl: 'https://storage-59.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://80.240.22.212:9090', httpUrl: 'https://storage-60.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://107.191.63.179:9090', httpUrl: 'https://storage-61.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://64.176.67.225:9090', httpUrl: 'https://storage-64.ddc-testnet.cloud', ssl: true },
  ],
};

export const DEFAULT_PRESET = TESTNET;
