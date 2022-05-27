export class ClusterStatus {
    cluster_id: bigint;
    cluster: Cluster;
    params: string;

    constructor(
        cluster_id: bigint,
        cluster: Cluster,
        params: string
    ) {
        this.cluster_id = cluster_id;
        this.cluster = cluster;
        this.params = params;
    }
}

export class Cluster {
    manager_id: string;
    vnodes: Array<bigint>;
    resource_per_vnode: bigint;
    resource_used: bigint;
    revenues: bigint;
    total_rent: bigint;

    constructor(
        manager_id: string,
        vnodes: Array<bigint>,
        resource_per_vnode: bigint,
        resource_used: bigint,
        revenues: bigint,
        total_rent: bigint,
    ) {
        this.manager_id = manager_id;
        this.vnodes = vnodes;
        this.resource_per_vnode = resource_per_vnode;
        this.resource_used = resource_used;
        this.revenues = revenues;
        this.total_rent = total_rent;
    }
}
