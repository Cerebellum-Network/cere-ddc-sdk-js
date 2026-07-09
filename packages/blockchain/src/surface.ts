export type SurfaceKind = 'tx' | 'query';

/** One chain call the SDK relies on. `args: -1` = check existence only (skip arg count). */
export type SurfaceEntry = { kind: SurfaceKind; pallet: string; method: string; args: number };

/** Live metadata reduced to arg counts: live[kind][pallet][method] = number of args. */
export type LiveSurface = { tx: Record<string, Record<string, number>>; query: Record<string, Record<string, number>> };

export type Finding = {
  entry: SurfaceEntry;
  problem: 'missing-pallet' | 'missing-method' | 'arg-count';
  detail: string;
};

/** Pure diff: report every manifest entry that the live chain does not satisfy. */
export function diffSurface(manifest: SurfaceEntry[], live: LiveSurface): Finding[] {
  const findings: Finding[] = [];

  for (const entry of manifest) {
    const pallets = live[entry.kind];
    const pallet = pallets[entry.pallet];

    if (!pallet) {
      findings.push({ entry, problem: 'missing-pallet', detail: `${entry.kind}.${entry.pallet} not found on chain` });
      continue;
    }

    if (!(entry.method in pallet)) {
      findings.push({ entry, problem: 'missing-method', detail: `${entry.kind}.${entry.pallet}.${entry.method} not found on chain` });
      continue;
    }

    if (entry.args >= 0 && pallet[entry.method] !== entry.args) {
      findings.push({ entry, problem: 'arg-count', detail: `expected ${entry.args} args, live has ${pallet[entry.method]}` });
    }
  }

  return findings;
}

/**
 * The chain surface the SDK depends on today, extracted from packages/blockchain/src.
 * tx arg counts are authoritative; queries are existence-only (args: -1) because
 * storage-key arity is awkward to read uniformly across map/double-map entries.
 */
export const SURFACE: SurfaceEntry[] = [
  // ddcClusters
  { kind: 'tx', pallet: 'ddcClusters', method: 'createCluster', args: 4 },
  { kind: 'tx', pallet: 'ddcClusters', method: 'setClusterParams', args: 2 },
  { kind: 'tx', pallet: 'ddcClusters', method: 'addNode', args: 3 },
  { kind: 'tx', pallet: 'ddcClusters', method: 'removeNode', args: 2 },
  { kind: 'query', pallet: 'ddcClusters', method: 'clusters', args: -1 },
  { kind: 'query', pallet: 'ddcClusters', method: 'clustersGovParams', args: -1 },
  { kind: 'query', pallet: 'ddcClusters', method: 'clustersNodes', args: -1 },
  // ddcCustomers (pallet fallback surface)
  { kind: 'tx', pallet: 'ddcCustomers', method: 'createBucket', args: 2 },
  { kind: 'tx', pallet: 'ddcCustomers', method: 'setBucketParams', args: 2 },
  { kind: 'tx', pallet: 'ddcCustomers', method: 'removeBucket', args: 1 },
  { kind: 'tx', pallet: 'ddcCustomers', method: 'deposit', args: 2 },
  { kind: 'tx', pallet: 'ddcCustomers', method: 'depositExtra', args: 2 },
  { kind: 'tx', pallet: 'ddcCustomers', method: 'depositFor', args: 3 },
  { kind: 'tx', pallet: 'ddcCustomers', method: 'unlockDeposit', args: 2 },
  { kind: 'tx', pallet: 'ddcCustomers', method: 'withdrawUnlockedDeposit', args: 1 },
  { kind: 'query', pallet: 'ddcCustomers', method: 'buckets', args: -1 },
  { kind: 'query', pallet: 'ddcCustomers', method: 'bucketsCount', args: -1 },
  { kind: 'query', pallet: 'ddcCustomers', method: 'clusterLedger', args: -1 },
  // ddcNodes
  { kind: 'tx', pallet: 'ddcNodes', method: 'createNode', args: 2 },
  { kind: 'tx', pallet: 'ddcNodes', method: 'setNodeParams', args: 2 },
  { kind: 'tx', pallet: 'ddcNodes', method: 'deleteNode', args: 1 },
  { kind: 'query', pallet: 'ddcNodes', method: 'storageNodes', args: -1 },
  // ddcStaking
  { kind: 'tx', pallet: 'ddcStaking', method: 'bond', args: 3 },
  { kind: 'tx', pallet: 'ddcStaking', method: 'bondCluster', args: 1 },
  { kind: 'tx', pallet: 'ddcStaking', method: 'unbondCluster', args: 1 },
  { kind: 'tx', pallet: 'ddcStaking', method: 'store', args: 1 },
  { kind: 'tx', pallet: 'ddcStaking', method: 'serve', args: 1 },
  { kind: 'query', pallet: 'ddcStaking', method: 'bonded', args: -1 },
  { kind: 'query', pallet: 'ddcStaking', method: 'nodes', args: -1 },
  // governance (runtime pallet name is ddcClusterGov, singular)
  { kind: 'tx', pallet: 'ddcClusterGov', method: 'proposeUpdateClusterProtocol', args: 3 },
  { kind: 'tx', pallet: 'ddcClusterGov', method: 'voteProposal', args: 2 },
];
