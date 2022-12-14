import {
    CidBuilder,
    CipherInterface,
    NaclCipher,
    SchemeInterface,
    SchemeName
} from '@cere-ddc-sdk/core';
import {SmartContractOptions, TESTNET} from '@cere-ddc-sdk/smart-contract';
import {FileStorageConfig} from '@cere-ddc-sdk/file-storage';
import {ContentAddressableStorage} from '@cere-ddc-sdk/content-addressable-storage';
import {GetFirstArgument} from '@cere-ddc-sdk/core/browser';
import {Tier} from "@cere-ddc-sdk/content-addressable-storage/models/Tier";

type CaOptions = Required<Omit<GetFirstArgument<typeof ContentAddressableStorage.build>, 'tier'>>

export interface ClientOptionsInterface extends CaOptions {
    fileOptions: FileStorageConfig;
    tier?: Tier;
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
        public readonly ackTimeout = 500,
    ) {}
}
