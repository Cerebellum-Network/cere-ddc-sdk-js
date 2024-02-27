import { DdcClient } from '@cere-ddc-sdk/ddc-client';

import { CERE } from './constants';

export type DepositOptions = {
  allowExtra: boolean;
};

export const deposit = async (client: DdcClient, amount: number, options: DepositOptions) => {
  await client.depositBalance(BigInt(amount * CERE), options);
  const totalBalance = await client.getDeposit();

  return Number(totalBalance / BigInt(CERE));
};
