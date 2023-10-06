import {DEVNET, SmartContract, SmartContractOptions} from '@cere-ddc-sdk/smart-contract';
import {CidBuilder, CipherInterface, NaclCipher, SchemeInterface, SchemeName} from '@cere-ddc-sdk/core';

import {COLLECTION_POINT_SERVICE_URL, ROUTER_SERVICE_URL} from './constants';

export interface StorageOptionsInterface {
    clusterAddress: string | number;
    smartContract: SmartContractOptions | SmartContract;
    scheme: SchemeName | SchemeInterface;
    cipher: CipherInterface;
    cidBuilder: CidBuilder;
    routerServiceUrl: string | null;
    collectionPointServiceUrl: string | null;
}

export class StorageOptions implements StorageOptionsInterface {
    constructor(
        public readonly clusterAddress: string | number = '',
        public readonly smartContract: SmartContractOptions = DEVNET,
        public readonly scheme: SchemeName | SchemeInterface = 'sr25519',
        public readonly cipher: CipherInterface = new NaclCipher(),
        public readonly cidBuilder: CidBuilder = new CidBuilder(),
        public readonly routerServiceUrl: string | null = ROUTER_SERVICE_URL,
        public readonly collectionPointServiceUrl: string | null = COLLECTION_POINT_SERVICE_URL,
    ) {}
}
