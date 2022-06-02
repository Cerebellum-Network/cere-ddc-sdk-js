export class NodeStatus {
    node_id: bigint;
    params: string
    node: Node

    constructor(node_id: bigint, params: string, node: Node) {
        this.node_id = node_id;
        this.params = params;
        this.node = node;
    }
}

export class Node {
    provider_id: string;
    rent_per_month: number;
    free_resource: number;

    constructor(provider_id: string, rent_per_month: number, free_resource: number) {
        this.provider_id = provider_id;
        this.rent_per_month = rent_per_month;
        this.free_resource = free_resource;
    }
}