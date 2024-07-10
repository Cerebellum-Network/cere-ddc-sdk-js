import { v4 as uuid } from 'uuid';
import { RpcMetadata } from '@protobuf-ts/runtime-rpc';

export type CorrelationMetaParams = { correlationId?: string };

const CORRELATION_ID_META_KEY = 'correlation-id';

export const createRpcMeta = (correlationId?: string, meta?: RpcMetadata): RpcMetadata => {
  return { ...meta, [CORRELATION_ID_META_KEY]: correlationId || uuid() };
};
