import { RpcMetadata } from '@protobuf-ts/runtime-rpc';
import { AuthToken } from './AuthToken';

export const createRpcMeta = (token?: AuthToken, meta?: RpcMetadata): RpcMetadata => {
  const authMeta: RpcMetadata = {};
  if (token) {
    authMeta.token = token.toString();
  }

  return { ...meta, ...authMeta };
};
