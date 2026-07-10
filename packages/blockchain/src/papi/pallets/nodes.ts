import type { CereApi } from '../api-types.js';
import type { Sendable } from '../tx.js';
import type { StorageNode, StorageNodeProps, StorageNodePublicKey } from '../../types.js';
import { buildStorageNodeParams, storagePubKey, toStorageNode } from './mapping.js';

export interface NodesPallet {
  createStorageNode(key: StorageNodePublicKey, props: StorageNodeProps): Sendable;
  findStorageNodeByPublicKey(key: StorageNodePublicKey): Promise<StorageNode | undefined>;
  listStorageNodes(): Promise<StorageNode[]>;
  setStorageNodeProps(key: StorageNodePublicKey, props: StorageNodeProps): Sendable;
  deleteStorageNode(key: StorageNodePublicKey): Sendable;
}

export function createNodesPallet(api: CereApi): NodesPallet {
  return {
    createStorageNode(key, props) {
      return api.tx.DdcNodes.create_node({
        node_pub_key: storagePubKey(key),
        node_params: buildStorageNodeParams({ domain: '', ssl: false, ...props }),
      } as any) as Sendable;
    },
    // `DdcNodes.StorageNodes` is keyed by a BARE SS58 string, not the
    // `NodePubKey` enum (verified live — see `toStorageNode`'s doc comment
    // in mapping.ts): pass `key` directly, unlike the enum-wrapped
    // `node_pub_key` TX arg below.
    async findStorageNodeByPublicKey(key) {
      const value = await api.query.DdcNodes.StorageNodes.getValue(key as any);
      return value == null ? undefined : toStorageNode(value);
    },
    async listStorageNodes() {
      const entries = await api.query.DdcNodes.StorageNodes.getEntries();
      return entries.map((e) => toStorageNode(e.value)).filter((n): n is StorageNode => n != null);
    },
    setStorageNodeProps(key, props) {
      return api.tx.DdcNodes.set_node_params({
        node_pub_key: storagePubKey(key),
        node_params: buildStorageNodeParams(props),
      } as any) as Sendable;
    },
    deleteStorageNode(key) {
      return api.tx.DdcNodes.delete_node({ node_pub_key: storagePubKey(key) } as any) as Sendable;
    },
  };
}
