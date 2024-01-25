import { RpcTransport } from '../transports';
import { PutRequest as ProtoPutRequest, GetRequest as ProtoGetRequest, Node } from '../grpc/dag_api';
import { DagApiClient } from '../grpc/dag_api.client';
import { createRpcMeta, AuthToken } from '../auth';
import { DagNodeValidator } from '../validators';
import { createLogger, Logger, LoggerOptions } from '../logger';

type AuthParams = { token?: AuthToken };
type PutRequest = ProtoPutRequest & AuthParams;
type GetRequest = ProtoGetRequest & AuthParams;

export type DagApiOptions = LoggerOptions & {
  authenticate?: boolean;
};

/**
 * The `DagApi` class provides methods to interact with the DDC DAG API.
 *
 * @example
 *
 * ```typescript
 * import { DagApi, GrpcTransport } from '@cere-ddc-sdk/ddc';
 *
 * const transport = new GrpcTransport(...);
 * const dagApi = new DagApi(transport);
 * ```
 */
export class DagApi {
  private logger: Logger;
  private api: DagApiClient;
  private options: DagApiOptions;

  constructor(transport: RpcTransport, options: DagApiOptions = {}) {
    this.api = new DagApiClient(transport);
    this.logger = createLogger('FileApi', options);

    this.options = {
      ...options,
      authenticate: options.authenticate ?? false,
    };
  }

  /**
   * Stores a node in DDC DAG.
   *
   * @param request - An object that includes the access token and the node to store.
   *
   * @returns The CID of the stored node as a `Uint8Array`.
   *
   * @example
   *
   * ```typescript
   * const request: PutRequest = { token: '...', node: { ... } };
   * const cid = await dagApi.putNode(request);
   *
   * console.log(cid);
   * ```
   */
  async putNode({ token, ...request }: PutRequest) {
    const { response } = await this.api.put(request, {
      meta: createRpcMeta(token),
    });

    return new Uint8Array(response.cid);
  }

  /**
   * Retrieves a DAG node from DDC.
   *
   * @param request - An object that includes the access token and the CID of the node to retrieve.
   *
   * @returns The retrieved node as a `Node` object, or `undefined` if the node does not exist.
   *
   * @example
   *
   * ```typescript
   * const request: GetRequest = { token: '...', cid: '...' };
   * const node = await dagApi.getNode(request);
   *
   * console.log(node);
   * ```
   */
  async getNode({ token, ...request }: GetRequest): Promise<Node | undefined> {
    /**
     * In case a sub-node requested using root CID + path - we don't have the target node CID, so we can't authenticate it.
     */
    const authenticate = this.options.authenticate && !request.path;
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
