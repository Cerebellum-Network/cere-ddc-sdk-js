import {ApiPromise, WsProvider} from '@polkadot/api';
import {Keyring} from '@polkadot/keyring';

import types from '../fixtures/blockchain/types.json';

export const createBlockhainApi = async () => {
    const provider = new WsProvider('ws://localhost:9944');
    const api = await ApiPromise.create({provider, types});

    return api.isReady;
};

export const createSigner = async (uri = '//Alice') => {
    const keyring = new Keyring({type: 'sr25519'});

    return keyring.addFromUri(uri);
};
