import {ApiPromise} from '@polkadot/api';
import {ContractPromise} from '@polkadot/api-contract';
import {KeyringPair} from '@polkadot/keyring/types';

import {bootstrapContract, createBlockhainApi, createSigner} from './helpers';

describe('packages/smart-contract/src/SmartContract.ts', () => {
    let api: ApiPromise;
    let signer: KeyringPair;
    let contract: ContractPromise;

    beforeAll(async () => {
        api = await createBlockhainApi();
        signer = await createSigner();
        contract = await bootstrapContract(api, signer);
    });

    afterAll(async () => {
        await api.disconnect();
    });

    it('should have an address', async () => {
        expect(contract.address).toBeTruthy();
    });
});
