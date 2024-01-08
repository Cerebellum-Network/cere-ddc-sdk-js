import { RpcTransport } from '../transports';
import { PutRequest as ProtoPutRequest, GetRequest as ProtoGetRequest, Node } from '../grpc/dag_api';
import { DagApiClient } from '../grpc/dag_api.client';
import { createRpcMeta, AuthToken } from '../auth';
import { DagNodeValidator } from '../validators';
import { createLogger, Logger, LoggerOptions } from '../Logger';

type AuthParams = { token?: AuthToken };
type PutRequest = ProtoPutRequest & AuthParams;
type GetRequest = ProtoGetRequest & AuthParams;

export type DagApiOptions = LoggerOptions & {
  authenticate?: boolean;
};

export class DagApi {
  private logger: Logger;
  private api: DagApiClient;
  private options: DagApiOptions;

  constructor(transport: RpcTransport, options: DagApiOptions = {}) {
    this.api = new DagApiClient(transport);
    this.logger = createLogger('FileApi', options);

    this.options = {
      ...options,
      authenticate: options.authenticate ?? true,
    };
  }

  async putNode({ token, ...request }: PutRequest) {
    const { response } = await this.api.put(request, {
      meta: createRpcMeta(token),
    });

    return new Uint8Array(response.cid);
  }

  async getNode({ token, ...request }: GetRequest): Promise<Node | undefined> {
    const authenticate = this.options.authenticate && !request.path; // TODO: Figure out how to validate sub-nodes requested by root CID + path
    const validator = new DagNodeValidator(request.cid, {
      enable: authenticate,
      logger: this.logger,
    });

    const { response } = await this.api.get(request, {
      meta: createRpcMeta(token),
    });

    if (response.node && authenticate) {
      await validator.update(Node.toBinary(response.node));
    }

    await validator.validate();

    return (
      response.node && {
        ...response.node,
        data: new Uint8Array(response.node.data),
      }
    );
  }
}
