import { Signer } from '@cere-ddc-sdk/blockchain';

import { RpcTransport } from '../transports';
import { PutRequest as ProtoPutRequest, GetRequest as ProtoGetRequest, Node } from '../grpc/dag_api';
import { DagApiClient } from '../grpc/dag_api.client';
import { createRpcMeta, AuthToken } from '../auth';
import { DagNodeValidator } from '../validators';
import { createLogger, Logger, LoggerOptions } from '../logger';
import { createActivityRequest, ActivityRequestType } from '../activity';

type AuthParams = { token?: AuthToken };
type PutRequest = ProtoPutRequest & AuthParams;
type GetRequest = ProtoGetRequest & AuthParams;

export type DagApiOptions = LoggerOptions & {
  signer?: Signer;
  authenticate?: boolean;
  enableAcks?: boolean;
};

/**
 * The `DagApi` class provides methods to interact with the DDC DAG API.
 *
 * @group Directed Acyclic Graph (DAG)
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
    this.logger = createLogger('DagApi', options);

    this.options = {
      ...options,
      enableAcks: options.enableAcks ?? !!options.signer, // ACKs are enabled by default if signer is provided
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
  async putNode({ token, bucketId, node, cid }: PutRequest) {
    const meta = createRpcMeta(token);

    this.logger.debug({ token, bucketId, node, cid }, 'Storing DAG Node');

    if (this.options.enableAcks && node) {
      meta.request = await createActivityRequest(
        { id: cid, bucketId, size: Node.toBinary(node).byteLength, requestType: ActivityRequestType.STORE },
        { logger: this.logger, signer: this.options.signer },
      );
    }

    const { response } = await this.api.put({ bucketId, node, cid }, { meta });

    this.logger.debug({ cid }, 'DAG Node stored');

    return new Uint8Array(response.cid);
  }

  /**
   * Retrieves a DAG node from DDC.
   *
   * @group Low level API
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
    this.logger.debug({ ...request, token }, 'Retrieving DAG Node');

    /**
     * In case a sub-node requested using root CID + path - we don't have the target node CID, so we can't authenticate it.
     */
    const authenticate = this.options.authenticate && !request.path;
    const meta = createRpcMeta(token);

    const validator = new DagNodeValidator(request.cid, {
      enable: authenticate,
      logger: this.logger,
    });

    if (this.options.enableAcks) {
      meta.request = await createActivityRequest(
        { id: request.cid, bucketId: request.bucketId, requestType: ActivityRequestType.GET },
        { logger: this.logger, signer: this.options.signer },
      );
    }

    const { response } = await this.api.get(request, { meta });

    if (response.node && authenticate) {
      await validator.update(Node.toBinary(response.node));
    }

    await validator.validate();

    this.logger.debug({ node: response.node }, 'DAG Node retrieved');

    return (
      response.node && {
        ...response.node,
        data: new Uint8Array(response.node.data),
      }
    );
  }
}
