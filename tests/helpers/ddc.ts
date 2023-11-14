import {StorageNodeConfig} from '@cere-ddc-sdk/ddc';

export const getStorageNodes = (): StorageNodeConfig[] => [
    {grpcUrl: 'grpc://localhost:9091', httpUrl: 'http://localhost:8091'},
    {grpcUrl: 'grpc://localhost:9092', httpUrl: 'http://localhost:8092'},
    {grpcUrl: 'grpc://localhost:9093', httpUrl: 'http://localhost:8093'},
    {grpcUrl: 'grpc://localhost:9094', httpUrl: 'http://localhost:8094'},
];
