import * as cryptoUtil from '@polkadot/util-crypto';

import { CERE_SS58_PREFIX } from '../constants';
import { UriSigner, UriSignerOptions } from '../Signer';

export { cryptoWaitReady } from '@polkadot/util-crypto';

export const decodeAddress = (address: string, ignoreChecksum?: boolean) => {
  return cryptoUtil.decodeAddress(address, ignoreChecksum, CERE_SS58_PREFIX);
};

export const encodeAddress = (address: Uint8Array) => {
  return cryptoUtil.encodeAddress(address, CERE_SS58_PREFIX);
};

export const createRandomSigner = (options: UriSignerOptions = {}) => {
  const uri = cryptoUtil.mnemonicGenerate();

  return new UriSigner(uri, options);
};
