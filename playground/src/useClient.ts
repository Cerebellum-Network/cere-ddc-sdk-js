import {useEffect, useState} from 'react';
import {DEVNET, DdcClient, Signer} from '@cere-ddc-sdk/ddc-client';

type ClientOptions = {
    signer?: string | Signer;
};

const defaultNode = {
    grpcUrl: 'grpc://localhost:9091',
    httpUrl: 'http://localhost:8091',
};

export const useClient = ({signer}: ClientOptions = {}) => {
    const [client, setClient] = useState<DdcClient>();
    const contractAddress = process.env.SC_ADDRESS;
    const rpcUrl = process.env.BC_ENDPOINT;

    if (!contractAddress) {
        throw new Error('No SC_ADDRESS environment variable');
    }

    if (!rpcUrl) {
        throw new Error('No BC_ENDPOINT environment variable');
    }

    useEffect(() => {
        if (!signer) {
            return;
        }

        DdcClient.create(signer, {
            ...DEVNET,
            nodes: [defaultNode],
            smartContract: {...DEVNET.smartContract, contractAddress, rpcUrl},
        }).then(setClient);
    }, [signer]);

    return client;
};
