import { v4 as uuid } from 'uuid';
import { Buffer } from 'buffer';
import type { Signer } from '@cere-ddc-sdk/blockchain';

import type { Logger } from '../logger';
import { createSignature, CreateSignatureOptions } from '../signature';
import {
  ActivityRequest,
  ActivityRequest_ContentType,
  ActivityRequest_RequestType,
} from '../grpc/activity_report/activity_report';

export { ActivityRequest_RequestType as ActivityRequestType };
export type CreateActivityRequestOptions = CreateSignatureOptions & {
  signer?: Signer;
  logger?: Logger;
};

/**
 * Creates an activity request.
 */
export const createActivityRequest = async (
  request: Partial<Omit<ActivityRequest, 'contentType' | 'signature'>>,
  { signer, logger, ...options }: CreateActivityRequestOptions,
) => {
  if (!signer) {
    throw new Error('Activity capturing cannot be enabled. Signer requred!');
  }

  const activityRequest = ActivityRequest.create({
    timestamp: Date.now(),
    requestId: createRequestId(),
    ...request,
    contentType: ActivityRequest_ContentType.PIECE,
  });

  activityRequest.signature = await createSignature(signer, ActivityRequest.toBinary(activityRequest), options);

  logger?.debug({ activityRequest }, 'Activity request');

  return Buffer.from(ActivityRequest.toBinary(activityRequest)).toString('base64');
};

/**
 * Generates a unique request ID.
 */
export const createRequestId = () => uuid();
