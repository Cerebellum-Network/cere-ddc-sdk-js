import {SmartContract, SmartContractOptions, TESTNET} from '@cere-ddc-sdk/smart-contract';
import {CidBuilder, CipherInterface, NaclCipher, SchemeInterface, SchemeName} from '@cere-ddc-sdk/core';

export interface StorageOptionsInterface {
    clusterAddress: string | number;
    smartContract: SmartContractOptions | SmartContract;
    scheme: SchemeName | SchemeInterface;
    cipher: CipherInterface;
    cidBuilder: CidBuilder;
    routerServiceUrl: string | null;
}

export class StorageOptions implements StorageOptionsInterface {
    constructor(
        public readonly clusterAddress: string | number = '',
        public readonly smartContract: SmartContractOptions = TESTNET,
        public readonly scheme: SchemeName | SchemeInterface = 'sr25519',
        public readonly cipher: CipherInterface = new NaclCipher(),
        public readonly cidBuilder: CidBuilder = new CidBuilder(),
        public readonly routerServiceUrl: string | null = null,
    ) {}
}
