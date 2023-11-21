import { RpcTransport } from '../transports';
import { PutRequest, GetRequest, Node } from '../grpc/dag_api';
import { DagApiClient } from '../grpc/dag_api.client';

export class DagApi {
  private api: DagApiClient;

  constructor(transport: RpcTransport) {
    this.api = new DagApiClient(transport);
  }

  async putNode(request: PutRequest) {
    const { response } = await this.api.put(request);

    return new Uint8Array(response.cid);
  }

  async getNode(request: GetRequest) {
    const { response } = await this.api.get(request);

    const node: Node | undefined = response.node && {
      ...response.node,
      data: new Uint8Array(response.node.data),
    };

    return node;
  }
}
