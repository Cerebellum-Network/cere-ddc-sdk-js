import {RequiredSelected} from '@cere-ddc-sdk/core';
import {StorageOptions} from '../StorageOptions';
import {CaCreateOptions} from '../ca-create-options';

const defaultOptions = new StorageOptions();
type Options = RequiredSelected<Partial<CaCreateOptions>, 'clusterAddress'>;

export const initDefaultOptions = (options: Options): CaCreateOptions => {
    if (!options.clusterAddress && options.clusterAddress != 0) {
        throw new Error(`invalid clusterAddress='${options.clusterAddress}'`)
    }

    return {
        clusterAddress: options.clusterAddress,
        smartContract: options.smartContract || defaultOptions.smartContract,
        scheme: options.scheme || defaultOptions.scheme,
        cipher: options.cipher || defaultOptions.cipher,
        cidBuilder: options.cidBuilder || defaultOptions.cidBuilder,
        readAttempts: options.readAttempts || 1,
        ackTimeout: options.ackTimeout,
        tier: options.tier,
    }
}
