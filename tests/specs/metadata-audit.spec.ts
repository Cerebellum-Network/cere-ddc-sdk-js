import { diffSurface, SurfaceEntry, LiveSurface } from '../../packages/blockchain/src/surface';

const live: LiveSurface = {
  tx: { ddcClusters: { createCluster: 5, addNode: 2 } },
  query: { ddcClusters: { clustersGovParams: 1 } },
};

describe('diffSurface', () => {
  it('flags a tx arg-count mismatch', () => {
    const manifest: SurfaceEntry[] = [{ kind: 'tx', pallet: 'ddcClusters', method: 'createCluster', args: 4 }];
    expect(diffSurface(manifest, live)).toEqual([
      { entry: manifest[0], problem: 'arg-count', detail: 'expected 4 args, live has 5' },
    ]);
  });

  it('flags a missing method', () => {
    const manifest: SurfaceEntry[] = [{ kind: 'tx', pallet: 'ddcStaking', method: 'bondCluster', args: 1 }];
    expect(diffSurface(manifest, live)).toEqual([
      { entry: manifest[0], problem: 'missing-pallet', detail: 'tx.ddcStaking not found on chain' },
    ]);
  });

  it('passes matching and existence-only (args: -1) entries', () => {
    const manifest: SurfaceEntry[] = [
      { kind: 'tx', pallet: 'ddcClusters', method: 'addNode', args: 2 },
      { kind: 'query', pallet: 'ddcClusters', method: 'clustersGovParams', args: -1 },
    ];
    expect(diffSurface(manifest, live)).toEqual([]);
  });
});
