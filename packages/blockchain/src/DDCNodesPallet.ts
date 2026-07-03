import { ApiPromise } from '@polkadot/api';
import { Sendable } from './Blockchain';
import type { StorageNode, StorageNodeProps, StorageNodePublicKey } from './types';
import { hexToString, stringToHex } from '@polkadot/util';

/**
 * This class provides methods to interact with the DDC Nodes pallet on the blockchain.
 *
 * @group Pallets
 * @example
 *
 * ```typescript
 * const storageNodePublicKey = '0x...';
 * const storageNode = await blockchain.ddcNodes.findStorageNodeByPublicKey(storageNodePublicKey);
 *
 * console.log(storageNode);
 * ```
 */
export class DDCNodesPallet {
  constructor(private apiPromise: ApiPromise) {}

  /**
   * Creates a new storage node.
   *
   * @param storageNodePublicKey - The public key of the storage node.
   * @param storageNodeProps - The properties of the storage node.
   * @returns An extrinsic to create the storage node.
   *
   * @example
   *
   * ```typescript
   * const storageNodePublicKey = '0x...';
   * const storageNodeProps = { ... };
   * const tx = blockchain.ddcNodes.createStorageNode(storageNodePublicKey, storageNodeProps);
   *
   * await blockchain.send(tx, { account });
   * ```
   */
  createStorageNode(storageNodePublicKey: StorageNodePublicKey, storageNodeProps: StorageNodeProps) {
    const defaultProps: Partial<StorageNodeProps> = {
      domain: '',
      ssl: false,
    };

    return this.apiPromise.tx.ddcNodes.createNode(
      { StoragePubKey: storageNodePublicKey },
      { StorageParams: encodeNodeProps({ ...defaultProps, ...storageNodeProps }) },
    ) as Sendable;
  }

  /**
   * Finds a storage node by public key.
   *
   * @param storageNodePublicKey - The public key of the storage node.
   * @returns A promise that resolves to the storage node.
   *
   * @example
   *
   * ```typescript
   * const storageNodePublicKey = '0x...';
   * const storageNode = await blockchain.ddcNodes.findStorageNodeByPublicKey(storageNodePublicKey);
   *
   * console.log(storageNode);
   * ```
   */
  async findStorageNodeByPublicKey(storageNodePublicKey: StorageNodePublicKey) {
    const result = await this.apiPromise.query.ddcNodes.storageNodes(storageNodePublicKey);
    const storageNode = result.toJSON() as unknown as StorageNode | undefined;
    return storageNode == null
      ? undefined
      : ({ ...storageNode, props: decodeNodeProps(storageNode.props) } as StorageNode);
  }

  /**
   * Returns a list of storage nodes.
   *
   * @returns A promise that resolves to a list of storage nodes.
   *
   * @example
   *
   * ```typescript
   * const storageNodes = await blockchain.ddcNodes.listStorageNodes();
   *
   * console.log(storageNodes);
   * ```
   */
  async listStorageNodes() {
    const result = await this.apiPromise.query.ddcNodes.storageNodes.entries();

    return result
      .map(([, storageNodeOption]) => {
        const storageNode = storageNodeOption.toJSON() as unknown as StorageNode | undefined;
        return storageNode == null
          ? undefined
          : ({ ...storageNode, props: decodeNodeProps(storageNode.props) } as StorageNode);
      })
      .filter((storageNode) => storageNode != null) as StorageNode[];
  }

  /**
   * Sets the properties of a storage node.
   *
   * @param storageNodePublicKey - The public key of the storage node.
   * @param storageNodeProps - The properties of the storage node.
   * @returns An extrinsic to set the storage node properties.
   *
   * @example
   *
   * ```typescript
   * const storageNodePublicKey = '0x...';
   * const storageNodeProps = { ... };
   * const tx = blockchain.ddcNodes.setStorageNodeProps(storageNodePublicKey, storageNodeProps);
   *
   * await blockchain.send(tx, { account });
   * ```
   */
  setStorageNodeProps(storageNodePublicKey: StorageNodePublicKey, storageNodeProps: StorageNodeProps) {
    return this.apiPromise.tx.ddcNodes.setNodeParams(
      { StoragePubKey: storageNodePublicKey },
      { StorageParams: encodeNodeProps(storageNodeProps) },
    ) as Sendable;
  }

  /**
   * Deletes a storage node.
   *
   * @param storageNodePublicKey - The public key of the storage node.
   * @returns An extrinsic to delete the storage node.
   *
   * @example
   *
   * ```typescript
   * const storageNodePublicKey = '0x...';
   * const tx = blockchain.ddcNodes.deleteStorageNode(storageNodePublicKey);
   *
   * await blockchain.send(tx, { account });
   * ```
   */
  deleteStorageNode(storageNodePublicKey: StorageNodePublicKey) {
    return this.apiPromise.tx.ddcNodes.deleteNode({ StoragePubKey: storageNodePublicKey }) as Sendable;
  }
}

function decodeNodeProps(nodeProps: StorageNodeProps): StorageNodeProps {
  return {
    ...nodeProps,
    host: hexToString(nodeProps.host),
    domain: hexToString(nodeProps.domain),
  };
}

function encodeNodeProps(nodeProps: StorageNodeProps): StorageNodeProps {
  return {
    ...nodeProps,
    host: stringToHex(nodeProps.host),
    domain: stringToHex(nodeProps.domain),
  };
}
