import {FileStorageConfig} from '@cere-ddc-sdk/file-storage';
import {ClientOptions, ClientOptionsInterface} from '../options/ClientOptions';
import {RequiredSelected} from '@cere-ddc-sdk/core';

const defaultClientOptions = new ClientOptions();
const defaultFileOptions = new FileStorageConfig();

type Options = RequiredSelected<Partial<ClientOptionsInterface>, 'clusterAddress'>;

export const initDefaultClientOptions = (options: Options): ClientOptionsInterface => {
    if (!options.clusterAddress && options.clusterAddress != 0) {
        throw new Error(`invalid clusterAddress='${options.clusterAddress}'`);
    }

    options.fileOptions = {
        parallel: options.fileOptions?.parallel || defaultFileOptions.parallel,
        pieceSizeInBytes: options.fileOptions?.pieceSizeInBytes || defaultFileOptions.pieceSizeInBytes,
    };

    return {
        clusterAddress: options.clusterAddress,
        fileOptions: {
            parallel: options.fileOptions?.parallel || defaultFileOptions.parallel,
            pieceSizeInBytes: options.fileOptions?.pieceSizeInBytes || defaultFileOptions.pieceSizeInBytes,
        },
        smartContract: options.smartContract || defaultClientOptions.smartContract,
        scheme: options.scheme || defaultClientOptions.scheme,
        cipher: options.cipher || defaultClientOptions.cipher,
        cidBuilder: options.cidBuilder || defaultClientOptions.cidBuilder,
        readAttempts: options.readAttempts || defaultClientOptions.readAttempts,
        writeAttempts: options.writeAttempts || defaultClientOptions.writeAttempts,
        ackTimeout: options.ackTimeout || defaultClientOptions.ackTimeout,
        session: options.session || null,
        routerServiceUrl: options.routerServiceUrl || '',
    };
};
