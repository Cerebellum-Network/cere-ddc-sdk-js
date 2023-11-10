import * as sc from '@cere-ddc-sdk/smart-contract';

import type {DdcClientConfig} from './DdcClient';

export const MAINNET: DdcClientConfig = {
    smartContract: sc.MAINNET,
    nodes: [],
};

export const DEVNET: DdcClientConfig = {
    smartContract: sc.DEVNET,
    nodes: [
        {rpcHost: '38.242.236.247:9090'},
        {rpcHost: '38.242.236.247:9091'},
        {rpcHost: '158.220.87.61:9090'},
        {rpcHost: '158.220.87.61:9091'},
        {rpcHost: '89.117.79.111:9090'},
        {rpcHost: '89.117.79.111:9091'},
        {rpcHost: '154.53.57.124:9090'},
        {rpcHost: '154.53.57.124:9091'},
    ],
};

export const TESTNET: DdcClientConfig = {
    smartContract: sc.TESTNET,
    nodes: [
        {rpcHost: '154.12.245.141:9090'},
        {rpcHost: '154.12.245.141:9091'},
        {rpcHost: '154.12.245.139:9090'},
        {rpcHost: '154.12.245.139:9091'},
        {rpcHost: '154.12.245.135:9090'},
        {rpcHost: '154.12.245.135:9091'},
        {rpcHost: '31.220.96.199:9090'},
        {rpcHost: '31.220.96.199:9091'},
        {rpcHost: '31.220.96.198:9090'},
        {rpcHost: '31.220.96.198:9091'},
    ],
};
