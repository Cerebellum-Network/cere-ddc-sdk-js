import * as path from 'path';
import * as fs from 'fs';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { DecodedEvent } from '@polkadot/api-contract/types';
import { AddressOrPair, SubmittableExtrinsic, SubmittableResultValue } from '@polkadot/api/types';
import { mnemonicGenerate } from '@polkadot/util-crypto';
import { Keyring } from '@polkadot/keyring';
import { KeypairType } from '@polkadot/util-crypto/types';
import type { BucketId, ClusterId } from '@cere-ddc-sdk/blockchain';

import { ROOT_ACCOUNT_TYPE, ROOT_USER_SEED } from './constants';
import { getHostIP } from './net';

type TxResult = SubmittableResultValue & {
  contractEvents?: DecodedEvent[];
};

export type BlockchainState = {
  hostIp: string;
  clusterId: ClusterId;
  bucketIds: BucketId[];
  account: string;
};

export type SignAndSendResult = Required<Pick<TxResult, 'events' | 'contractEvents'>> & {
  blockHash: string;
};

export const BLOCKCHAIN_RPC_URL = `ws://${getHostIP()}:9944`;
export const createBlockhainApi = async () => {
  const provider = new WsProvider(BLOCKCHAIN_RPC_URL);
  const api = await ApiPromise.create({ provider });

  return api.isReady;
};

export const getAccount = (uri = ROOT_USER_SEED, type?: KeypairType) => {
  const keyring = new Keyring({
    type: type || (uri === ROOT_USER_SEED ? ROOT_ACCOUNT_TYPE : 'sr25519'),
    ss58Format: 54,
  });

  return keyring.addFromUri(uri);
};

export const createAccount = () => {
  const keyring = new Keyring({ type: 'sr25519', ss58Format: 54 });
  const mnemonic = mnemonicGenerate(12);
  const account = keyring.addFromMnemonic(mnemonic);

  return {
    account,
    mnemonic,
    address: account.address,
  };
};

export const transferCere = async (api: ApiPromise, to: string, tokens: number) => {
  const [decimals] = api.registry.chainDecimals;
  const multiplier = 10n ** BigInt(decimals);

  let transfer;
  try {
    transfer = api.tx.balances.transferAllowDeath(to, BigInt(tokens) * multiplier);
  } catch {
    // TODO: remove when all networks are upgraded to polkadot-sdk ^v1.2.0.
    transfer = api.tx.balances.transfer(to, BigInt(tokens) * multiplier);
  }

  return signAndSend(transfer, getAccount('//Alice'));
};

export const sendMultipleTransfers = (api: ApiPromise, transfers: { to: string; tokens: number }[]) => {
  const batch = api.tx.utility.batchAll(
    transfers.map(({ to, tokens }) => {
      const [decimals] = api.registry.chainDecimals;
      const multiplier = 10n ** BigInt(decimals);

      let transfer;
      try {
        transfer = api.tx.balances.transferAllowDeath(to, BigInt(tokens) * multiplier);
      } catch {
        // TODO: remove when all networks are upgraded to polkadot-sdk ^v1.2.0.
        transfer = api.tx.balances.transfer(to, BigInt(tokens) * multiplier);
      }

      return transfer;
    }),
  );

  return signAndSend(batch, getAccount('//Alice'));
};

export const readBlockchainStateFromDisk = (): BlockchainState => {
  const stateFile = path.resolve(__dirname, '../data/ddc.json');

  if (!fs.existsSync(stateFile)) {
    throw new Error('Blockhain environment is not stated or missing data');
  }

  const contractData = JSON.parse(fs.readFileSync(stateFile).toString('utf8'), (key, value) =>
    key === 'bucketIds' ? value.map(BigInt) : value,
  );

  return contractData;
};

export const writeBlockchainStateToDisk = (state: BlockchainState) => {
  const stateFile = path.resolve(__dirname, '../data/ddc.json');
  const contractDataJson = JSON.stringify(
    state,
    (key, value) => (typeof value === 'bigint' ? value.toString() : value),
    2,
  );

  fs.writeFileSync(stateFile, contractDataJson);
};

export const getBlockchainState = () => {
  const state = readBlockchainStateFromDisk();

  return {
    ...state,
    rpcUrl: BLOCKCHAIN_RPC_URL,
  };
};

export const signAndSend = (tx: SubmittableExtrinsic<'promise'>, account: AddressOrPair) =>
  new Promise<SignAndSendResult>((resolve, reject) =>
    tx.signAndSend(account, (result) => {
      const { events = [], status, contractEvents = [], dispatchError } = result as TxResult;
      if (status.isFinalized) {
        return resolve({
          events,
          contractEvents,
          blockHash: status.asFinalized.toHex(),
        });
      }

      if (dispatchError) {
        let errorMessage: string | undefined;

        if (dispatchError.isModule) {
          const decoded = tx.registry.findMetaError(dispatchError.asModule);
          errorMessage = `${decoded.section}.${decoded.name}: ${decoded.docs.join(' ')}`;
        } else {
          errorMessage = dispatchError.toString();
        }

        return reject(new Error(errorMessage || dispatchError.toString()));
      }
    }),
  );
