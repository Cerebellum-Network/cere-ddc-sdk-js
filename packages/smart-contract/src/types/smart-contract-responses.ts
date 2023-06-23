const CdnClusterGetResultSample = {
    cluster_id: 0,
    cluster: {
        manager_id: '5Fq4A47kApWUKP9CXZqbKvHMotQD5f4qeivLBM9CjZ1Da3GA',
        cdnNodes: [1, 2],
        resources_used: 0,
        revenues: {value: 0},
        usd_per_gb: 0,
    },
};

export type CdnClusterGetResult = typeof CdnClusterGetResultSample;

const CdnNodeGetResultSample = {
    node_id: 1,
    node: {provider_id: '5Fq4A47kApWUKP9CXZqbKvHMotQD5f4qeivLBM9CjZ1Da3GA', undistributed_payment: 0},
    params: JSON.stringify({url: 'https://node-0.v2.cdn.devnet.cere.network'}),
};

export type CdnNodeGetResult = typeof CdnNodeGetResultSample;

const ClusterGetResultExample = {
    clusterId: 1,
    cluster: {
        managerId: '6UJs2Uj5hV2Jto7Z2FAhM2hXpvvQtcr4dwM6abKzMYQBHmpi',
        resourcePerVnode: 100_000_000,
        resourceUsed: 0,
        revenues: {value: 0},
        nodeIds: [1, 2, 3],
        vNodes: [
            [3_074_457_345_618_258_602, 12_297_829_382_473_034_408],
            [6_148_914_691_236_517_204, 15_372_286_728_091_293_010],
            [9_223_372_036_854_775_806, 18_446_744_073_709_551_612],
        ],
        totalRent: 60_000_000_000,
    },
    params: 'devnet',
};

export type ClusterGetResult = typeof ClusterGetResultExample;
