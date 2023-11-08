import * as sc from '@cere-ddc-sdk/smart-contract';

import type {DdcClientConfig} from './DdcClient';

export const MAINNET: DdcClientConfig = {
    smartContract: sc.MAINNET,
    nodes: [],
};

export const DEVNET: DdcClientConfig = {
    smartContract: sc.DEVNET,
    nodes: [],
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
