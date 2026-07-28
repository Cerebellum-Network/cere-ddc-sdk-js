import type { PolkadotClient } from 'polkadot-api';
import type { CereApi } from './api-types.js';

export interface ChainApi {
  getCurrentBlockNumber(): Promise<number>;
  getAccountFreeBalance(address: string): Promise<bigint>;
  getNextNonce(address: string): Promise<number>;
  getChainDecimals(): Promise<number>;
  formatBalance(value: bigint | number | string, withUnit?: boolean | string): Promise<string>;
}

export function createChainApi(api: CereApi, client: PolkadotClient): ChainApi {
  let decimalsCache: number | undefined;

  const getChainDecimals = async (): Promise<number> => {
    if (decimalsCache != null) return decimalsCache;
    const spec = await client.getChainSpecData();
    const td = (spec.properties as any)?.tokenDecimals;
    decimalsCache = typeof td === 'number' ? td : Array.isArray(td) ? Number(td[0]) : 10;
    return decimalsCache;
  };

  return {
    getChainDecimals,

    async getCurrentBlockNumber() {
      return api.query.System.Number.getValue();
    },

    async getAccountFreeBalance(address) {
      const account = await api.query.System.Account.getValue(address);
      return account.data.free;
    },

    async getNextNonce(address) {
      return api.apis.AccountNonceApi.account_nonce(address);
    },

    async formatBalance(value, withUnit = 'CERE') {
      const decimals = await getChainDecimals();
      const digits = BigInt(value)
        .toString()
        .padStart(decimals + 1, '0');
      const whole = digits.slice(0, digits.length - decimals) || '0';
      const frac = digits.slice(digits.length - decimals).replace(/0+$/, '');
      const unit = withUnit === false ? '' : ` ${typeof withUnit === 'string' ? withUnit : 'CERE'}`;
      return `${whole}${frac ? '.' + frac : ''}${unit}`;
    },
  };
}
