import { RpcTransport } from '../transports';
import { PutRequest as ProtoPutRequest, GetRequest as ProtoGetRequest, Node } from '../grpc/dag_api';
import { DagApiClient } from '../grpc/dag_api.client';
import { createRpcMeta, AuthToken } from '../auth';

type AuthParams = { token?: AuthToken };
type PutRequest = ProtoPutRequest & AuthParams;
type GetRequest = ProtoGetRequest & AuthParams;

export class DagApi {
  private api: DagApiClient;

  constructor(transport: RpcTransport) {
    this.api = new DagApiClient(transport);
  }

  async putNode({ token, ...request }: PutRequest) {
    const { response } = await this.api.put(request, {
      meta: createRpcMeta(token),
    });

    return new Uint8Array(response.cid);
  }

  async getNode({ token, ...request }: GetRequest) {
    const { response } = await this.api.get(request, {
      meta: createRpcMeta(token),
    });

    const node: Node | undefined = response.node && {
      ...response.node,
      data: new Uint8Array(response.node.data),
    };

    return node;
  }
}
