export class ClusterStatus {
    constructor(
        readonly cluster_id: bigint,
        readonly cluster: Cluster,
        readonly params: string
    ) {
    }
}

export class Cluster {
    constructor(
        readonly manager_id: string,
        readonly vnodes: Array<bigint>,
        readonly resource_per_vnode: bigint,
        readonly resource_used: bigint,
        readonly revenues: bigint,
        readonly total_rent: bigint,
    ) {
    }
}
