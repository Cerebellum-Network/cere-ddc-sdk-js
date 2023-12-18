import { RouterNode } from './Router';

export type ConfigPreset = {
  blockchain: string;
  nodes?: RouterNode[];
};

export const MAINNET: ConfigPreset = {
  blockchain: 'wss://rpc.qanet.cere.network/ws',
};

/**
 * Static DEVNET preset
 *
 * TODO: Remove after full migration to on-chain topology
 */
// export const DEVNET: ConfigPreset = {
//   blockchain: 'wss://archive.devnet.cere.network/ws',
//   nodes: [
//     { grpcUrl: 'grpc://38.242.236.247:9090', httpUrl: 'https://storage-1.ddc-devnet.cloud', ssl: true },
//     { grpcUrl: 'grpc://38.242.236.247:9091', httpUrl: 'http://38.242.236.247:8081' },
//     { grpcUrl: 'grpc://158.220.87.61:9090', httpUrl: 'https://storage-3.ddc-devnet.cloud', ssl: true },
//     { grpcUrl: 'grpc://158.220.87.61:9091', httpUrl: 'http://158.220.87.61:8081' },
//     { grpcUrl: 'grpc://89.117.79.111:9090', httpUrl: 'https://storage-5.ddc-devnet.cloud', ssl: true },
//     { grpcUrl: 'grpc://89.117.79.111:9091', httpUrl: 'http://89.117.79.111:8081' },
//     { grpcUrl: 'grpc://154.53.57.124:9090', httpUrl: 'https://storage-7.ddc-devnet.cloud', ssl: true },
//     { grpcUrl: 'grpc://154.53.57.124:9091', httpUrl: 'http://154.53.57.124:8081' },
//   ],
// };

export const DEVNET: ConfigPreset = {
  /**
   * TODO: Use devnet blockchain once it's ready
   */
  blockchain: 'wss://ext-devs-node-1.cluster-3.cere.network:9945',
};

export const TESTNET: ConfigPreset = {
  blockchain: 'wss://rpc.testnet.cere.network/ws',
  nodes: [
    { grpcUrl: 'grpc://128.140.103.37:9090', httpUrl: 'https://storage-1.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://162.55.218.0:9090', httpUrl: 'https://storage-2.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://94.130.27.127:9090', httpUrl: 'https://storage-3.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://157.90.226.137:9090', httpUrl: 'https://storage-4.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://116.203.211.74:9090', httpUrl: 'https://storage-5.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://116.203.188.159:9090', httpUrl: 'https://storage-6.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://66.135.3.185:9090', httpUrl: 'https://storage-7.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://207.246.92.234:9090', httpUrl: 'https://storage-8.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://116.203.153.145:9090', httpUrl: 'https://storage-9.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://94.130.183.14:9090', httpUrl: 'https://storage-10.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://78.47.189.200:9090', httpUrl: 'https://storage-11.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://116.203.83.55:9090', httpUrl: 'https://storage-12.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://95.217.155.6:9090', httpUrl: 'https://storage-13.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://65.108.154.151:9090', httpUrl: 'https://storage-14.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://37.27.18.247:9090', httpUrl: 'https://storage-15.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://65.109.138.28:9090', httpUrl: 'https://storage-16.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://162.212.158.22:9090', httpUrl: 'https://storage-17.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://162.212.154.25:9090', httpUrl: 'https://storage-18.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://162.212.154.242:9090', httpUrl: 'https://storage-19.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://162.212.154.45:9090', httpUrl: 'https://storage-20.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://162.212.157.36:9090', httpUrl: 'https://storage-21.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://162.212.157.4:9090', httpUrl: 'https://storage-22.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://162.212.154.45:9090', httpUrl: 'https://storage-23.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://162.212.157.254:9090', httpUrl: 'https://storage-24.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://38.242.148.54:9090', httpUrl: 'https://storage-25.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://38.242.148.67:9090', httpUrl: 'https://storage-26.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://38.242.148.78:9090', httpUrl: 'https://storage-27.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://154.12.245.135:9090', httpUrl: 'https://storage-28.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://154.12.245.139:9090', httpUrl: 'https://storage-29.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://154.12.245.141:9090', httpUrl: 'https://storage-30.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://31.220.96.197:9090', httpUrl: 'https://storage-31.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://31.220.96.198:9090', httpUrl: 'https://storage-32.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://37.27.26.9:9090', httpUrl: 'https://storage-33.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://37.27.15.104:9090', httpUrl: 'https://storage-34.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://65.108.244.154:9090', httpUrl: 'https://storage-35.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://65.21.111.73:9090', httpUrl: 'https://storage-36.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://135.181.80.135:9090', httpUrl: 'https://storage-37.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://65.109.174.181:9090', httpUrl: 'https://storage-38.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://65.109.227.87:9090', httpUrl: 'https://storage-39.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://65.108.211.60:9090', httpUrl: 'https://storage-40.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://78.47.122.10:9090', httpUrl: 'https://storage-41.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://128.140.97.160:9090', httpUrl: 'https://storage-42.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://49.13.23.245:9090', httpUrl: 'https://storage-43.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://167.235.231.47:9090', httpUrl: 'https://storage-44.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://65.21.54.218:9090', httpUrl: 'https://storage-45.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://37.27.15.137:9090', httpUrl: 'https://storage-46.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://95.216.139.48:9090', httpUrl: 'https://storage-47.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://95.217.167.158:9090', httpUrl: 'https://storage-48.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://149.248.2.7:9090', httpUrl: 'https://storage-49.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://140.82.50.92:9090', httpUrl: 'https://storage-50.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://149.28.111.44:9090', httpUrl: 'https://storage-51.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://66.135.30.145:9090', httpUrl: 'https://storage-52.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://45.63.65.67:9090', httpUrl: 'https://storage-53.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://137.220.57.81:9090', httpUrl: 'https://storage-54.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://207.148.2.17:9090', httpUrl: 'https://storage-55.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://149.28.242.196:9090', httpUrl: 'https://storage-56.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://64.176.183.175:9090', httpUrl: 'https://storage-57.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://45.76.131.46:9090', httpUrl: 'https://storage-58.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://108.61.198.218:9090', httpUrl: 'https://storage-59.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://80.240.22.212:9090', httpUrl: 'https://storage-60.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://107.191.63.179:9090', httpUrl: 'https://storage-61.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://65.20.100.39:9090', httpUrl: 'https://storage-62.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://65.20.112.89:9090', httpUrl: 'https://storage-63.ddc-testnet.cloud', ssl: true },
    { grpcUrl: 'grpc://64.176.67.225:9090', httpUrl: 'https://storage-64.ddc-testnet.cloud', ssl: true },
  ],
};

export const DEFAULT_PRESET = TESTNET;
