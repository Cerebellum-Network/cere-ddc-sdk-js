import {useEffect, useState} from 'react';
import {DEVNET, DdcClient} from '@cere-ddc-sdk/ddc-client';
import {USER_SEED} from './constants';

export const useClient = () => {
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
        DdcClient.create(USER_SEED, {
            ...DEVNET,
            smartContract: {...DEVNET.smartContract, contractAddress, rpcUrl},
        }).then(setClient);
    }, []);

    return client;
};
