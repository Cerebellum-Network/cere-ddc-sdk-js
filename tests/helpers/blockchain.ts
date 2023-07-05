import {ApiPromise, WsProvider} from '@polkadot/api';
import {DecodedEvent} from '@polkadot/api-contract/types';
import {AddressOrPair, SubmittableExtrinsic, SubmittableResultValue} from '@polkadot/api/types';
import {mnemonicGenerate} from '@polkadot/util-crypto';
import {Keyring} from '@polkadot/keyring';

import types from '../fixtures/blockchain/types.json';

type TxResult = SubmittableResultValue & {
    contractEvents?: DecodedEvent[];
};

export type SignAndSendResult = Required<Pick<TxResult, 'events' | 'contractEvents'>> & {
    blockHash: string;
};

export const createBlockhainApi = async () => {
    const provider = new WsProvider('ws://localhost:9944');
    const api = await ApiPromise.create({provider, types});

    return api.isReady;
};

export const getAccount = async (uri = '//Alice') => {
    const keyring = new Keyring({type: 'sr25519'});

    return keyring.addFromUri(uri);
};

export const createAccount = () => {
    const keyring = new Keyring({type: 'sr25519'});
    const mnemonic = mnemonicGenerate(12);
    const account = keyring.addFromMnemonic(mnemonic);

    return {
        account,
        mnemonic,
        address: account.address,
    };
};

export const getGasLimit = async (api: ApiPromise) => {
    const blockWeights = api.consts.system.blockWeights.toString();

    return JSON.parse(blockWeights).maxBlock / 10;
};

export const signAndSend = (tx: SubmittableExtrinsic<'promise'>, account: AddressOrPair) =>
    new Promise<SignAndSendResult>((resolve, reject) =>
        tx.signAndSend(account, (result) => {
            const {events = [], status, contractEvents = []} = result as TxResult;

            console.log(`Transaction (${tx.hash.toHex()}) is ${status.type}`);

            if (status.isInvalid) {
                return reject('Invalid transaction');
            }

            if (status.isFinalized) {
                return resolve({
                    events,
                    contractEvents,
                    blockHash: status.asFinalized.toHex(),
                });
            }
        }),
    );
