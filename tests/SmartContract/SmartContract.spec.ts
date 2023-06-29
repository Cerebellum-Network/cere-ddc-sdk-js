import {ApiPromise, WsProvider} from '@polkadot/api';
import {CodePromise} from '@polkadot/api-contract';
import {Keyring} from '@polkadot/keyring';
import {KeyringPair} from '@polkadot/keyring/types';

import {readContract} from './contract';
import {cereTypes} from '../../packages/smart-contract/src/types/cere_types';
// import {SmartContract} from '@cere-ddc-sdk/smart-contract';

const getApi = async () => {
    const wsProvider = new WsProvider('ws://localhost:9944');
    const api = await ApiPromise.create({
        provider: wsProvider,
        types: cereTypes,
    });

    return api.isReady;
};

const deployContract = async (api: ApiPromise, signer: KeyringPair) => {
    const {abi, wasm} = await readContract();

    const blockWeights = api.consts.system.blockWeights.toString();
    const gasLimit = JSON.parse(blockWeights).maxBlock / 10;

    const codePromise = new CodePromise(api, abi, wasm);
    const tx = codePromise.tx.new({
        gasLimit,
        storageDepositLimit: 750000000000,
        value: 0,
    });

    return new Promise((resolve, reject) =>
        tx.signAndSend(signer, ({events = [], status}) => {
            if (status.isInvalid) {
                return reject('Transaction invalid');
            }

            if (status.isFinalized) {
                const contractInstantiatedEvent = events.find(({event}) => api.events.contracts.Instantiated.is(event));
                const extrinsicFailedEvent = events.find(({event}) => api.events.system.ExtrinsicFailed.is(event));

                if (extrinsicFailedEvent) {
                    const humanEvent = extrinsicFailedEvent.toHuman();

                    console.log(humanEvent);
                }

                if (!contractInstantiatedEvent) {
                    return reject('The contract has not been instantiated');
                }

                const [, address] = contractInstantiatedEvent?.event.toHuman().data as any[];

                return address && resolve(address);
            }
        }),
    );
};

const createSigner = async () => {
    const keyring = new Keyring({type: 'sr25519'});

    return keyring.addFromUri('//Alice');
};

describe('packages/smart-contract/src/SmartContract.ts', () => {
    let api: ApiPromise;
    let signer: KeyringPair;

    beforeAll(async () => {
        api = await getApi();
        signer = await createSigner();

        await deployContract(api, signer);
    });

    afterAll(async () => {
        await api.disconnect();
    });

    it('empty test', async () => {
        console.log('Empty test');
    });
});
