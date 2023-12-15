import { StorageNodeConfig } from '@cere-ddc-sdk/ddc';

type NodeConfig = StorageNodeConfig & {
  mnemonic: string;
};

export const getStorageNodes = (): NodeConfig[] => [
  {
    grpcUrl: 'grpc://localhost:9091',
    httpUrl: 'http://localhost:8091',
    mnemonic: 'whip clump surface eternal summer acoustic broom duty magic extend virtual fly',
  },

  {
    grpcUrl: 'grpc://localhost:9092',
    httpUrl: 'http://localhost:8092',
    mnemonic: 'scorpion dish want gorilla novel tape world hip rescue tank oyster pipe',
  },

  {
    grpcUrl: 'grpc://localhost:9093',
    httpUrl: 'http://localhost:8093',
    mnemonic: 'rule output true detect matrix wife raven wreck primary mansion spike coral',
  },

  {
    grpcUrl: 'grpc://localhost:9094',
    httpUrl: 'http://localhost:8094',
    mnemonic: 'paper salon seed crystal gun envelope wolf twice pistol episode guitar borrow',
  },
];
