import { ApiPromise } from '@polkadot/api';
import { Sendable } from './Blockchain';
import type { StorageNode, StorageNodeProps, StorageNodePublicKey } from './types';
import { hexToString, stringToHex } from '@polkadot/util';

export class DDCNodesPallet {
  constructor(private apiPromise: ApiPromise) {}

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

  async findStorageNodeByPublicKey(storageNodePublicKey: StorageNodePublicKey) {
    const result = await this.apiPromise.query.ddcNodes.storageNodes(storageNodePublicKey);
    const storageNode = result.toJSON() as unknown as StorageNode | undefined;
    return storageNode == null
      ? undefined
      : ({ ...storageNode, props: decodeNodeProps(storageNode.props) } as StorageNode);
  }

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

  setStorageNodeProps(storageNodePublicKey: StorageNodePublicKey, storageNodeProps: StorageNodeProps) {
    return this.apiPromise.tx.ddcNodes.setNodeParams(
      { StoragePubKey: storageNodePublicKey },
      { StorageParams: encodeNodeProps(storageNodeProps) },
    ) as Sendable;
  }

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
