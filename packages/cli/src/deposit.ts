import { DdcClient } from '@cere-ddc-sdk/ddc-client';
import type { ClusterId } from '@cere-ddc-sdk/blockchain';

import { CERE } from './constants';

export type DepositOptions = {
  allowExtra: boolean;
  clusterId: ClusterId;
};

export const deposit = async (client: DdcClient, amount: number, options: DepositOptions) => {
  // TODO(Task 3): `options.clusterId` is now redundant with the `clusterId` on the
  // client's own config (single-cluster SDK); drop it from `DepositOptions`/the CLI
  // `--clusterId` flag once callers are updated.
  await client.depositBalance(BigInt(amount * CERE), { allowExtra: options.allowExtra });
  const totalBalance = await client.getDeposit();

  return Number(totalBalance / BigInt(CERE));
};
