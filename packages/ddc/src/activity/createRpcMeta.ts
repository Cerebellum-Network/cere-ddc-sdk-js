import { v4 as uuid } from 'uuid';
import { RpcMetadata } from '@protobuf-ts/runtime-rpc';

export type CorrelationMetaParams = { correlationId?: string };

export const createRpcMeta = (correlationId?: string, meta?: RpcMetadata): RpcMetadata => {
  return { ...meta, CorrelationID: correlationId || uuid() };
};
