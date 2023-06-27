import {CidBuilder, CipherInterface, NaclCipher, SchemeInterface, SchemeName} from '@cere-ddc-sdk/core';
import {SmartContractOptions, TESTNET} from '@cere-ddc-sdk/smart-contract';
import {FileStorageConfig} from '@cere-ddc-sdk/file-storage';
import {ContentAddressableStorageOptions} from '@cere-ddc-sdk/content-addressable-storage';

type CaOptions = Required<ContentAddressableStorageOptions>;

export interface ClientOptionsInterface extends CaOptions {
    fileOptions: FileStorageConfig;
}

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
    ) {}
}
