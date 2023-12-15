import * as fs from 'fs/promises';
import * as path from 'path';
import { ApiPromise } from '@polkadot/api';
import { CodePromise, Abi } from '@polkadot/api-contract';
import { KeyringPair } from '@polkadot/keyring/types';

import { BLOCKCHAIN_MAX_BLOCK_WEIGHT } from './constants';
import { signAndSend } from './blockchain';

const readContract = async (path: string) => {
  const contractContent = await fs.readFile(path);
  const contract = JSON.parse(contractContent.toString());

  return {
    abi: new Abi(contract),
    wasm: contract.source.wasm.toString(),
  };
};

const deployContract = async (api: ApiPromise, account: KeyringPair, abi: Abi, wasm: string) => {
  const codePromise = new CodePromise(api, abi, wasm);
  const tx = codePromise.tx.new({
    value: 0,
    gasLimit: BLOCKCHAIN_MAX_BLOCK_WEIGHT / 2,
    storageDepositLimit: 750_000_000_000,
  });

  const { events } = await signAndSend(tx, account);
  const foundEvent = events.find(({ event }) => api.events.contracts.Instantiated.is(event));
  const [, address] = foundEvent?.event.toJSON().data as string[];

  return address;
};

export const deployAuthContract = async (api: ApiPromise, signer: KeyringPair) => {
  const contractDir = path.resolve(__dirname, '../fixtures/contract');
  const contractPath = path.resolve(contractDir, 'cluster_node_candidate_authorization.contract');

  const { abi, wasm } = await readContract(contractPath);

  return deployContract(api, signer, abi, wasm);
};
