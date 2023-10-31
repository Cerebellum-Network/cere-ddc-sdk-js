import {ApiPromise, WsProvider} from '@polkadot/api';
import {DecodedEvent} from '@polkadot/api-contract/types';
import {AddressOrPair, SubmittableExtrinsic, SubmittableResultValue} from '@polkadot/api/types';
import {mnemonicGenerate} from '@polkadot/util-crypto';
import {Keyring} from '@polkadot/keyring';

import types from '../fixtures/blockchain/types.json';
import contractAbi from '../fixtures/contract/metadata.json';
import {ROOT_USER_SEED} from './constants';

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

export const getAccount = (uri = ROOT_USER_SEED) => {
    const keyring = new Keyring({type: 'sr25519', ss58Format: 54});

    return keyring.addFromUri(uri);
};

export const createAccount = () => {
    const keyring = new Keyring({type: 'sr25519', ss58Format: 54});
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

export const transferCere = async (api: ApiPromise, to: string, tokens: number) => {
    const [decimals] = api.registry.chainDecimals;
    const multiplier = 10n ** BigInt(decimals);
    const transfer = api.tx.balances.transfer(to, BigInt(tokens) * multiplier);

    return signAndSend(transfer, getAccount('//Alice'));
};

export const getContractOptions = () => ({
    abi: contractAbi,
    contractAddress: global.DDC_CONTRACT_ADDRESS,
    rpcUrl: global.DDC_API_URL,
});

export const signAndSend = (tx: SubmittableExtrinsic<'promise'>, account: AddressOrPair) =>
    new Promise<SignAndSendResult>((resolve, reject) =>
        tx.signAndSend(account, (result) => {
            const {events = [], status, contractEvents = [], dispatchError} = result as TxResult;

            if (status.isFinalized) {
                return resolve({
                    events,
                    contractEvents,
                    blockHash: status.asFinalized.toHex(),
                });
            }

            if (dispatchError) {
                return reject(new Error(dispatchError.toString()));
            }
        }),
    );
