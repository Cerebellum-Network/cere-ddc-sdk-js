import { BucketId, Signer, StorageNodeMode } from '@cere-ddc-sdk/blockchain';

import { StorageNode, StorageNodeConfig } from '../nodes';
import { RouterOperation } from './RoutingStrategy';
import { Logger, LoggerOptions, createLogger } from '../logger';
import { AuthToken, createSdkToken, isValidSdkToken } from '../auth';

export type EndpointResolverConfig = {
  signer: Signer;

  /**
   * The endpoint used for all write operations (and reads, when `cdnUrl` isn't set).
   */
  storageUrl: string;

  /**
   * The endpoint used for read operations. Falls back to `storageUrl` when omitted.
   */
  cdnUrl?: string;
} & LoggerOptions;

const READ_OPERATIONS = new Set<RouterOperation>([
  RouterOperation.READ_PIECE,
  RouterOperation.READ_DAG_NODE,
  RouterOperation.READ_CNS_RECORD,
]);

const resolveUrl = (operation: RouterOperation, storageUrl: string, cdnUrl?: string) =>
  READ_OPERATIONS.has(operation) ? (cdnUrl ?? storageUrl) : storageUrl;

/**
 * The `EndpointResolver` maps DDC operations to a single, explicitly configured
 * endpoint (`storageUrl` for writes, `cdnUrl` for reads) and builds the `StorageNode`
 * for it.
 *
 * It plays the same role `Router` plays for preset/blockchain-driven multi-node
 * routing, but for a single-cluster SDK config: there is no node discovery or
 * selection strategy involved, only a static operation → URL map.
 *
 * @internal
 * @example
 *
 * ```typescript
 * const resolver = new EndpointResolver({
 *   signer: new UriSigner('...'),
 *   storageUrl: 'https://storage.example',
 *   cdnUrl: 'https://cdn.example',
 * });
 * ```
 */
export class EndpointResolver {
  private signer: Signer;
  private logger: Logger;
  private storageUrl: string;
  private cdnUrl?: string;
  private sdkTokenPromise?: Promise<AuthToken>;

  constructor({ signer, storageUrl, cdnUrl, ...config }: EndpointResolverConfig) {
    this.signer = signer;
    this.storageUrl = storageUrl;
    this.cdnUrl = cdnUrl;
    this.logger = createLogger('EndpointResolver', config);
  }

  /**
   * Returns an SDK token for the current signer, memoized the same way `Router` does.
   */
  private getSdkToken() {
    this.sdkTokenPromise = Promise.all([this.sdkTokenPromise, this.signer.isReady()]).then(([token]) =>
      token && isValidSdkToken(this.signer, token) ? token : createSdkToken(this.signer),
    );

    return this.sdkTokenPromise;
  }

  /**
   * Returns the single `StorageNode` for the endpoint this operation maps to.
   *
   * @param operation - The operation for which to resolve an endpoint.
   * @param bucketId - The ID of the bucket the operation targets.
   * @param config - Optional `StorageNode` config overrides.
   *
   * @returns A promise that resolves to the `StorageNode` for the resolved endpoint.
   */
  async getNode(operation: RouterOperation, bucketId: BucketId, config: Partial<StorageNodeConfig> = {}) {
    const url = resolveUrl(operation, this.storageUrl, this.cdnUrl);

    this.logger.info('Resolving endpoint for operation "%s" in bucket %s', operation, bucketId);

    const authToken = await this.getSdkToken();

    const storageNode = new StorageNode(this.signer, {
      mode: StorageNodeMode.Full,
      grpcUrl: url,
      httpUrl: url,
      url,
      logger: this.logger,
      authToken,
      ...config,
    });

    this.logger.info(
      'Resolved endpoint for operation "%s" in bucket %s: %s',
      operation,
      bucketId,
      storageNode.displayName,
    );

    return storageNode;
  }
}
