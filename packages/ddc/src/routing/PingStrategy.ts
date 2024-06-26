import fetch from 'cross-fetch';
import { Deferred, DeferredState } from '@protobuf-ts/runtime-rpc';

import { RouterOperation, RouterNode } from '.';
import { NodeTypeStrategy } from './NodeTypeStrategy';
import { shuffle } from './RandomStrategy';
import {
  PING_ABORT_TIMEOUT,
  PING_BACKGROUND_DELAY,
  PING_LATENCY_GROUP,
  PING_THRESHOLD,
  PING_THRESHOLD_INC,
} from '../constants';

type PingRecord = {
  node: RouterNode;
  isDone: Deferred<boolean>;
  latency?: number;
};

/**
 * The `PingStrategy` selects a node based on the operation type and ping latency.
 */
export abstract class PingStrategy extends NodeTypeStrategy {
  private nodesMap = new Map<RouterNode['httpUrl'], PingRecord>();

  private getPingedNodes(state?: DeferredState) {
    const pings = Array.from(this.nodesMap.values());
    const foundPings = pings.filter(({ isDone }) =>
      state ? isDone.state === state : isDone.state !== DeferredState.REJECTED,
    );

    return foundPings.map(({ node }) => node);
  }

  private async ping(record: PingRecord): Promise<PingRecord> {
    const start = Date.now();
    const pingUrl = new URL('/info', record.node.httpUrl);

    try {
      const response = await fetch(pingUrl, {
        cache: 'no-cache',
        signal: AbortSignal.timeout(PING_ABORT_TIMEOUT),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }
    } catch (err: any) {
      this.logger.debug({ err }, 'Node ping %s failed with error %s', record.node.httpUrl, err);

      throw err;
    }

    record.latency = Date.now() - start;
    this.logger.info('Node ping completed %s with latency %d ms', record.node.httpUrl, record.latency);

    return record;
  }

  private enqueuePing(node: RouterNode) {
    const existingPing = this.nodesMap.get(node.httpUrl);

    if (existingPing) {
      return existingPing;
    }

    const isDone = new Deferred<boolean>();
    const pingRecord: PingRecord = { node, isDone };

    this.nodesMap.set(node.httpUrl, pingRecord);
    this.ping(pingRecord)
      .then(() => isDone.resolve(true))
      .catch((err) => isDone.reject(err));

    return isDone.promise;
  }

  async marshalNodes(operation: RouterOperation, allNodes: RouterNode[]): Promise<RouterNode[]> {
    const allNodesShuffled = shuffle([...allNodes]);
    const pingedNodes = await super.marshalNodes(operation, this.getPingedNodes());
    const allOperationNodes = await super.marshalNodes(operation, allNodesShuffled);
    const notPingedNodes = allOperationNodes.filter((node) => !this.nodesMap.has(node.httpUrl));
    const toPingSync = notPingedNodes.slice(0, Math.max(0, PING_THRESHOLD - pingedNodes.length));
    const toPingAsync = notPingedNodes.slice(0, PING_THRESHOLD_INC);
    const syncPings = [
      ...pingedNodes, // Include already pinged nodes to make sure they are settled
      ...toPingSync,
    ].map((node) => this.enqueuePing(node));

    /**
     * Wait for all sync pings to complete
     */
    await Promise.allSettled(syncPings);

    /**
     * After a short delay, start async pings in background
     */
    setTimeout(() => toPingAsync.forEach((node) => this.enqueuePing(node)), PING_BACKGROUND_DELAY);

    /**
     * Sort opperation nodes by latency
     */
    return allOperationNodes.sort((a, b) => {
      const latencyA = this.nodesMap.get(a.httpUrl)?.latency;
      const latencyB = this.nodesMap.get(b.httpUrl)?.latency;

      /**
       * Group latency by PING_LATENCY_GROUP ms levels to avaoid sorting by small differences.
       * Keep nodes without ping at the end for fallback scenarios when all pings fail.
       */
      const levelA = latencyA ? Math.ceil(latencyA / PING_LATENCY_GROUP) : Infinity;
      const levelB = latencyB ? Math.ceil(latencyB / PING_LATENCY_GROUP) : Infinity;

      return levelA - levelB;
    });
  }
}
