import {Blockchain} from '@cere-ddc-sdk/blockchain';

import {RouterNode} from './Router';

export type ConfigPreset = {
    blockchain: Blockchain | string;
    nodes?: RouterNode[];
};

export const MAINNET: ConfigPreset = {
    blockchain: 'wss://rpc.qanet.cere.network/ws',
};

export const DEVNET: ConfigPreset = {
    blockchain: 'wss://archive.devnet.cere.network/ws',
    nodes: [
        {grpcUrl: 'grpc://38.242.236.247:9090', httpUrl: 'http://38.242.236.247:8080'},
        {grpcUrl: 'grpc://38.242.236.247:9091', httpUrl: 'http://38.242.236.247:8081'},
        {grpcUrl: 'grpc://158.220.87.61:9090', httpUrl: 'http://158.220.87.61:8080'},
        {grpcUrl: 'grpc://158.220.87.61:9091', httpUrl: 'http://158.220.87.61:8081'},
        {grpcUrl: 'grpc://89.117.79.111:9090', httpUrl: 'http://89.117.79.111:8080'},
        {grpcUrl: 'grpc://89.117.79.111:9091', httpUrl: 'http://89.117.79.111:8081'},
        {grpcUrl: 'grpc://154.53.57.124:9090', httpUrl: 'http://154.53.57.124:8080'},
        {grpcUrl: 'grpc://154.53.57.124:9091', httpUrl: 'http://154.53.57.124:8081'},
    ],
};

export const TESTNET: ConfigPreset = {
    blockchain: 'wss://rpc.testnet.cere.network/ws',
    nodes: [
        {grpcUrl: 'grpc://154.12.245.141:9090', httpUrl: 'http://154.12.245.141:8080'},
        {grpcUrl: 'grpc://154.12.245.141:9091', httpUrl: 'http://154.12.245.141:8081'},
        {grpcUrl: 'grpc://154.12.245.139:9090', httpUrl: 'http://154.12.245.139:8080'},
        {grpcUrl: 'grpc://154.12.245.139:9091', httpUrl: 'http://154.12.245.139:8081'},
        {grpcUrl: 'grpc://154.12.245.135:9090', httpUrl: 'http://154.12.245.135:8080'},
        {grpcUrl: 'grpc://154.12.245.135:9091', httpUrl: 'http://154.12.245.135:8081'},
        {grpcUrl: 'grpc://31.220.96.199:9090', httpUrl: 'http://31.220.96.199:8080'},
        {grpcUrl: 'grpc://31.220.96.199:9091', httpUrl: 'http://31.220.96.199:8081'},
        {grpcUrl: 'grpc://31.220.96.198:9090', httpUrl: 'http://31.220.96.198:8080'},
        {grpcUrl: 'grpc://31.220.96.198:9091', httpUrl: 'http://31.220.96.198:8081'},
    ],
};

export const DEFAULT_PRESET = TESTNET;
