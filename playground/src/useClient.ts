import {useEffect, useState} from 'react';
import {DEVNET, DdcClient, Signer} from '@cere-ddc-sdk/ddc-client';

type ClientOptions = {
    signer?: string | Signer;
};

export const useClient = ({signer}: ClientOptions = {}) => {
    const [client, setClient] = useState<DdcClient>();
    const blockchain = process.env.BC_ENDPOINT;

    if (!blockchain) {
        throw new Error('No BC_ENDPOINT environment variable');
    }

    useEffect(() => {
        if (!signer) {
            return;
        }

        DdcClient.create(signer, {blockchain}).then(setClient);
    }, [signer]);

    return client;
};
