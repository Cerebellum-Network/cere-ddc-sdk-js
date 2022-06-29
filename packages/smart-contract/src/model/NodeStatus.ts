export class NodeStatus {
    constructor(
        readonly node_id: bigint,
        readonly params: string,
        readonly node: Node
    ) {
    }
}

export class Node {
    constructor(
        readonly provider_id: string,
        readonly rent_per_month: number,
        readonly free_resource: number
    ) {
    }
}