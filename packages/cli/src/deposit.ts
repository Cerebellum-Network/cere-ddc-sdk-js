import { DdcClient } from '@cere-ddc-sdk/ddc-client';
import type { ClusterId } from '@cere-ddc-sdk/blockchain';

import { CERE } from './constants';

export type DepositOptions = {
  allowExtra: boolean;
  clusterId: ClusterId;
};

export const deposit = async (client: DdcClient, amount: number, options: DepositOptions) => {
  await client.depositBalance(options.clusterId, BigInt(amount * CERE), options);
  const totalBalance = await client.getDeposit(options.clusterId);

  return Number(totalBalance / BigInt(CERE));
};
