import type { Signer } from '@cere-ddc-sdk/blockchain';

import type { Logger } from '../logger';
import { ActivityAcknowledgment } from '../grpc/activity_report/activity_report';
import { createSignature } from '../signature';

export type CreateAckOptions = {
  signer?: Signer;
  logger?: Logger;
};

/**
 * Creates an activity acknowledgment.
 */
export const createAck = async (
  ack: Omit<ActivityAcknowledgment, 'signature'>,
  { signer, logger }: CreateAckOptions,
) => {
  if (!signer) {
    throw new Error('Cannot sign acknowledgment. Signer requred!');
  }

  const signedAck = ActivityAcknowledgment.create({
    ...ack,
    signature: await createSignature(signer, ActivityAcknowledgment.toBinary(ack)),
  });

  logger?.debug({ signedAck }, 'Activity acknowledgment');

  return signedAck;
};
