import * as fs from 'fs/promises';
import * as path from 'path';
import {ApiPromise} from '@polkadot/api';
import {CodePromise, ContractPromise, Abi} from '@polkadot/api-contract';
import {KeyringPair} from '@polkadot/keyring/types';

import {getGasLimit, signAndSend} from './blockchain';

const readContract = async () => {
    const contractDir = path.resolve(__dirname, '../fixtures/contract');

    const contractContent = await fs.readFile(path.resolve(contractDir, 'ddc_bucket.contract'));
    const metadata = await fs.readFile(path.resolve(contractDir, 'metadata.json'));
    const contract = JSON.parse(contractContent.toString());

    return {
        abi: new Abi(metadata.toString()),
        wasm: contract.source.wasm.toString(),
    };
};

const deployContract = async (api: ApiPromise, signer: KeyringPair, abi: Abi, wasm: string) => {
    const codePromise = new CodePromise(api, abi, wasm);
    const tx = codePromise.tx.new({
        value: 0,
        gasLimit: await getGasLimit(api),
        storageDepositLimit: 750_000_000_000,
    });

    const {events} = await signAndSend(tx, signer);
    const foundEvent = events.find(({event}) => api.events.contracts.Instantiated.is(event));
    const [, address] = foundEvent?.event.toHuman().data as string[];

    return address;
};

export const bootstrapContract = async (api: ApiPromise, signer: KeyringPair) => {
    const {abi, wasm} = await readContract();
    const address = await deployContract(api, signer, abi, wasm);
    const contract = new ContractPromise(api, abi, address);

    return contract;
};
