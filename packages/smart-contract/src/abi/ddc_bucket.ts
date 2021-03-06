export const ddcBucketAbi = {
    "metadataVersion": "0.1.0",
    "source": {
        "hash": "0x5e690c8fd199cbf15e7f27bf1b510235aaf5d2bfebc776f72b77f04e03c1ad3b",
        "language": "ink! 3.0.0-rc4",
        "compiler": "rustc 1.59.0-nightly"
    },
    "contract": {
        "name": "ddc_bucket",
        "version": "0.5.0",
        "authors": [
            "Aurélien Nicolas <aurel@cere.network>"
        ]
    },
    "spec": {
        "constructors": [
            {
                "args": [],
                "docs": [],
                "name": [
                    "new"
                ],
                "selector": "0x9bae9d5e"
            }
        ],
        "docs": [],
        "events": [
            {
                "args": [
                    {
                        "docs": [],
                        "indexed": true,
                        "name": "bucket_id",
                        "type": {
                            "displayName": [
                                "BucketId"
                            ],
                            "type": 1
                        }
                    },
                    {
                        "docs": [],
                        "indexed": true,
                        "name": "owner_id",
                        "type": {
                            "displayName": [
                                "AccountId"
                            ],
                            "type": 3
                        }
                    }
                ],
                "docs": [],
                "name": "BucketCreated"
            },
            {
                "args": [
                    {
                        "docs": [],
                        "indexed": true,
                        "name": "bucket_id",
                        "type": {
                            "displayName": [
                                "BucketId"
                            ],
                            "type": 1
                        }
                    },
                    {
                        "docs": [],
                        "indexed": true,
                        "name": "cluster_id",
                        "type": {
                            "displayName": [
                                "ClusterId"
                            ],
                            "type": 1
                        }
                    },
                    {
                        "docs": [],
                        "indexed": false,
                        "name": "resource",
                        "type": {
                            "displayName": [
                                "Resource"
                            ],
                            "type": 1
                        }
                    }
                ],
                "docs": [],
                "name": "BucketAllocated"
            },
            {
                "args": [
                    {
                        "docs": [],
                        "indexed": true,
                        "name": "bucket_id",
                        "type": {
                            "displayName": [
                                "BucketId"
                            ],
                            "type": 1
                        }
                    },
                    {
                        "docs": [],
                        "indexed": true,
                        "name": "cluster_id",
                        "type": {
                            "displayName": [
                                "ClusterId"
                            ],
                            "type": 1
                        }
                    }
                ],
                "docs": [],
                "name": "BucketSettlePayment"
            },
            {
                "args": [
                    {
                        "docs": [],
                        "indexed": true,
                        "name": "cluster_id",
                        "type": {
                            "displayName": [
                                "ClusterId"
                            ],
                            "type": 1
                        }
                    },
                    {
                        "docs": [],
                        "indexed": true,
                        "name": "manager",
                        "type": {
                            "displayName": [
                                "AccountId"
                            ],
                            "type": 3
                        }
                    },
                    {
                        "docs": [],
                        "indexed": false,
                        "name": "cluster_params",
                        "type": {
                            "displayName": [
                                "ClusterParams"
                            ],
                            "type": 9
                        }
                    }
                ],
                "docs": [],
                "name": "ClusterCreated"
            },
            {
                "args": [
                    {
                        "docs": [],
                        "indexed": true,
                        "name": "cluster_id",
                        "type": {
                            "displayName": [
                                "ClusterId"
                            ],
                            "type": 1
                        }
                    },
                    {
                        "docs": [],
                        "indexed": true,
                        "name": "node_id",
                        "type": {
                            "displayName": [
                                "NodeId"
                            ],
                            "type": 1
                        }
                    },
                    {
                        "docs": [],
                        "indexed": false,
                        "name": "vnode_index",
                        "type": {
                            "displayName": [
                                "VNodeIndex"
                            ],
                            "type": 1
                        }
                    }
                ],
                "docs": [],
                "name": "ClusterNodeReplaced"
            },
            {
                "args": [
                    {
                        "docs": [],
                        "indexed": true,
                        "name": "cluster_id",
                        "type": {
                            "displayName": [
                                "ClusterId"
                            ],
                            "type": 1
                        }
                    },
                    {
                        "docs": [],
                        "indexed": false,
                        "name": "resource",
                        "type": {
                            "displayName": [
                                "Resource"
                            ],
                            "type": 1
                        }
                    }
                ],
                "docs": [],
                "name": "ClusterReserveResource"
            },
            {
                "args": [
                    {
                        "docs": [],
                        "indexed": true,
                        "name": "cluster_id",
                        "type": {
                            "displayName": [
                                "ClusterId"
                            ],
                            "type": 1
                        }
                    },
                    {
                        "docs": [],
                        "indexed": true,
                        "name": "provider_id",
                        "type": {
                            "displayName": [
                                "AccountId"
                            ],
                            "type": 3
                        }
                    }
                ],
                "docs": [],
                "name": "ClusterDistributeRevenues"
            },
            {
                "args": [
                    {
                        "docs": [],
                        "indexed": true,
                        "name": "node_id",
                        "type": {
                            "displayName": [
                                "NodeId"
                            ],
                            "type": 1
                        }
                    },
                    {
                        "docs": [],
                        "indexed": true,
                        "name": "provider_id",
                        "type": {
                            "displayName": [
                                "AccountId"
                            ],
                            "type": 3
                        }
                    },
                    {
                        "docs": [],
                        "indexed": false,
                        "name": "rent_per_month",
                        "type": {
                            "displayName": [
                                "Balance"
                            ],
                            "type": 8
                        }
                    },
                    {
                        "docs": [],
                        "indexed": false,
                        "name": "node_params",
                        "type": {
                            "displayName": [
                                "NodeParams"
                            ],
                            "type": 9
                        }
                    }
                ],
                "docs": [],
                "name": "NodeCreated"
            },
            {
                "args": [
                    {
                        "docs": [],
                        "indexed": true,
                        "name": "account_id",
                        "type": {
                            "displayName": [
                                "AccountId"
                            ],
                            "type": 3
                        }
                    },
                    {
                        "docs": [],
                        "indexed": false,
                        "name": "value",
                        "type": {
                            "displayName": [
                                "Balance"
                            ],
                            "type": 8
                        }
                    }
                ],
                "docs": [],
                "name": "Deposit"
            },
            {
                "args": [
                    {
                        "docs": [],
                        "indexed": true,
                        "name": "account_id",
                        "type": {
                            "displayName": [
                                "AccountId"
                            ],
                            "type": 3
                        }
                    },
                    {
                        "docs": [],
                        "indexed": false,
                        "name": "permission",
                        "type": {
                            "displayName": [
                                "Permission"
                            ],
                            "type": 42
                        }
                    }
                ],
                "docs": [],
                "name": "GrantPermission"
            },
            {
                "args": [
                    {
                        "docs": [],
                        "indexed": true,
                        "name": "account_id",
                        "type": {
                            "displayName": [
                                "AccountId"
                            ],
                            "type": 3
                        }
                    },
                    {
                        "docs": [],
                        "indexed": false,
                        "name": "permission",
                        "type": {
                            "displayName": [
                                "Permission"
                            ],
                            "type": 42
                        }
                    }
                ],
                "docs": [],
                "name": "RevokePermission"
            }
        ],
        "messages": [
            {
                "args": [
                    {
                        "name": "bucket_params",
                        "type": {
                            "displayName": [
                                "BucketParams"
                            ],
                            "type": 9
                        }
                    },
                    {
                        "name": "cluster_id",
                        "type": {
                            "displayName": [
                                "ClusterId"
                            ],
                            "type": 1
                        }
                    }
                ],
                "docs": [],
                "mutates": true,
                "name": [
                    "bucket_create"
                ],
                "payable": true,
                "returnType": {
                    "displayName": [
                        "BucketId"
                    ],
                    "type": 1
                },
                "selector": "0x0aeb2379"
            },
            {
                "args": [
                    {
                        "name": "bucket_id",
                        "type": {
                            "displayName": [
                                "BucketId"
                            ],
                            "type": 1
                        }
                    },
                    {
                        "name": "resource",
                        "type": {
                            "displayName": [
                                "Resource"
                            ],
                            "type": 1
                        }
                    }
                ],
                "docs": [],
                "mutates": true,
                "name": [
                    "bucket_alloc_into_cluster"
                ],
                "payable": false,
                "returnType": {
                    "displayName": [],
                    "type": 23
                },
                "selector": "0x4c482d19"
            },
            {
                "args": [
                    {
                        "name": "bucket_id",
                        "type": {
                            "displayName": [
                                "BucketId"
                            ],
                            "type": 1
                        }
                    }
                ],
                "docs": [],
                "mutates": true,
                "name": [
                    "bucket_settle_payment"
                ],
                "payable": false,
                "returnType": null,
                "selector": "0x15974555"
            },
            {
                "args": [
                    {
                        "name": "bucket_id",
                        "type": {
                            "displayName": [
                                "BucketId"
                            ],
                            "type": 1
                        }
                    },
                    {
                        "name": "params",
                        "type": {
                            "displayName": [
                                "BucketParams"
                            ],
                            "type": 9
                        }
                    }
                ],
                "docs": [],
                "mutates": true,
                "name": [
                    "bucket_change_params"
                ],
                "payable": true,
                "returnType": null,
                "selector": "0x9f2d075b"
            },
            {
                "args": [
                    {
                        "name": "bucket_id",
                        "type": {
                            "displayName": [
                                "BucketId"
                            ],
                            "type": 1
                        }
                    }
                ],
                "docs": [],
                "mutates": false,
                "name": [
                    "bucket_get"
                ],
                "payable": false,
                "returnType": {
                    "displayName": [
                        "Result"
                    ],
                    "type": 24
                },
                "selector": "0x3802cb77"
            },
            {
                "args": [
                    {
                        "name": "offset",
                        "type": {
                            "displayName": [
                                "u32"
                            ],
                            "type": 1
                        }
                    },
                    {
                        "name": "limit",
                        "type": {
                            "displayName": [
                                "u32"
                            ],
                            "type": 1
                        }
                    },
                    {
                        "name": "filter_owner_id",
                        "type": {
                            "displayName": [
                                "Option"
                            ],
                            "type": 30
                        }
                    }
                ],
                "docs": [],
                "mutates": false,
                "name": [
                    "bucket_list"
                ],
                "payable": false,
                "returnType": {
                    "displayName": [],
                    "type": 31
                },
                "selector": "0x417ab584"
            },
            {
                "args": [
                    {
                        "name": "manager",
                        "type": {
                            "displayName": [
                                "AccountId"
                            ],
                            "type": 3
                        }
                    },
                    {
                        "name": "vnode_count",
                        "type": {
                            "displayName": [
                                "u32"
                            ],
                            "type": 1
                        }
                    },
                    {
                        "name": "node_ids",
                        "type": {
                            "displayName": [
                                "Vec"
                            ],
                            "type": 11
                        }
                    },
                    {
                        "name": "cluster_params",
                        "type": {
                            "displayName": [
                                "ClusterParams"
                            ],
                            "type": 9
                        }
                    }
                ],
                "docs": [],
                "mutates": true,
                "name": [
                    "cluster_create"
                ],
                "payable": true,
                "returnType": {
                    "displayName": [
                        "NodeId"
                    ],
                    "type": 1
                },
                "selector": "0x4c0f21f6"
            },
            {
                "args": [
                    {
                        "name": "cluster_id",
                        "type": {
                            "displayName": [
                                "ClusterId"
                            ],
                            "type": 1
                        }
                    },
                    {
                        "name": "amount",
                        "type": {
                            "displayName": [
                                "Resource"
                            ],
                            "type": 1
                        }
                    }
                ],
                "docs": [],
                "mutates": true,
                "name": [
                    "cluster_reserve_resource"
                ],
                "payable": false,
                "returnType": {
                    "displayName": [],
                    "type": 23
                },
                "selector": "0xb5e38125"
            },
            {
                "args": [
                    {
                        "name": "cluster_id",
                        "type": {
                            "displayName": [
                                "ClusterId"
                            ],
                            "type": 1
                        }
                    },
                    {
                        "name": "vnode_i",
                        "type": {
                            "displayName": [
                                "VNodeIndex"
                            ],
                            "type": 1
                        }
                    },
                    {
                        "name": "new_node_id",
                        "type": {
                            "displayName": [
                                "NodeId"
                            ],
                            "type": 1
                        }
                    }
                ],
                "docs": [],
                "mutates": true,
                "name": [
                    "cluster_replace_node"
                ],
                "payable": false,
                "returnType": {
                    "displayName": [],
                    "type": 23
                },
                "selector": "0x48194ab1"
            },
            {
                "args": [
                    {
                        "name": "cluster_id",
                        "type": {
                            "displayName": [
                                "ClusterId"
                            ],
                            "type": 1
                        }
                    }
                ],
                "docs": [],
                "mutates": true,
                "name": [
                    "cluster_distribute_revenues"
                ],
                "payable": false,
                "returnType": null,
                "selector": "0xe71e66fc"
            },
            {
                "args": [
                    {
                        "name": "cluster_id",
                        "type": {
                            "displayName": [
                                "ClusterId"
                            ],
                            "type": 1
                        }
                    },
                    {
                        "name": "params",
                        "type": {
                            "displayName": [
                                "ClusterParams"
                            ],
                            "type": 9
                        }
                    }
                ],
                "docs": [],
                "mutates": true,
                "name": [
                    "cluster_change_params"
                ],
                "payable": true,
                "returnType": null,
                "selector": "0x1207912c"
            },
            {
                "args": [
                    {
                        "name": "cluster_id",
                        "type": {
                            "displayName": [
                                "ClusterId"
                            ],
                            "type": 1
                        }
                    }
                ],
                "docs": [],
                "mutates": false,
                "name": [
                    "cluster_get"
                ],
                "payable": false,
                "returnType": {
                    "displayName": [
                        "Result"
                    ],
                    "type": 33
                },
                "selector": "0xe75411f5"
            },
            {
                "args": [
                    {
                        "name": "offset",
                        "type": {
                            "displayName": [
                                "u32"
                            ],
                            "type": 1
                        }
                    },
                    {
                        "name": "limit",
                        "type": {
                            "displayName": [
                                "u32"
                            ],
                            "type": 1
                        }
                    },
                    {
                        "name": "filter_manager_id",
                        "type": {
                            "displayName": [
                                "Option"
                            ],
                            "type": 30
                        }
                    }
                ],
                "docs": [],
                "mutates": false,
                "name": [
                    "cluster_list"
                ],
                "payable": false,
                "returnType": {
                    "displayName": [],
                    "type": 35
                },
                "selector": "0xd9db9d44"
            },
            {
                "args": [
                    {
                        "name": "manager",
                        "type": {
                            "displayName": [
                                "AccountId"
                            ],
                            "type": 3
                        }
                    }
                ],
                "docs": [],
                "mutates": true,
                "name": [
                    "node_trust_manager"
                ],
                "payable": true,
                "returnType": null,
                "selector": "0x6fd54a01"
            },
            {
                "args": [
                    {
                        "name": "manager",
                        "type": {
                            "displayName": [
                                "AccountId"
                            ],
                            "type": 3
                        }
                    }
                ],
                "docs": [],
                "mutates": true,
                "name": [
                    "node_distrust_manager"
                ],
                "payable": false,
                "returnType": null,
                "selector": "0x40912279"
            },
            {
                "args": [
                    {
                        "name": "rent_per_month",
                        "type": {
                            "displayName": [
                                "Balance"
                            ],
                            "type": 8
                        }
                    },
                    {
                        "name": "node_params",
                        "type": {
                            "displayName": [
                                "NodeParams"
                            ],
                            "type": 9
                        }
                    },
                    {
                        "name": "capacity",
                        "type": {
                            "displayName": [
                                "Resource"
                            ],
                            "type": 1
                        }
                    }
                ],
                "docs": [],
                "mutates": true,
                "name": [
                    "node_create"
                ],
                "payable": true,
                "returnType": {
                    "displayName": [
                        "NodeId"
                    ],
                    "type": 1
                },
                "selector": "0xb77ac1bb"
            },
            {
                "args": [
                    {
                        "name": "node_id",
                        "type": {
                            "displayName": [
                                "NodeId"
                            ],
                            "type": 1
                        }
                    },
                    {
                        "name": "params",
                        "type": {
                            "displayName": [
                                "NodeParams"
                            ],
                            "type": 9
                        }
                    }
                ],
                "docs": [],
                "mutates": true,
                "name": [
                    "node_change_params"
                ],
                "payable": true,
                "returnType": null,
                "selector": "0x258ccb2a"
            },
            {
                "args": [
                    {
                        "name": "node_id",
                        "type": {
                            "displayName": [
                                "NodeId"
                            ],
                            "type": 1
                        }
                    }
                ],
                "docs": [],
                "mutates": false,
                "name": [
                    "node_get"
                ],
                "payable": false,
                "returnType": {
                    "displayName": [
                        "Result"
                    ],
                    "type": 37
                },
                "selector": "0x847f3997"
            },
            {
                "args": [
                    {
                        "name": "offset",
                        "type": {
                            "displayName": [
                                "u32"
                            ],
                            "type": 1
                        }
                    },
                    {
                        "name": "limit",
                        "type": {
                            "displayName": [
                                "u32"
                            ],
                            "type": 1
                        }
                    },
                    {
                        "name": "filter_provider_id",
                        "type": {
                            "displayName": [
                                "Option"
                            ],
                            "type": 30
                        }
                    }
                ],
                "docs": [],
                "mutates": false,
                "name": [
                    "node_list"
                ],
                "payable": false,
                "returnType": {
                    "displayName": [],
                    "type": 39
                },
                "selector": "0x423286d6"
            },
            {
                "args": [],
                "docs": [],
                "mutates": true,
                "name": [
                    "account_deposit"
                ],
                "payable": true,
                "returnType": {
                    "displayName": [],
                    "type": 23
                },
                "selector": "0xc311af62"
            },
            {
                "args": [
                    {
                        "name": "account_id",
                        "type": {
                            "displayName": [
                                "AccountId"
                            ],
                            "type": 3
                        }
                    }
                ],
                "docs": [],
                "mutates": false,
                "name": [
                    "account_get"
                ],
                "payable": false,
                "returnType": {
                    "displayName": [
                        "Result"
                    ],
                    "type": 41
                },
                "selector": "0x1d4220fa"
            },
            {
                "args": [],
                "docs": [],
                "mutates": false,
                "name": [
                    "account_get_usd_per_cere"
                ],
                "payable": false,
                "returnType": {
                    "displayName": [
                        "Balance"
                    ],
                    "type": 8
                },
                "selector": "0xe4a4652a"
            },
            {
                "args": [
                    {
                        "name": "usd_per_cere",
                        "type": {
                            "displayName": [
                                "Balance"
                            ],
                            "type": 8
                        }
                    }
                ],
                "docs": [],
                "mutates": true,
                "name": [
                    "account_set_usd_per_cere"
                ],
                "payable": false,
                "returnType": null,
                "selector": "0x48d45ee8"
            },
            {
                "args": [
                    {
                        "name": "grantee",
                        "type": {
                            "displayName": [
                                "AccountId"
                            ],
                            "type": 3
                        }
                    },
                    {
                        "name": "permission",
                        "type": {
                            "displayName": [
                                "Permission"
                            ],
                            "type": 42
                        }
                    }
                ],
                "docs": [],
                "mutates": false,
                "name": [
                    "has_permission"
                ],
                "payable": false,
                "returnType": {
                    "displayName": [
                        "bool"
                    ],
                    "type": 22
                },
                "selector": "0xe0942492"
            },
            {
                "args": [
                    {
                        "name": "grantee",
                        "type": {
                            "displayName": [
                                "AccountId"
                            ],
                            "type": 3
                        }
                    },
                    {
                        "name": "permission",
                        "type": {
                            "displayName": [
                                "Permission"
                            ],
                            "type": 42
                        }
                    }
                ],
                "docs": [],
                "mutates": true,
                "name": [
                    "admin_grant_permission"
                ],
                "payable": true,
                "returnType": null,
                "selector": "0xbe41ea55"
            },
            {
                "args": [
                    {
                        "name": "grantee",
                        "type": {
                            "displayName": [
                                "AccountId"
                            ],
                            "type": 3
                        }
                    },
                    {
                        "name": "permission",
                        "type": {
                            "displayName": [
                                "Permission"
                            ],
                            "type": 42
                        }
                    }
                ],
                "docs": [],
                "mutates": true,
                "name": [
                    "admin_revoke_permission"
                ],
                "payable": false,
                "returnType": null,
                "selector": "0x6b150666"
            },
            {
                "args": [
                    {
                        "name": "amount",
                        "type": {
                            "displayName": [
                                "Balance"
                            ],
                            "type": 8
                        }
                    }
                ],
                "docs": [],
                "mutates": true,
                "name": [
                    "admin_withdraw"
                ],
                "payable": false,
                "returnType": null,
                "selector": "0x2f6e0868"
            }
        ]
    },
    "storage": {
        "struct": {
            "fields": [
                {
                    "layout": {
                        "struct": {
                            "fields": [
                                {
                                    "layout": {
                                        "struct": {
                                            "fields": [
                                                {
                                                    "layout": {
                                                        "cell": {
                                                            "key": "0x0000000000000000000000000000000000000000000000000000000000000000",
                                                            "ty": 1
                                                        }
                                                    },
                                                    "name": "len"
                                                },
                                                {
                                                    "layout": {
                                                        "array": {
                                                            "cellsPerElem": 1,
                                                            "layout": {
                                                                "cell": {
                                                                    "key": "0x0000000001000000000000000000000000000000000000000000000000000000",
                                                                    "ty": 2
                                                                }
                                                            },
                                                            "len": 4294967295,
                                                            "offset": "0x0100000000000000000000000000000000000000000000000000000000000000"
                                                        }
                                                    },
                                                    "name": "elems"
                                                }
                                            ]
                                        }
                                    },
                                    "name": null
                                }
                            ]
                        }
                    },
                    "name": "buckets"
                },
                {
                    "layout": {
                        "struct": {
                            "fields": [
                                {
                                    "layout": {
                                        "struct": {
                                            "fields": [
                                                {
                                                    "layout": {
                                                        "cell": {
                                                            "key": "0x0000000001000000000000000000000000000000000000000000000000000000",
                                                            "ty": 1
                                                        }
                                                    },
                                                    "name": "len"
                                                },
                                                {
                                                    "layout": {
                                                        "array": {
                                                            "cellsPerElem": 1,
                                                            "layout": {
                                                                "cell": {
                                                                    "key": "0x0000000002000000000000000000000000000000000000000000000000000000",
                                                                    "ty": 9
                                                                }
                                                            },
                                                            "len": 4294967295,
                                                            "offset": "0x0100000001000000000000000000000000000000000000000000000000000000"
                                                        }
                                                    },
                                                    "name": "elems"
                                                }
                                            ]
                                        }
                                    },
                                    "name": null
                                }
                            ]
                        }
                    },
                    "name": "bucket_params"
                },
                {
                    "layout": {
                        "struct": {
                            "fields": [
                                {
                                    "layout": {
                                        "struct": {
                                            "fields": [
                                                {
                                                    "layout": {
                                                        "cell": {
                                                            "key": "0x0000000002000000000000000000000000000000000000000000000000000000",
                                                            "ty": 1
                                                        }
                                                    },
                                                    "name": "len"
                                                },
                                                {
                                                    "layout": {
                                                        "array": {
                                                            "cellsPerElem": 1,
                                                            "layout": {
                                                                "cell": {
                                                                    "key": "0x0000000003000000000000000000000000000000000000000000000000000000",
                                                                    "ty": 10
                                                                }
                                                            },
                                                            "len": 4294967295,
                                                            "offset": "0x0100000002000000000000000000000000000000000000000000000000000000"
                                                        }
                                                    },
                                                    "name": "elems"
                                                }
                                            ]
                                        }
                                    },
                                    "name": null
                                }
                            ]
                        }
                    },
                    "name": "clusters"
                },
                {
                    "layout": {
                        "struct": {
                            "fields": [
                                {
                                    "layout": {
                                        "struct": {
                                            "fields": [
                                                {
                                                    "layout": {
                                                        "cell": {
                                                            "key": "0x0000000003000000000000000000000000000000000000000000000000000000",
                                                            "ty": 1
                                                        }
                                                    },
                                                    "name": "len"
                                                },
                                                {
                                                    "layout": {
                                                        "array": {
                                                            "cellsPerElem": 1,
                                                            "layout": {
                                                                "cell": {
                                                                    "key": "0x0000000004000000000000000000000000000000000000000000000000000000",
                                                                    "ty": 9
                                                                }
                                                            },
                                                            "len": 4294967295,
                                                            "offset": "0x0100000003000000000000000000000000000000000000000000000000000000"
                                                        }
                                                    },
                                                    "name": "elems"
                                                }
                                            ]
                                        }
                                    },
                                    "name": null
                                }
                            ]
                        }
                    },
                    "name": "cluster_params"
                },
                {
                    "layout": {
                        "struct": {
                            "fields": [
                                {
                                    "layout": {
                                        "struct": {
                                            "fields": [
                                                {
                                                    "layout": {
                                                        "cell": {
                                                            "key": "0x0000000004000000000000000000000000000000000000000000000000000000",
                                                            "ty": 1
                                                        }
                                                    },
                                                    "name": "len"
                                                },
                                                {
                                                    "layout": {
                                                        "array": {
                                                            "cellsPerElem": 1,
                                                            "layout": {
                                                                "cell": {
                                                                    "key": "0x0000000005000000000000000000000000000000000000000000000000000000",
                                                                    "ty": 13
                                                                }
                                                            },
                                                            "len": 4294967295,
                                                            "offset": "0x0100000004000000000000000000000000000000000000000000000000000000"
                                                        }
                                                    },
                                                    "name": "elems"
                                                }
                                            ]
                                        }
                                    },
                                    "name": null
                                }
                            ]
                        }
                    },
                    "name": "nodes"
                },
                {
                    "layout": {
                        "struct": {
                            "fields": [
                                {
                                    "layout": {
                                        "struct": {
                                            "fields": [
                                                {
                                                    "layout": {
                                                        "cell": {
                                                            "key": "0x0000000005000000000000000000000000000000000000000000000000000000",
                                                            "ty": 1
                                                        }
                                                    },
                                                    "name": "len"
                                                },
                                                {
                                                    "layout": {
                                                        "array": {
                                                            "cellsPerElem": 1,
                                                            "layout": {
                                                                "cell": {
                                                                    "key": "0x0000000006000000000000000000000000000000000000000000000000000000",
                                                                    "ty": 9
                                                                }
                                                            },
                                                            "len": 4294967295,
                                                            "offset": "0x0100000005000000000000000000000000000000000000000000000000000000"
                                                        }
                                                    },
                                                    "name": "elems"
                                                }
                                            ]
                                        }
                                    },
                                    "name": null
                                }
                            ]
                        }
                    },
                    "name": "node_params"
                },
                {
                    "layout": {
                        "struct": {
                            "fields": [
                                {
                                    "layout": {
                                        "struct": {
                                            "fields": [
                                                {
                                                    "layout": {
                                                        "struct": {
                                                            "fields": [
                                                                {
                                                                    "layout": {
                                                                        "cell": {
                                                                            "key": "0x0000000006000000000000000000000000000000000000000000000000000000",
                                                                            "ty": 14
                                                                        }
                                                                    },
                                                                    "name": "header"
                                                                },
                                                                {
                                                                    "layout": {
                                                                        "struct": {
                                                                            "fields": [
                                                                                {
                                                                                    "layout": {
                                                                                        "cell": {
                                                                                            "key": "0x0100000006000000000000000000000000000000000000000000000000000000",
                                                                                            "ty": 1
                                                                                        }
                                                                                    },
                                                                                    "name": "len"
                                                                                },
                                                                                {
                                                                                    "layout": {
                                                                                        "array": {
                                                                                            "cellsPerElem": 1,
                                                                                            "layout": {
                                                                                                "cell": {
                                                                                                    "key": "0x0100000007000000000000000000000000000000000000000000000000000000",
                                                                                                    "ty": 15
                                                                                                }
                                                                                            },
                                                                                            "len": 4294967295,
                                                                                            "offset": "0x0200000006000000000000000000000000000000000000000000000000000000"
                                                                                        }
                                                                                    },
                                                                                    "name": "elems"
                                                                                }
                                                                            ]
                                                                        }
                                                                    },
                                                                    "name": "entries"
                                                                }
                                                            ]
                                                        }
                                                    },
                                                    "name": "keys"
                                                },
                                                {
                                                    "layout": {
                                                        "hash": {
                                                            "layout": {
                                                                "cell": {
                                                                    "key": "0x0200000007000000000000000000000000000000000000000000000000000000",
                                                                    "ty": 17
                                                                }
                                                            },
                                                            "offset": "0x0100000007000000000000000000000000000000000000000000000000000000",
                                                            "strategy": {
                                                                "hasher": "Blake2x256",
                                                                "postfix": "",
                                                                "prefix": "0x696e6b20686173686d6170"
                                                            }
                                                        }
                                                    },
                                                    "name": "values"
                                                }
                                            ]
                                        }
                                    },
                                    "name": null
                                },
                                {
                                    "layout": {
                                        "struct": {
                                            "fields": [
                                                {
                                                    "layout": {
                                                        "cell": {
                                                            "key": "0x0200000007000000000000000000000000000000000000000000000000000000",
                                                            "ty": 8
                                                        }
                                                    },
                                                    "name": null
                                                }
                                            ]
                                        }
                                    },
                                    "name": null
                                }
                            ]
                        }
                    },
                    "name": "accounts"
                },
                {
                    "layout": {
                        "struct": {
                            "fields": [
                                {
                                    "layout": {
                                        "struct": {
                                            "fields": [
                                                {
                                                    "layout": {
                                                        "struct": {
                                                            "fields": [
                                                                {
                                                                    "layout": {
                                                                        "cell": {
                                                                            "key": "0x0300000007000000000000000000000000000000000000000000000000000000",
                                                                            "ty": 14
                                                                        }
                                                                    },
                                                                    "name": "header"
                                                                },
                                                                {
                                                                    "layout": {
                                                                        "struct": {
                                                                            "fields": [
                                                                                {
                                                                                    "layout": {
                                                                                        "cell": {
                                                                                            "key": "0x0400000007000000000000000000000000000000000000000000000000000000",
                                                                                            "ty": 1
                                                                                        }
                                                                                    },
                                                                                    "name": "len"
                                                                                },
                                                                                {
                                                                                    "layout": {
                                                                                        "array": {
                                                                                            "cellsPerElem": 1,
                                                                                            "layout": {
                                                                                                "cell": {
                                                                                                    "key": "0x0400000008000000000000000000000000000000000000000000000000000000",
                                                                                                    "ty": 19
                                                                                                }
                                                                                            },
                                                                                            "len": 4294967295,
                                                                                            "offset": "0x0500000007000000000000000000000000000000000000000000000000000000"
                                                                                        }
                                                                                    },
                                                                                    "name": "elems"
                                                                                }
                                                                            ]
                                                                        }
                                                                    },
                                                                    "name": "entries"
                                                                }
                                                            ]
                                                        }
                                                    },
                                                    "name": "keys"
                                                },
                                                {
                                                    "layout": {
                                                        "hash": {
                                                            "layout": {
                                                                "cell": {
                                                                    "key": "0x0500000008000000000000000000000000000000000000000000000000000000",
                                                                    "ty": 21
                                                                }
                                                            },
                                                            "offset": "0x0400000008000000000000000000000000000000000000000000000000000000",
                                                            "strategy": {
                                                                "hasher": "Blake2x256",
                                                                "postfix": "",
                                                                "prefix": "0x696e6b20686173686d6170"
                                                            }
                                                        }
                                                    },
                                                    "name": "values"
                                                }
                                            ]
                                        }
                                    },
                                    "name": null
                                }
                            ]
                        }
                    },
                    "name": "perms"
                }
            ]
        }
    },
    "types": [
        {
            "def": {
                "primitive": "u32"
            }
        },
        {
            "def": {
                "composite": {
                    "fields": [
                        {
                            "name": "owner_id",
                            "type": 3,
                            "typeName": "AccountId"
                        },
                        {
                            "name": "cluster_id",
                            "type": 1,
                            "typeName": "ClusterId"
                        },
                        {
                            "name": "flow",
                            "type": 6,
                            "typeName": "Flow"
                        },
                        {
                            "name": "resource_reserved",
                            "type": 1,
                            "typeName": "Resource"
                        }
                    ]
                }
            },
            "path": [
                "ddc_bucket",
                "ddc_bucket",
                "bucket",
                "entity",
                "Bucket"
            ]
        },
        {
            "def": {
                "composite": {
                    "fields": [
                        {
                            "type": 4,
                            "typeName": "[u8; 32]"
                        }
                    ]
                }
            },
            "path": [
                "ink_env",
                "types",
                "AccountId"
            ]
        },
        {
            "def": {
                "array": {
                    "len": 32,
                    "type": 5
                }
            }
        },
        {
            "def": {
                "primitive": "u8"
            }
        },
        {
            "def": {
                "composite": {
                    "fields": [
                        {
                            "name": "from",
                            "type": 3,
                            "typeName": "AccountId"
                        },
                        {
                            "name": "schedule",
                            "type": 7,
                            "typeName": "Schedule"
                        }
                    ]
                }
            },
            "path": [
                "ddc_bucket",
                "ddc_bucket",
                "flow",
                "Flow"
            ]
        },
        {
            "def": {
                "composite": {
                    "fields": [
                        {
                            "name": "rate",
                            "type": 8,
                            "typeName": "Balance"
                        },
                        {
                            "name": "offset",
                            "type": 8,
                            "typeName": "Balance"
                        }
                    ]
                }
            },
            "path": [
                "ddc_bucket",
                "ddc_bucket",
                "schedule",
                "Schedule"
            ]
        },
        {
            "def": {
                "primitive": "u128"
            }
        },
        {
            "def": {
                "primitive": "str"
            }
        },
        {
            "def": {
                "composite": {
                    "fields": [
                        {
                            "name": "manager_id",
                            "type": 3,
                            "typeName": "AccountId"
                        },
                        {
                            "name": "vnodes",
                            "type": 11,
                            "typeName": "Vec<NodeId>"
                        },
                        {
                            "name": "resource_per_vnode",
                            "type": 1,
                            "typeName": "Resource"
                        },
                        {
                            "name": "resource_used",
                            "type": 1,
                            "typeName": "Resource"
                        },
                        {
                            "name": "revenues",
                            "type": 12,
                            "typeName": "Cash"
                        },
                        {
                            "name": "total_rent",
                            "type": 8,
                            "typeName": "Balance"
                        }
                    ]
                }
            },
            "path": [
                "ddc_bucket",
                "ddc_bucket",
                "cluster",
                "entity",
                "Cluster"
            ]
        },
        {
            "def": {
                "sequence": {
                    "type": 1
                }
            }
        },
        {
            "def": {
                "composite": {
                    "fields": [
                        {
                            "name": "value",
                            "type": 8,
                            "typeName": "Balance"
                        }
                    ]
                }
            },
            "path": [
                "ddc_bucket",
                "ddc_bucket",
                "cash",
                "Cash"
            ]
        },
        {
            "def": {
                "composite": {
                    "fields": [
                        {
                            "name": "provider_id",
                            "type": 3,
                            "typeName": "ProviderId"
                        },
                        {
                            "name": "rent_per_month",
                            "type": 8,
                            "typeName": "Balance"
                        },
                        {
                            "name": "free_resource",
                            "type": 1,
                            "typeName": "Resource"
                        }
                    ]
                }
            },
            "path": [
                "ddc_bucket",
                "ddc_bucket",
                "node",
                "entity",
                "Node"
            ]
        },
        {
            "def": {
                "composite": {
                    "fields": [
                        {
                            "name": "last_vacant",
                            "type": 1,
                            "typeName": "Index"
                        },
                        {
                            "name": "len",
                            "type": 1,
                            "typeName": "u32"
                        },
                        {
                            "name": "len_entries",
                            "type": 1,
                            "typeName": "u32"
                        }
                    ]
                }
            },
            "path": [
                "ink_storage",
                "collections",
                "stash",
                "Header"
            ]
        },
        {
            "def": {
                "variant": {
                    "variants": [
                        {
                            "fields": [
                                {
                                    "type": 16,
                                    "typeName": "VacantEntry"
                                }
                            ],
                            "name": "Vacant"
                        },
                        {
                            "fields": [
                                {
                                    "type": 3,
                                    "typeName": "T"
                                }
                            ],
                            "name": "Occupied"
                        }
                    ]
                }
            },
            "params": [
                3
            ],
            "path": [
                "ink_storage",
                "collections",
                "stash",
                "Entry"
            ]
        },
        {
            "def": {
                "composite": {
                    "fields": [
                        {
                            "name": "next",
                            "type": 1,
                            "typeName": "Index"
                        },
                        {
                            "name": "prev",
                            "type": 1,
                            "typeName": "Index"
                        }
                    ]
                }
            },
            "path": [
                "ink_storage",
                "collections",
                "stash",
                "VacantEntry"
            ]
        },
        {
            "def": {
                "composite": {
                    "fields": [
                        {
                            "name": "value",
                            "type": 18,
                            "typeName": "V"
                        },
                        {
                            "name": "key_index",
                            "type": 1,
                            "typeName": "KeyIndex"
                        }
                    ]
                }
            },
            "params": [
                18
            ],
            "path": [
                "ink_storage",
                "collections",
                "hashmap",
                "ValueEntry"
            ]
        },
        {
            "def": {
                "composite": {
                    "fields": [
                        {
                            "name": "deposit",
                            "type": 12,
                            "typeName": "Cash"
                        },
                        {
                            "name": "payable_schedule",
                            "type": 7,
                            "typeName": "Schedule"
                        }
                    ]
                }
            },
            "path": [
                "ddc_bucket",
                "ddc_bucket",
                "account",
                "entity",
                "Account"
            ]
        },
        {
            "def": {
                "variant": {
                    "variants": [
                        {
                            "fields": [
                                {
                                    "type": 16,
                                    "typeName": "VacantEntry"
                                }
                            ],
                            "name": "Vacant"
                        },
                        {
                            "fields": [
                                {
                                    "type": 20,
                                    "typeName": "T"
                                }
                            ],
                            "name": "Occupied"
                        }
                    ]
                }
            },
            "params": [
                20
            ],
            "path": [
                "ink_storage",
                "collections",
                "stash",
                "Entry"
            ]
        },
        {
            "def": {
                "sequence": {
                    "type": 5
                }
            }
        },
        {
            "def": {
                "composite": {
                    "fields": [
                        {
                            "name": "value",
                            "type": 22,
                            "typeName": "V"
                        },
                        {
                            "name": "key_index",
                            "type": 1,
                            "typeName": "KeyIndex"
                        }
                    ]
                }
            },
            "params": [
                22
            ],
            "path": [
                "ink_storage",
                "collections",
                "hashmap",
                "ValueEntry"
            ]
        },
        {
            "def": {
                "primitive": "bool"
            }
        },
        {
            "def": {
                "tuple": []
            }
        },
        {
            "def": {
                "variant": {
                    "variants": [
                        {
                            "fields": [
                                {
                                    "type": 25,
                                    "typeName": "T"
                                }
                            ],
                            "name": "Ok"
                        },
                        {
                            "fields": [
                                {
                                    "type": 29,
                                    "typeName": "E"
                                }
                            ],
                            "name": "Err"
                        }
                    ]
                }
            },
            "params": [
                25,
                29
            ],
            "path": [
                "Result"
            ]
        },
        {
            "def": {
                "composite": {
                    "fields": [
                        {
                            "name": "bucket_id",
                            "type": 1,
                            "typeName": "BucketId"
                        },
                        {
                            "name": "bucket",
                            "type": 26,
                            "typeName": "BucketInStatus"
                        },
                        {
                            "name": "params",
                            "type": 9,
                            "typeName": "BucketParams"
                        },
                        {
                            "name": "writer_ids",
                            "type": 27,
                            "typeName": "Vec<AccountId>"
                        },
                        {
                            "name": "rent_covered_until_ms",
                            "type": 28,
                            "typeName": "u64"
                        }
                    ]
                }
            },
            "path": [
                "ddc_bucket",
                "ddc_bucket",
                "bucket",
                "entity",
                "BucketStatus"
            ]
        },
        {
            "def": {
                "composite": {
                    "fields": [
                        {
                            "name": "owner_id",
                            "type": 3,
                            "typeName": "AccountId"
                        },
                        {
                            "name": "cluster_id",
                            "type": 1,
                            "typeName": "ClusterId"
                        },
                        {
                            "name": "resource_reserved",
                            "type": 1,
                            "typeName": "Resource"
                        }
                    ]
                }
            },
            "path": [
                "ddc_bucket",
                "ddc_bucket",
                "bucket",
                "entity",
                "BucketInStatus"
            ]
        },
        {
            "def": {
                "sequence": {
                    "type": 3
                }
            }
        },
        {
            "def": {
                "primitive": "u64"
            }
        },
        {
            "def": {
                "variant": {
                    "variants": [
                        {
                            "discriminant": 0,
                            "name": "BucketDoesNotExist"
                        },
                        {
                            "discriminant": 1,
                            "name": "ClusterDoesNotExist"
                        },
                        {
                            "discriminant": 2,
                            "name": "TooManyVNodes"
                        },
                        {
                            "discriminant": 3,
                            "name": "ParamsTooBig"
                        },
                        {
                            "discriminant": 4,
                            "name": "VNodeDoesNotExist"
                        },
                        {
                            "discriminant": 5,
                            "name": "BucketClusterAlreadyConnected"
                        },
                        {
                            "discriminant": 6,
                            "name": "BucketClusterNotSetup"
                        },
                        {
                            "discriminant": 7,
                            "name": "NodeDoesNotExist"
                        },
                        {
                            "discriminant": 8,
                            "name": "FlowDoesNotExist"
                        },
                        {
                            "discriminant": 9,
                            "name": "AccountDoesNotExist"
                        },
                        {
                            "discriminant": 10,
                            "name": "ParamsDoesNotExist"
                        },
                        {
                            "discriminant": 11,
                            "name": "UnauthorizedProvider"
                        },
                        {
                            "discriminant": 12,
                            "name": "UnauthorizedOwner"
                        },
                        {
                            "discriminant": 13,
                            "name": "UnauthorizedClusterManager"
                        },
                        {
                            "discriminant": 14,
                            "name": "ClusterManagerIsNotTrusted"
                        },
                        {
                            "discriminant": 15,
                            "name": "TransferFailed"
                        },
                        {
                            "discriminant": 16,
                            "name": "InsufficientBalance"
                        },
                        {
                            "discriminant": 17,
                            "name": "InsufficientResources"
                        },
                        {
                            "discriminant": 18,
                            "name": "Unauthorized"
                        }
                    ]
                }
            },
            "path": [
                "ddc_bucket",
                "ddc_bucket",
                "Error"
            ]
        },
        {
            "def": {
                "variant": {
                    "variants": [
                        {
                            "name": "None"
                        },
                        {
                            "fields": [
                                {
                                    "type": 3,
                                    "typeName": "T"
                                }
                            ],
                            "name": "Some"
                        }
                    ]
                }
            },
            "params": [
                3
            ],
            "path": [
                "Option"
            ]
        },
        {
            "def": {
                "tuple": [
                    32,
                    1
                ]
            }
        },
        {
            "def": {
                "sequence": {
                    "type": 25
                }
            }
        },
        {
            "def": {
                "variant": {
                    "variants": [
                        {
                            "fields": [
                                {
                                    "type": 34,
                                    "typeName": "T"
                                }
                            ],
                            "name": "Ok"
                        },
                        {
                            "fields": [
                                {
                                    "type": 29,
                                    "typeName": "E"
                                }
                            ],
                            "name": "Err"
                        }
                    ]
                }
            },
            "params": [
                34,
                29
            ],
            "path": [
                "Result"
            ]
        },
        {
            "def": {
                "composite": {
                    "fields": [
                        {
                            "name": "cluster_id",
                            "type": 1,
                            "typeName": "ClusterId"
                        },
                        {
                            "name": "cluster",
                            "type": 10,
                            "typeName": "Cluster"
                        },
                        {
                            "name": "params",
                            "type": 9,
                            "typeName": "Params"
                        }
                    ]
                }
            },
            "path": [
                "ddc_bucket",
                "ddc_bucket",
                "cluster",
                "entity",
                "ClusterStatus"
            ]
        },
        {
            "def": {
                "tuple": [
                    36,
                    1
                ]
            }
        },
        {
            "def": {
                "sequence": {
                    "type": 34
                }
            }
        },
        {
            "def": {
                "variant": {
                    "variants": [
                        {
                            "fields": [
                                {
                                    "type": 38,
                                    "typeName": "T"
                                }
                            ],
                            "name": "Ok"
                        },
                        {
                            "fields": [
                                {
                                    "type": 29,
                                    "typeName": "E"
                                }
                            ],
                            "name": "Err"
                        }
                    ]
                }
            },
            "params": [
                38,
                29
            ],
            "path": [
                "Result"
            ]
        },
        {
            "def": {
                "composite": {
                    "fields": [
                        {
                            "name": "node_id",
                            "type": 1,
                            "typeName": "NodeId"
                        },
                        {
                            "name": "node",
                            "type": 13,
                            "typeName": "Node"
                        },
                        {
                            "name": "params",
                            "type": 9,
                            "typeName": "Params"
                        }
                    ]
                }
            },
            "path": [
                "ddc_bucket",
                "ddc_bucket",
                "node",
                "entity",
                "NodeStatus"
            ]
        },
        {
            "def": {
                "tuple": [
                    40,
                    1
                ]
            }
        },
        {
            "def": {
                "sequence": {
                    "type": 38
                }
            }
        },
        {
            "def": {
                "variant": {
                    "variants": [
                        {
                            "fields": [
                                {
                                    "type": 18,
                                    "typeName": "T"
                                }
                            ],
                            "name": "Ok"
                        },
                        {
                            "fields": [
                                {
                                    "type": 29,
                                    "typeName": "E"
                                }
                            ],
                            "name": "Err"
                        }
                    ]
                }
            },
            "params": [
                18,
                29
            ],
            "path": [
                "Result"
            ]
        },
        {
            "def": {
                "variant": {
                    "variants": [
                        {
                            "fields": [
                                {
                                    "type": 3,
                                    "typeName": "AccountId"
                                }
                            ],
                            "name": "ManagerTrustedBy"
                        },
                        {
                            "name": "SetExchangeRate"
                        },
                        {
                            "name": "SuperAdmin"
                        }
                    ]
                }
            },
            "path": [
                "ddc_bucket",
                "ddc_bucket",
                "perm",
                "entity",
                "Permission"
            ]
        }
    ]
}