import * as fs from 'fs/promises';
import * as path from 'path';
import {ApiPromise} from '@polkadot/api';
import {CodePromise, ContractPromise, Abi} from '@polkadot/api-contract';
import {KeyringPair} from '@polkadot/keyring/types';

import {getGasLimit, signAndSend} from './blockchain';

const readRegistry = async () => {
    const contractDir = path.resolve(__dirname, '../fixtures/contract');

    const contractContent = await fs.readFile(path.resolve(contractDir, 'global_nft_registry.contract'));
    const metadata = await fs.readFile(path.resolve(contractDir, 'metadata.json'));
    const contract = JSON.parse(contractContent.toString());

    return {
        abi: new Abi(metadata.toString()),
        wasm: contract.source.wasm.toString(),
    };
};

const deployRegistry = async (api: ApiPromise, account: KeyringPair, abi: Abi, wasm: string) => {
    const codePromise = new CodePromise(api, abi, wasm);
    const tx = codePromise.tx.new({
        value: 0,
        gasLimit: await getGasLimit(api),
        storageDepositLimit: 750_000_000_000,
    });

    const {events} = await signAndSend(tx, account);
    const foundEvent = events.find(({event}) => api.events.contracts.Instantiated.is(event));
    const [, address] = foundEvent?.event.toJSON().data as string[];

    return address;
};

export const bootstrapRegistry = async (api: ApiPromise, signer: KeyringPair) => {
    const {abi, wasm} = await readRegistry();
    const address = await deployRegistry(api, signer, abi, wasm);
    const contract = new ContractPromise(api, abi, address);

    return contract;
};
