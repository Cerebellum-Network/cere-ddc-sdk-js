import { StorageNodeConfig, StorageNodeMode } from '@cere-ddc-sdk/ddc';
import { DdcClientConfig } from '@cere-ddc-sdk/ddc-client';

import { BLOCKCHAIN_RPC_URL } from './blockchain';

type NodeConfig = StorageNodeConfig & {
  mnemonic: string;
};

export const getStorageNodes = (host = 'localhost'): NodeConfig[] => [
  {
    mode: StorageNodeMode.Storage,
    grpcUrl: `grpc://${host}:9091`,
    httpUrl: `http://${host}:8091`,
    mnemonic: 'whip clump surface eternal summer acoustic broom duty magic extend virtual fly',
  },

  {
    mode: StorageNodeMode.Storage,
    grpcUrl: `grpc://${host}:9092`,
    httpUrl: `http://${host}:8092`,
    mnemonic: 'scorpion dish want gorilla novel tape world hip rescue tank oyster pipe',
  },

  {
    mode: StorageNodeMode.Full,
    grpcUrl: `grpc://${host}:9093`,
    httpUrl: `http://${host}:8093`,
    mnemonic: 'rule output true detect matrix wife raven wreck primary mansion spike coral',
  },

  {
    mode: StorageNodeMode.Full,
    grpcUrl: `grpc://${host}:9094`,
    httpUrl: `http://${host}:8094`,
    mnemonic: 'paper salon seed crystal gun envelope wolf twice pistol episode guitar borrow',
  },

  {
    mode: StorageNodeMode.Cache,
    grpcUrl: `grpc://${host}:9095`,
    httpUrl: `http://${host}:8095`,
    mnemonic: 'spike sun exchange lava weekend october sock wait attend garden carbon promote',
  },
];

type ClientOptions = Pick<DdcClientConfig, 'logLevel' | 'nodes'>;

export const getClientConfig = (options: ClientOptions = {}): DdcClientConfig => ({
  blockchain: BLOCKCHAIN_RPC_URL,
  logLevel: options.logLevel || 'info',
});
