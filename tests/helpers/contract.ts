import * as fs from 'fs/promises';
import * as path from 'path';
import {ApiPromise, WsProvider} from '@polkadot/api';
import {CodePromise, ContractPromise, Abi} from '@polkadot/api-contract';
import {KeyringPair} from '@polkadot/keyring/types';

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
    const blockWeights = api.consts.system.blockWeights.toString();
    const gasLimit = JSON.parse(blockWeights).maxBlock / 10;

    const codePromise = new CodePromise(api, abi, wasm);
    const tx = codePromise.tx.new({
        gasLimit,
        storageDepositLimit: 750000000000,
        value: 0,
    });

    return new Promise<string>((resolve, reject) =>
        tx.signAndSend(signer, ({events = [], status}) => {
            if (status.isInvalid) {
                return reject('Transaction invalid');
            }

            if (status.isFinalized) {
                const contractInstantiatedEvent = events.find(({event}) => api.events.contracts.Instantiated.is(event));

                if (!contractInstantiatedEvent) {
                    return reject('The contract has not been instantiated');
                }

                const [, address] = contractInstantiatedEvent.event.toHuman().data as string[];

                resolve(address);
            }
        }),
    );
};

export const bootstrapContract = async (api: ApiPromise, signer: KeyringPair) => {
    const {abi, wasm} = await readContract();
    const address = await deployContract(api, signer, abi, wasm);
    const contract = new ContractPromise(api, abi, address);

    return contract;
};
