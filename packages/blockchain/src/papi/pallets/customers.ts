import type { CereApi } from '../api-types.js';
import type { AccountId, ClusterId, StakingInfo } from '../../types.js';
import { toStakingInfo } from './mapping.js';
import { createCustomerDepositContract, type CustomerDepositContract } from '../contracts/customerDeposit.js';

export interface CustomersPallet {
  /** Balance for an account in a cluster: the contract balance if the cluster has a deposit contract, else the pallet ledger. */
  getStackingInfo(clusterId: ClusterId, accountId: AccountId): Promise<StakingInfo | undefined>;
  // Buckets (Task 2) and deposit/withdraw (Task 3) are added here.
}

export function createCustomersPallet(api: CereApi): CustomersPallet {
  const contract: CustomerDepositContract = createCustomerDepositContract(api);
  return {
    async getStackingInfo(clusterId, accountId) {
      const addr = await contract.resolve(clusterId);
      if (addr) return contract.readBalance(addr, accountId);
      // Pallet fallback for a cluster with no deposit contract. The migrated
      // devnet/testnet runtime keys this by `(clusterId, accountId)` under
      // `DdcCustomers.ClusterLedger` (verified live in the 2c spike). That
      // storage item is NOT on the mainnet static baseline type (mainnet still
      // has the account-keyed `DdcCustomers.Ledger`), so reach it through a cast
      // — the established 2a/2b pattern for cross-runtime query access. The
      // value decodes to the same `{ owner, total, active }` shape `toStakingInfo`
      // maps for the contract path.
      const value: any = await (api.query.DdcCustomers as any).ClusterLedger.getValue(
        clusterId as any,
        accountId as any,
      );
      return value == null ? undefined : toStakingInfo(value);
    },
  };
}
