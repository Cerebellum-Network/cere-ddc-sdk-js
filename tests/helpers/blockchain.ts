import {ApiPromise, WsProvider} from '@polkadot/api';
import {AddressOrPair, SubmittableExtrinsic, SubmittableResultValue} from '@polkadot/api/types';
import {Keyring} from '@polkadot/keyring';

import types from '../fixtures/blockchain/types.json';

export type SignAndSendResult = {
    events: Required<SubmittableResultValue>['events'];
    blockHash: string;
};

export const createBlockhainApi = async () => {
    const provider = new WsProvider('ws://localhost:9944');
    const api = await ApiPromise.create({provider, types});

    return api.isReady;
};

export const createSigner = async (uri = '//Alice') => {
    const keyring = new Keyring({type: 'sr25519'});

    return keyring.addFromUri(uri);
};

export const getGasLimit = async (api: ApiPromise) => {
    const blockWeights = api.consts.system.blockWeights.toString();

    return JSON.parse(blockWeights).maxBlock / 10;
};

export const signAndSend = (tx: SubmittableExtrinsic<any>, signer: AddressOrPair) =>
    new Promise<SignAndSendResult>((resolve, reject) =>
        tx.signAndSend(signer, ({events = [], status}) => {
            console.log(`Transaction (${tx.hash.toHex()}) is ${status.type}`);

            if (status.isInvalid) {
                return reject('Invalid transaction');
            }

            if (status.isFinalized) {
                return resolve({
                    events,
                    blockHash: status.asFinalized.toHex(),
                });
            }
        }),
    );
