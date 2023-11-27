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
    { grpcUrl: 'grpc://38.242.236.247:9090', httpUrl: 'http://38.242.236.247:8080' },
    { grpcUrl: 'grpc://38.242.236.247:9091', httpUrl: 'http://38.242.236.247:8081' },
    { grpcUrl: 'grpc://158.220.87.61:9090', httpUrl: 'http://158.220.87.61:8080' },
    { grpcUrl: 'grpc://158.220.87.61:9091', httpUrl: 'http://158.220.87.61:8081' },
    { grpcUrl: 'grpc://89.117.79.111:9090', httpUrl: 'http://89.117.79.111:8080' },
    { grpcUrl: 'grpc://89.117.79.111:9091', httpUrl: 'http://89.117.79.111:8081' },
    { grpcUrl: 'grpc://154.53.57.124:9090', httpUrl: 'http://154.53.57.124:8080' },
    { grpcUrl: 'grpc://154.53.57.124:9091', httpUrl: 'http://154.53.57.124:8081' },
  ],
};

export const TESTNET: ConfigPreset = {
  blockchain: 'wss://rpc.testnet.cere.network/ws',
  nodes: [
    { grpcUrl: 'grpc://154.12.245.141:9090', httpUrl: 'http://154.12.245.141:8080' },
    { grpcUrl: 'grpc://31.220.96.199:9090', httpUrl: 'http://31.220.96.199:8080' },
    { grpcUrl: 'grpc://31.220.96.199:9091', httpUrl: 'http://31.220.96.199:8081' },
    { grpcUrl: 'grpc://31.220.96.198:9090', httpUrl: 'http://31.220.96.198:8080' },
    { grpcUrl: 'grpc://31.220.96.198:9091', httpUrl: 'http://31.220.96.198:8081' },
    { grpcUrl: 'grpc://31.220.96.197:9090', httpUrl: 'http://31.220.96.197:8080' },
    { grpcUrl: 'grpc://209.126.81.124:9090', httpUrl: 'http://209.126.81.124:8080' },
    { grpcUrl: 'grpc://209.126.81.124:9091', httpUrl: 'http://209.126.81.124:8081' },
    { grpcUrl: 'grpc://209.126.80.153:9091', httpUrl: 'http://209.126.80.153:8081' },
    { grpcUrl: 'grpc://209.145.62.255:9091', httpUrl: 'http://209.145.62.255:8081' },
    { grpcUrl: 'grpc://158.220.88.75:9090', httpUrl: 'http://158.220.88.75:8080' },
    { grpcUrl: 'grpc://158.220.88.75:9091', httpUrl: 'http://158.220.88.75:8081' },
    { grpcUrl: 'grpc://158.220.88.74:9091', httpUrl: 'http://158.220.88.74:8081' },
    { grpcUrl: 'grpc://158.220.88.73:9090', httpUrl: 'http://158.220.88.73:8080' },
    { grpcUrl: 'grpc://158.220.88.73:9091', httpUrl: 'http://158.220.88.73:8081' },
    { grpcUrl: 'grpc://38.242.148.54:9090', httpUrl: 'http://38.242.148.54:8080' },
    { grpcUrl: 'grpc://38.242.148.67:9090', httpUrl: 'http://38.242.148.67:8080' },
    { grpcUrl: 'grpc://38.242.148.67:9091', httpUrl: 'http://38.242.148.67:8081' },
    { grpcUrl: 'grpc://38.242.148.78:9090', httpUrl: 'http://38.242.148.78:8080' },
    { grpcUrl: 'grpc://5.78.111.88:9090', httpUrl: 'http://5.78.111.88:8080' },
    { grpcUrl: 'grpc://5.161.48.28:9090', httpUrl: 'http://5.161.48.28:8080' },
    { grpcUrl: 'grpc://5.161.48.28:9091', httpUrl: 'http://5.161.48.28:8081' },
    { grpcUrl: 'grpc://5.161.48.28:9092', httpUrl: 'http://5.161.48.28:8082' },
    { grpcUrl: 'grpc://5.161.48.28:9093', httpUrl: 'http://5.161.48.28:8083' },
    { grpcUrl: 'grpc://128.140.97.160:9090', httpUrl: 'http://128.140.97.160:8080' },
    { grpcUrl: 'grpc://49.13.23.245:9090', httpUrl: 'http://49.13.23.245:8080' },
    { grpcUrl: 'grpc://167.235.231.47:9090', httpUrl: 'http://167.235.231.47:8080' },
    { grpcUrl: 'grpc://95.216.139.48:9090', httpUrl: 'http://95.216.139.48:8080' },
    { grpcUrl: 'grpc://95.217.167.158:9090', httpUrl: 'http://95.217.167.158:8080' },
    { grpcUrl: 'grpc://140.82.50.92:9090', httpUrl: 'http://140.82.50.92:8080' },
    { grpcUrl: 'grpc://149.28.111.44:9090', httpUrl: 'http://149.28.111.44:8080' },
    { grpcUrl: 'grpc://66.135.30.145:9090', httpUrl: 'http://66.135.30.145:8080' },
    { grpcUrl: 'grpc://137.220.57.81:9090', httpUrl: 'http://137.220.57.81:8080' },
    { grpcUrl: 'grpc://149.28.242.196:9090', httpUrl: 'http://149.28.242.196:8080' },
    { grpcUrl: 'grpc://64.176.183.175:9090', httpUrl: 'http://64.176.183.175:8080' },
    { grpcUrl: 'grpc://45.76.131.46:9090', httpUrl: 'http://45.76.131.46:8080' },
    { grpcUrl: 'grpc://108.61.198.218:9090', httpUrl: 'http://108.61.198.218:8080' },
    { grpcUrl: 'grpc://80.240.22.212:9090', httpUrl: 'http://80.240.22.212:8080' },
    { grpcUrl: 'grpc://107.191.63.179:9090', httpUrl: 'http://107.191.63.179:8080' },
    { grpcUrl: 'grpc://64.176.67.225:9090', httpUrl: 'http://64.176.67.225:8080' },
  ],
};

export const DEFAULT_PRESET = TESTNET;
