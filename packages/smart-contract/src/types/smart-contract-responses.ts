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
    cluster_id: 1,
    cluster: {
        manager_id: '5Fq4A47kApWUKP9CXZqbKvHMotQD5f4qeivLBM9CjZ1Da3GA',
        vnodes: [1, 2, 3, 1, 2, 3, 1, 2, 3],
        resource_per_vnode: 1_000_000,
        resource_used: 0,
        revenues: {value: 0},
        total_rent: 90_000_000_000,
    },
    params: 'storage.devnet',
};

export type ClusterGetResult = typeof ClusterGetResultExample;
