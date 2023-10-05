import {
    CidBuilder,
    CipherInterface,
    NaclCipher,
    RequiredSelected,
    SchemeInterface,
    SchemeName,
} from '@cere-ddc-sdk/core';
import {SmartContractOptions, TESTNET} from '@cere-ddc-sdk/smart-contract';
import {FileStorageConfig} from '@cere-ddc-sdk/file-storage';
import {
    ContentAddressableStorageOptions,
    Session,
    COLLECTION_POINT_SERVICE_URL,
    ROUTING_SERVICE_URL,
} from '@cere-ddc-sdk/content-addressable-storage';

type CaOptions = Required<ContentAddressableStorageOptions>;

export interface ClientOptionsInterface extends Omit<CaOptions, 'smartContract'> {
    fileOptions: FileStorageConfig;
    smartContract: SmartContractOptions;
}

export type CreateClientOptions = RequiredSelected<Partial<ClientOptionsInterface>, 'clusterAddress'>;

export class ClientOptions implements ClientOptionsInterface {
    constructor(
        public readonly clusterAddress: string | number = '',
        public readonly fileOptions: FileStorageConfig = new FileStorageConfig(),
        public readonly smartContract: SmartContractOptions = TESTNET,
        public readonly scheme: SchemeName | SchemeInterface = 'sr25519',
        public readonly cipher: CipherInterface = new NaclCipher(),
        public readonly cidBuilder: CidBuilder = new CidBuilder(),
        public readonly readAttempts = 1,
        public readonly writeAttempts = 1,
        public readonly ackTimeout = 500,
        public readonly session: Session | null = null,
        public readonly routerServiceUrl: string | null = ROUTING_SERVICE_URL,
        public readonly collectionPointServiceUrl: string | null = COLLECTION_POINT_SERVICE_URL,
    ) {}
}
