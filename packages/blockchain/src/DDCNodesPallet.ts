import { ApiPromise } from '@polkadot/api';
import { Sendable } from './Blockchain';
import type {
  CdnNode,
  CdnNodeProps,
  CdnNodePublicKey,
  StorageNode,
  StorageNodeProps,
  StorageNodePublicKey,
} from './types';
import { hexToString, stringToHex } from '@polkadot/util';

export class DDCNodesPallet {
  constructor(private apiPromise: ApiPromise) {}

  createCdnNode(cdnNodePublicKey: CdnNodePublicKey, cdnNodeProps: CdnNodeProps) {
    return this.apiPromise.tx.ddcNodes.createNode(
      { CDNPubKey: cdnNodePublicKey },
      { CDNParams: encodeNodeProps(cdnNodeProps) },
    ) as Sendable;
  }

  async findCdnNodeByPublicKey(cdnNodePublicKey: CdnNodePublicKey) {
    const result = await this.apiPromise.query.ddcNodes.cdnNodes(cdnNodePublicKey);
    const cdnNode = result.toJSON() as unknown as CdnNode | undefined;
    return cdnNode == null ? undefined : ({ ...cdnNode, props: decodeNodeProps(cdnNode.props) } as CdnNode);
  }

  setCdnNodeProps(cdnNodePublicKey: CdnNodePublicKey, cdnNodeProps: CdnNodeProps) {
    return this.apiPromise.tx.ddcNodes.setNodeParams(
      { CDNPubKey: cdnNodePublicKey },
      { CDNParams: encodeNodeProps(cdnNodeProps) },
    ) as Sendable;
  }
  async listCdnNodes() {
    const result = await this.apiPromise.query.ddcNodes.cdnNodes.entries();

    return result
      .map(([_, cdnNodeOption]) => {
        const cdnNode = cdnNodeOption.toJSON() as unknown as CdnNode | undefined;
        return cdnNode == null ? undefined : ({ ...cdnNode, props: decodeNodeProps(cdnNode.props) } as CdnNode);
      })
      .filter((cdnNode) => cdnNode != null) as CdnNode[];
  }

  deleteCdnNode(cdnNodePublicKey: CdnNodePublicKey) {
    return this.apiPromise.tx.ddcNodes.deleteNode({ CDNPubKey: cdnNodePublicKey }) as Sendable;
  }

  createStorageNode(storageNodePublicKey: StorageNodePublicKey, storageNodeProps: StorageNodeProps) {
    return this.apiPromise.tx.ddcNodes.createNode(
      { StoragePubKey: storageNodePublicKey },
      { StorageParams: encodeNodeProps(storageNodeProps) },
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
      .map(([_, storageNodeOption]) => {
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

function decodeNodeProps(nodeProps: StorageNodeProps) {
  return {
    ...nodeProps,
    host: hexToString(nodeProps.host),
  };
}

function encodeNodeProps(nodeProps: StorageNodeProps) {
  return {
    ...nodeProps,
    host: stringToHex(nodeProps.host),
  };
}
