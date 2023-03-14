export const ddcBucketAbi = {
    'metadataVersion': '0.1.0',
    'source': {
        'hash': '0xb639456298d0d5533161e76257f09259a7bd49e9e48db5a3d9f8d0d854491d11',
        'language': 'ink! 3.0.0-rc4',
        'compiler': 'rustc 1.70.0-nightly',
    },
    'contract': {
        'name': 'ddc_bucket',
        'version': '0.5.2',
        'authors': [
            'Aurélien Nicolas <aurel@cere.network>',
        ],
        'description': 'DDC v2 Smart Contracts -- Orchestrate the network around clusters and buckets',
        'license': 'Apache-2.0',
    },
    'spec': {
        'constructors': [
            {
                'args': [],
                'docs': [
                    'Create a new contract.',
                    '',
                    'The caller will be admin of the contract.',
                ],
                'name': [
                    'new',
                ],
                'selector': '0x9bae9d5e',
            },
        ],
        'docs': [],
        'events': [
            {
                'args': [
                    {
                        'docs': [],
                        'indexed': true,
                        'name': 'bucket_id',
                        'type': {
                            'displayName': [
                                'BucketId',
                            ],
                            'type': 1,
                        },
                    },
                    {
                        'docs': [],
                        'indexed': true,
                        'name': 'owner_id',
                        'type': {
                            'displayName': [
                                'AccountId',
                            ],
                            'type': 3,
                        },
                    },
                ],
                'docs': [
                    ' A bucket was created. The given account is its first owner and payer of resources.',
                ],
                'name': 'BucketCreated',
            },
            {
                'args': [
                    {
                        'docs': [],
                        'indexed': true,
                        'name': 'bucket_id',
                        'type': {
                            'displayName': [
                                'BucketId',
                            ],
                            'type': 1,
                        },
                    },
                    {
                        'docs': [],
                        'indexed': true,
                        'name': 'cluster_id',
                        'type': {
                            'displayName': [
                                'ClusterId',
                            ],
                            'type': 1,
                        },
                    },
                    {
                        'docs': [],
                        'indexed': false,
                        'name': 'resource',
                        'type': {
                            'displayName': [
                                'Resource',
                            ],
                            'type': 1,
                        },
                    },
                ],
                'docs': [
                    ' Some amount of resources of a cluster were allocated to a bucket.',
                ],
                'name': 'BucketAllocated',
            },
            {
                'args': [
                    {
                        'docs': [],
                        'indexed': true,
                        'name': 'bucket_id',
                        'type': {
                            'displayName': [
                                'BucketId',
                            ],
                            'type': 1,
                        },
                    },
                    {
                        'docs': [],
                        'indexed': true,
                        'name': 'cluster_id',
                        'type': {
                            'displayName': [
                                'ClusterId',
                            ],
                            'type': 1,
                        },
                    },
                ],
                'docs': [
                    ' The due costs of a bucket was settled from the bucket payer to the cluster.',
                ],
                'name': 'BucketSettlePayment',
            },
            {
                'args': [
                    {
                        'docs': [],
                        'indexed': true,
                        'name': 'cluster_id',
                        'type': {
                            'displayName': [
                                'ClusterId',
                            ],
                            'type': 1,
                        },
                    },
                    {
                        'docs': [],
                        'indexed': true,
                        'name': 'manager',
                        'type': {
                            'displayName': [
                                'AccountId',
                            ],
                            'type': 3,
                        },
                    },
                    {
                        'docs': [],
                        'indexed': false,
                        'name': 'cluster_params',
                        'type': {
                            'displayName': [
                                'ClusterParams',
                            ],
                            'type': 15,
                        },
                    },
                ],
                'docs': [
                    ' A new cluster was created.',
                ],
                'name': 'ClusterCreated',
            },
            {
                'args': [
                    {
                        'docs': [],
                        'indexed': true,
                        'name': 'cluster_id',
                        'type': {
                            'displayName': [
                                'ClusterId',
                            ],
                            'type': 1,
                        },
                    },
                    {
                        'docs': [],
                        'indexed': true,
                        'name': 'node_id',
                        'type': {
                            'displayName': [
                                'NodeId',
                            ],
                            'type': 1,
                        },
                    },
                ],
                'docs': [
                    ' A vnode was re-assigned to new node.',
                ],
                'name': 'ClusterNodeReplaced',
            },
            {
                'args': [
                    {
                        'docs': [],
                        'indexed': true,
                        'name': 'cluster_id',
                        'type': {
                            'displayName': [
                                'ClusterId',
                            ],
                            'type': 1,
                        },
                    },
                    {
                        'docs': [],
                        'indexed': false,
                        'name': 'resource',
                        'type': {
                            'displayName': [
                                'Resource',
                            ],
                            'type': 1,
                        },
                    },
                ],
                'docs': [
                    ' Some resources were reserved for the cluster from the nodes.',
                ],
                'name': 'ClusterReserveResource',
            },
            {
                'args': [
                    {
                        'docs': [],
                        'indexed': true,
                        'name': 'cluster_id',
                        'type': {
                            'displayName': [
                                'ClusterId',
                            ],
                            'type': 1,
                        },
                    },
                    {
                        'docs': [],
                        'indexed': true,
                        'name': 'provider_id',
                        'type': {
                            'displayName': [
                                'AccountId',
                            ],
                            'type': 3,
                        },
                    },
                ],
                'docs': [
                    ' The share of revenues of a cluster for a provider was distributed.',
                ],
                'name': 'ClusterDistributeRevenues',
            },
            {
                'args': [
                    {
                        'docs': [],
                        'indexed': true,
                        'name': 'cluster_id',
                        'type': {
                            'displayName': [
                                'ClusterId',
                            ],
                            'type': 1,
                        },
                    },
                    {
                        'docs': [],
                        'indexed': true,
                        'name': 'manager',
                        'type': {
                            'displayName': [
                                'AccountId',
                            ],
                            'type': 3,
                        },
                    },
                ],
                'docs': [
                    ' A new cluster was created.',
                ],
                'name': 'CdnClusterCreated',
            },
            {
                'args': [
                    {
                        'docs': [],
                        'indexed': true,
                        'name': 'cluster_id',
                        'type': {
                            'displayName': [
                                'ClusterId',
                            ],
                            'type': 1,
                        },
                    },
                    {
                        'docs': [],
                        'indexed': true,
                        'name': 'provider_id',
                        'type': {
                            'displayName': [
                                'AccountId',
                            ],
                            'type': 3,
                        },
                    },
                ],
                'docs': [
                    ' The respective share of revenues of a CDN cluster for a provider was distributed.',
                ],
                'name': 'CdnClusterDistributeRevenues',
            },
            {
                'args': [
                    {
                        'docs': [],
                        'indexed': true,
                        'name': 'node_id',
                        'type': {
                            'displayName': [
                                'NodeId',
                            ],
                            'type': 1,
                        },
                    },
                    {
                        'docs': [],
                        'indexed': true,
                        'name': 'provider_id',
                        'type': {
                            'displayName': [
                                'AccountId',
                            ],
                            'type': 3,
                        },
                    },
                    {
                        'docs': [],
                        'indexed': false,
                        'name': 'undistributed_payment',
                        'type': {
                            'displayName': [
                                'Balance',
                            ],
                            'type': 8,
                        },
                    },
                ],
                'docs': [
                    ' A node was created. The given account is its owner and recipient of revenues.',
                ],
                'name': 'CdnNodeCreated',
            },
            {
                'args': [
                    {
                        'docs': [],
                        'indexed': true,
                        'name': 'node_id',
                        'type': {
                            'displayName': [
                                'NodeId',
                            ],
                            'type': 1,
                        },
                    },
                    {
                        'docs': [],
                        'indexed': true,
                        'name': 'provider_id',
                        'type': {
                            'displayName': [
                                'AccountId',
                            ],
                            'type': 3,
                        },
                    },
                    {
                        'docs': [],
                        'indexed': false,
                        'name': 'rent_per_month',
                        'type': {
                            'displayName': [
                                'Balance',
                            ],
                            'type': 8,
                        },
                    },
                    {
                        'docs': [],
                        'indexed': false,
                        'name': 'node_params',
                        'type': {
                            'displayName': [
                                'NodeParams',
                            ],
                            'type': 15,
                        },
                    },
                ],
                'docs': [
                    ' A node was created. The given account is its owner and recipient of revenues.',
                ],
                'name': 'NodeCreated',
            },
            {
                'args': [
                    {
                        'docs': [],
                        'indexed': true,
                        'name': 'account_id',
                        'type': {
                            'displayName': [
                                'AccountId',
                            ],
                            'type': 3,
                        },
                    },
                    {
                        'docs': [],
                        'indexed': false,
                        'name': 'value',
                        'type': {
                            'displayName': [
                                'Balance',
                            ],
                            'type': 8,
                        },
                    },
                ],
                'docs': [
                    ' Tokens were deposited on an account.',
                ],
                'name': 'Deposit',
            },
            {
                'args': [
                    {
                        'docs': [],
                        'indexed': true,
                        'name': 'account_id',
                        'type': {
                            'displayName': [
                                'AccountId',
                            ],
                            'type': 3,
                        },
                    },
                    {
                        'docs': [],
                        'indexed': false,
                        'name': 'permission',
                        'type': {
                            'displayName': [
                                'Permission',
                            ],
                            'type': 78,
                        },
                    },
                ],
                'docs': [
                    ' A permission was granted to the account.',
                ],
                'name': 'GrantPermission',
            },
            {
                'args': [
                    {
                        'docs': [],
                        'indexed': true,
                        'name': 'account_id',
                        'type': {
                            'displayName': [
                                'AccountId',
                            ],
                            'type': 3,
                        },
                    },
                    {
                        'docs': [],
                        'indexed': false,
                        'name': 'permission',
                        'type': {
                            'displayName': [
                                'Permission',
                            ],
                            'type': 78,
                        },
                    },
                ],
                'docs': [
                    ' A permission was revoked from the account.',
                ],
                'name': 'RevokePermission',
            },
        ],
        'messages': [
            {
                'args': [
                    {
                        'name': 'bucket_params',
                        'type': {
                            'displayName': [
                                'BucketParams',
                            ],
                            'type': 15,
                        },
                    },
                    {
                        'name': 'cluster_id',
                        'type': {
                            'displayName': [
                                'ClusterId',
                            ],
                            'type': 1,
                        },
                    },
                    {
                        'name': 'owner_id',
                        'type': {
                            'displayName': [
                                'Option',
                            ],
                            'type': 43,
                        },
                    },
                ],
                'docs': [
                    ' Create a new bucket and return its `bucket_id`.',
                    '',
                    ' The caller will be its first owner and payer of resources.',
                    '',
                    ' `bucket_params` is configuration used by clients and nodes. See the [data structure of BucketParams](https://docs.cere.network/ddc/protocols/contract-params-schema)',
                    '',
                    ' The bucket can be connected to a single cluster (currently). Allocate cluster resources with the function `bucket_alloc_into_cluster`',
                ],
                'mutates': true,
                'name': [
                    'bucket_create',
                ],
                'payable': true,
                'returnType': {
                    'displayName': [
                        'BucketId',
                    ],
                    'type': 1,
                },
                'selector': '0x0aeb2379',
            },
            {
                'args': [
                    {
                        'name': 'bucket_id',
                        'type': {
                            'displayName': [
                                'BucketId',
                            ],
                            'type': 1,
                        },
                    },
                    {
                        'name': 'owner_id',
                        'type': {
                            'displayName': [
                                'AccountId',
                            ],
                            'type': 3,
                        },
                    },
                ],
                'docs': [
                    ' Change owner of the bucket',
                    '',
                    ' Provide the account of new owner',
                ],
                'mutates': true,
                'name': [
                    'bucket_change_owner',
                ],
                'payable': true,
                'returnType': {
                    'displayName': [],
                    'type': 44,
                },
                'selector': '0xc7d0c2cd',
            },
            {
                'args': [
                    {
                        'name': 'bucket_id',
                        'type': {
                            'displayName': [
                                'BucketId',
                            ],
                            'type': 1,
                        },
                    },
                    {
                        'name': 'resource',
                        'type': {
                            'displayName': [
                                'Resource',
                            ],
                            'type': 1,
                        },
                    },
                ],
                'docs': [
                    ' Allocate some resources of a cluster to a bucket.',
                    '',
                    ' The amount of resources is given per vnode (total resources will be `resource` times the number of vnodes).',
                ],
                'mutates': true,
                'name': [
                    'bucket_alloc_into_cluster',
                ],
                'payable': false,
                'returnType': {
                    'displayName': [],
                    'type': 44,
                },
                'selector': '0x4c482d19',
            },
            {
                'args': [
                    {
                        'name': 'bucket_id',
                        'type': {
                            'displayName': [
                                'BucketId',
                            ],
                            'type': 1,
                        },
                    },
                ],
                'docs': [
                    ' Settle the due costs of a bucket from its payer account to the cluster account.',
                ],
                'mutates': true,
                'name': [
                    'bucket_settle_payment',
                ],
                'payable': false,
                'returnType': null,
                'selector': '0x15974555',
            },
            {
                'args': [
                    {
                        'name': 'bucket_id',
                        'type': {
                            'displayName': [
                                'BucketId',
                            ],
                            'type': 1,
                        },
                    },
                    {
                        'name': 'params',
                        'type': {
                            'displayName': [
                                'BucketParams',
                            ],
                            'type': 15,
                        },
                    },
                ],
                'docs': [
                    ' Change the `bucket_params`, which is configuration used by clients and nodes.',
                    '',
                    ' See the [data structure of BucketParams](https://docs.cere.network/ddc/protocols/contract-params-schema)',
                ],
                'mutates': true,
                'name': [
                    'bucket_change_params',
                ],
                'payable': true,
                'returnType': null,
                'selector': '0x9f2d075b',
            },
            {
                'args': [
                    {
                        'name': 'bucket_id',
                        'type': {
                            'displayName': [
                                'BucketId',
                            ],
                            'type': 1,
                        },
                    },
                ],
                'docs': [
                    ' Get the current status of a bucket.',
                ],
                'mutates': false,
                'name': [
                    'bucket_get',
                ],
                'payable': false,
                'returnType': {
                    'displayName': [
                        'Result',
                    ],
                    'type': 45,
                },
                'selector': '0x3802cb77',
            },
            {
                'args': [
                    {
                        'name': 'offset',
                        'type': {
                            'displayName': [
                                'u32',
                            ],
                            'type': 1,
                        },
                    },
                    {
                        'name': 'limit',
                        'type': {
                            'displayName': [
                                'u32',
                            ],
                            'type': 1,
                        },
                    },
                    {
                        'name': 'filter_owner_id',
                        'type': {
                            'displayName': [
                                'Option',
                            ],
                            'type': 43,
                        },
                    },
                ],
                'docs': [
                    ' Iterate through all buckets.',
                    '',
                    ' The algorithm for paging is: start with `offset = 1` and `limit = 20`. The function returns a `(results, max_id)`. Call again with `offset += limit`, until `offset >= max_id`.',
                    ' The optimal `limit` depends on the size of params.',
                    '',
                    ' The results can be filtered by owner. Note that paging must still be completed fully.',
                ],
                'mutates': false,
                'name': [
                    'bucket_list',
                ],
                'payable': false,
                'returnType': {
                    'displayName': [],
                    'type': 49,
                },
                'selector': '0x417ab584',
            },
            {
                'args': [
                    {
                        'name': 'owner_id',
                        'type': {
                            'displayName': [
                                'AccountId',
                            ],
                            'type': 3,
                        },
                    },
                ],
                'docs': [
                    ' Iterate through all buckets and return only those owned by owner',
                    '',
                    ' This method returns bucket struct, not the status',
                ],
                'mutates': false,
                'name': [
                    'bucket_list_for_account',
                ],
                'payable': false,
                'returnType': {
                    'displayName': [
                        'Vec',
                    ],
                    'type': 51,
                },
                'selector': '0xc434cf57',
            },
            {
                'args': [
                    {
                        'name': 'bucket_id',
                        'type': {
                            'displayName': [
                                'BucketId',
                            ],
                            'type': 1,
                        },
                    },
                    {
                        'name': 'public_availability',
                        'type': {
                            'displayName': [
                                'bool',
                            ],
                            'type': 9,
                        },
                    },
                ],
                'docs': [
                    ' Set availiablity of the bucket',
                ],
                'mutates': true,
                'name': [
                    'bucket_set_availability',
                ],
                'payable': false,
                'returnType': {
                    'displayName': [],
                    'type': 44,
                },
                'selector': '0x053eb3ce',
            },
            {
                'args': [
                    {
                        'name': 'bucket_id',
                        'type': {
                            'displayName': [
                                'BucketId',
                            ],
                            'type': 1,
                        },
                    },
                    {
                        'name': 'new_resource_cap',
                        'type': {
                            'displayName': [
                                'Resource',
                            ],
                            'type': 1,
                        },
                    },
                ],
                'docs': [
                    ' Set max resource cap to be charged by CDN for public bucket',
                ],
                'mutates': true,
                'name': [
                    'bucket_set_resource_cap',
                ],
                'payable': false,
                'returnType': {
                    'displayName': [],
                    'type': 44,
                },
                'selector': '0x85010c6d',
            },
            {
                'args': [
                    {
                        'name': 'bucket_id',
                        'type': {
                            'displayName': [
                                'BucketId',
                            ],
                            'type': 1,
                        },
                    },
                ],
                'docs': [
                    ' Set permission for the reader of the bucket',
                ],
                'mutates': true,
                'name': [
                    'get_bucket_writers',
                ],
                'payable': false,
                'returnType': {
                    'displayName': [
                        'Vec',
                    ],
                    'type': 14,
                },
                'selector': '0x499cd4b7',
            },
            {
                'args': [
                    {
                        'name': 'bucket_id',
                        'type': {
                            'displayName': [
                                'BucketId',
                            ],
                            'type': 1,
                        },
                    },
                    {
                        'name': 'writer',
                        'type': {
                            'displayName': [
                                'AccountId',
                            ],
                            'type': 3,
                        },
                    },
                ],
                'docs': [
                    ' Set permission for the writer of the bucket',
                ],
                'mutates': true,
                'name': [
                    'bucket_set_writer_perm',
                ],
                'payable': false,
                'returnType': {
                    'displayName': [],
                    'type': 44,
                },
                'selector': '0xea2e477a',
            },
            {
                'args': [
                    {
                        'name': 'bucket_id',
                        'type': {
                            'displayName': [
                                'BucketId',
                            ],
                            'type': 1,
                        },
                    },
                    {
                        'name': 'writer',
                        'type': {
                            'displayName': [
                                'AccountId',
                            ],
                            'type': 3,
                        },
                    },
                ],
                'docs': [
                    ' Revoke permission for the writer of the bucket',
                ],
                'mutates': true,
                'name': [
                    'bucket_revoke_writer_perm',
                ],
                'payable': false,
                'returnType': {
                    'displayName': [],
                    'type': 44,
                },
                'selector': '0x2b3d8dd1',
            },
            {
                'args': [
                    {
                        'name': 'bucket_id',
                        'type': {
                            'displayName': [
                                'BucketId',
                            ],
                            'type': 1,
                        },
                    },
                ],
                'docs': [
                    ' Set permission for the reader of the bucket',
                ],
                'mutates': true,
                'name': [
                    'get_bucket_readers',
                ],
                'payable': false,
                'returnType': {
                    'displayName': [
                        'Vec',
                    ],
                    'type': 14,
                },
                'selector': '0xb9a7cc1c',
            },
            {
                'args': [
                    {
                        'name': 'bucket_id',
                        'type': {
                            'displayName': [
                                'BucketId',
                            ],
                            'type': 1,
                        },
                    },
                    {
                        'name': 'reader',
                        'type': {
                            'displayName': [
                                'AccountId',
                            ],
                            'type': 3,
                        },
                    },
                ],
                'docs': [
                    ' Set permission for the reader of the bucket',
                ],
                'mutates': true,
                'name': [
                    'bucket_set_reader_perm',
                ],
                'payable': false,
                'returnType': {
                    'displayName': [],
                    'type': 44,
                },
                'selector': '0xfc0e94ea',
            },
            {
                'args': [
                    {
                        'name': 'bucket_id',
                        'type': {
                            'displayName': [
                                'BucketId',
                            ],
                            'type': 1,
                        },
                    },
                    {
                        'name': 'writer',
                        'type': {
                            'displayName': [
                                'AccountId',
                            ],
                            'type': 3,
                        },
                    },
                ],
                'docs': [
                    ' Revoke permission for the reader of the bucket',
                ],
                'mutates': true,
                'name': [
                    'bucket_revoke_reader_perm',
                ],
                'payable': false,
                'returnType': {
                    'displayName': [],
                    'type': 44,
                },
                'selector': '0xe9bfed5a',
            },
            {
                'args': [
                    {
                        'name': 'cluster_id',
                        'type': {
                            'displayName': [
                                'ClusterId',
                            ],
                            'type': 1,
                        },
                    },
                    {
                        'name': 'node_ids',
                        'type': {
                            'displayName': [
                                'Vec',
                            ],
                            'type': 19,
                        },
                    },
                    {
                        'name': 'v_nodes',
                        'type': {
                            'displayName': [
                                'Vec',
                            ],
                            'type': 20,
                        },
                    },
                ],
                'docs': [
                    ' Removes a node to an existing cluster',
                    '',
                    ' The caller will be its first manager.',
                ],
                'mutates': true,
                'name': [
                    'cluster_remove_node',
                ],
                'payable': true,
                'returnType': null,
                'selector': '0x793e0778',
            },
            {
                'args': [
                    {
                        'name': 'cluster_id',
                        'type': {
                            'displayName': [
                                'ClusterId',
                            ],
                            'type': 1,
                        },
                    },
                    {
                        'name': 'node_ids',
                        'type': {
                            'displayName': [
                                'Vec',
                            ],
                            'type': 19,
                        },
                    },
                    {
                        'name': 'v_nodes',
                        'type': {
                            'displayName': [
                                'Vec',
                            ],
                            'type': 20,
                        },
                    },
                ],
                'docs': [
                    ' Adds node to an existing cluster',
                    '',
                    ' The caller will be its first manager.',
                ],
                'mutates': true,
                'name': [
                    'cluster_add_node',
                ],
                'payable': true,
                'returnType': null,
                'selector': '0xf7496bdc',
            },
            {
                'args': [
                    {
                        'name': '_unused',
                        'type': {
                            'displayName': [
                                'AccountId',
                            ],
                            'type': 3,
                        },
                    },
                    {
                        'name': 'v_nodes',
                        'type': {
                            'displayName': [
                                'Vec',
                            ],
                            'type': 20,
                        },
                    },
                    {
                        'name': 'node_ids',
                        'type': {
                            'displayName': [
                                'Vec',
                            ],
                            'type': 19,
                        },
                    },
                    {
                        'name': 'cluster_params',
                        'type': {
                            'displayName': [
                                'ClusterParams',
                            ],
                            'type': 15,
                        },
                    },
                ],
                'docs': [
                    ' Create a new cluster and return its `cluster_id`.',
                    '',
                    ' The caller will be its first manager.',
                    '',
                    ' The cluster is split in a number of vnodes. The vnodes are assigned to the given physical nodes in a round-robin. Only nodes of providers that trust the cluster manager can be used (see `node_trust_manager`). The assignment can be changed with the function `cluster_replace_node`.',
                    '',
                    ' `cluster_params` is configuration used by clients and nodes. In particular, this describes the semantics of vnodes. See the [data structure of ClusterParams](https://docs.cere.network/ddc/protocols/contract-params-schema)',
                ],
                'mutates': true,
                'name': [
                    'cluster_create',
                ],
                'payable': true,
                'returnType': {
                    'displayName': [
                        'ClusterId',
                    ],
                    'type': 1,
                },
                'selector': '0x4c0f21f6',
            },
            {
                'args': [
                    {
                        'name': 'cluster_id',
                        'type': {
                            'displayName': [
                                'ClusterId',
                            ],
                            'type': 1,
                        },
                    },
                    {
                        'name': 'amount',
                        'type': {
                            'displayName': [
                                'Resource',
                            ],
                            'type': 1,
                        },
                    },
                ],
                'docs': [
                    ' As manager, reserve more resources for the cluster from the free capacity of nodes.',
                    '',
                    ' The amount of resources is given per vnode (total resources will be `resource` times the number of vnodes).',
                ],
                'mutates': true,
                'name': [
                    'cluster_reserve_resource',
                ],
                'payable': false,
                'returnType': {
                    'displayName': [],
                    'type': 44,
                },
                'selector': '0xb5e38125',
            },
            {
                'args': [
                    {
                        'name': 'node_id',
                        'type': {
                            'displayName': [
                                'NodeId',
                            ],
                            'type': 1,
                        },
                    },
                    {
                        'name': 'new_tag',
                        'type': {
                            'displayName': [
                                'NodeTag',
                            ],
                            'type': 26,
                        },
                    },
                ],
                'docs': [
                    ' As manager, change a node tag',
                ],
                'mutates': true,
                'name': [
                    'cluster_change_node_tag',
                ],
                'payable': false,
                'returnType': {
                    'displayName': [],
                    'type': 44,
                },
                'selector': '0x9640d48e',
            },
            {
                'args': [
                    {
                        'name': 'cluster_id',
                        'type': {
                            'displayName': [
                                'ClusterId',
                            ],
                            'type': 1,
                        },
                    },
                    {
                        'name': 'v_nodes',
                        'type': {
                            'displayName': [
                                'Vec',
                            ],
                            'type': 21,
                        },
                    },
                    {
                        'name': 'new_node_id',
                        'type': {
                            'displayName': [
                                'NodeId',
                            ],
                            'type': 1,
                        },
                    },
                ],
                'docs': [
                    ' As manager, re-assign a vnode to another physical node.',
                    '',
                    ' The cluster manager can only use nodes of providers that trust him (see `node_trust_manager`), or any nodes if he is also SuperAdmin.',
                ],
                'mutates': true,
                'name': [
                    'cluster_replace_node',
                ],
                'payable': false,
                'returnType': {
                    'displayName': [],
                    'type': 44,
                },
                'selector': '0x48194ab1',
            },
            {
                'args': [
                    {
                        'name': 'cluster_id',
                        'type': {
                            'displayName': [
                                'ClusterId',
                            ],
                            'type': 1,
                        },
                    },
                ],
                'docs': [
                    ' Trigger the distribution of revenues from the cluster to the providers.',
                ],
                'mutates': true,
                'name': [
                    'cluster_distribute_revenues',
                ],
                'payable': false,
                'returnType': null,
                'selector': '0xe71e66fc',
            },
            {
                'args': [
                    {
                        'name': 'cluster_id',
                        'type': {
                            'displayName': [
                                'ClusterId',
                            ],
                            'type': 1,
                        },
                    },
                    {
                        'name': 'params',
                        'type': {
                            'displayName': [
                                'ClusterParams',
                            ],
                            'type': 15,
                        },
                    },
                ],
                'docs': [
                    ' Change the `cluster_params`, which is configuration used by clients and nodes.',
                    '',
                    ' See the [data structure of ClusterParams](https://docs.cere.network/ddc/protocols/contract-params-schema)',
                ],
                'mutates': true,
                'name': [
                    'cluster_change_params',
                ],
                'payable': true,
                'returnType': null,
                'selector': '0x1207912c',
            },
            {
                'args': [
                    {
                        'name': 'cluster_id',
                        'type': {
                            'displayName': [
                                'ClusterId',
                            ],
                            'type': 1,
                        },
                    },
                ],
                'docs': [
                    ' Get the current status of a cluster.',
                ],
                'mutates': false,
                'name': [
                    'cluster_get',
                ],
                'payable': false,
                'returnType': {
                    'displayName': [
                        'Result',
                    ],
                    'type': 52,
                },
                'selector': '0xe75411f5',
            },
            {
                'args': [
                    {
                        'name': 'offset',
                        'type': {
                            'displayName': [
                                'u32',
                            ],
                            'type': 1,
                        },
                    },
                    {
                        'name': 'limit',
                        'type': {
                            'displayName': [
                                'u32',
                            ],
                            'type': 1,
                        },
                    },
                    {
                        'name': 'filter_manager_id',
                        'type': {
                            'displayName': [
                                'Option',
                            ],
                            'type': 43,
                        },
                    },
                ],
                'docs': [
                    ' Iterate through all clusters.',
                    '',
                    ' The algorithm for paging is: start with `offset = 1` and `limit = 20`. The function returns a `(results, max_id)`. Call again with `offset += limit`, until `offset >= max_id`.',
                    ' The optimal `limit` depends on the size of params.',
                    '',
                    ' The results can be filtered by manager. Note that paging must still be completed fully.',
                ],
                'mutates': false,
                'name': [
                    'cluster_list',
                ],
                'payable': false,
                'returnType': {
                    'displayName': [],
                    'type': 54,
                },
                'selector': '0xd9db9d44',
            },
            {
                'args': [
                    {
                        'name': 'cdn_node_ids',
                        'type': {
                            'displayName': [
                                'Vec',
                            ],
                            'type': 19,
                        },
                    },
                ],
                'docs': [
                    ' Create a new cluster and return its `cluster_id`.',
                    '',
                    ' The caller will be its first manager.',
                    '',
                    ' The CDN node ids are provided, which will form a cluster.',
                ],
                'mutates': true,
                'name': [
                    'cdn_cluster_create',
                ],
                'payable': true,
                'returnType': {
                    'displayName': [
                        'ClusterId',
                    ],
                    'type': 1,
                },
                'selector': '0x4344cd7e',
            },
            {
                'args': [
                    {
                        'name': 'cluster_id',
                        'type': {
                            'displayName': [
                                'ClusterId',
                            ],
                            'type': 1,
                        },
                    },
                    {
                        'name': 'usd_per_gb',
                        'type': {
                            'displayName': [
                                'Balance',
                            ],
                            'type': 8,
                        },
                    },
                ],
                'docs': [
                    ' Set rate for streaming (price per gb)',
                ],
                'mutates': true,
                'name': [
                    'cdn_set_rate',
                ],
                'payable': true,
                'returnType': {
                    'displayName': [],
                    'type': 44,
                },
                'selector': '0x7578922a',
            },
            {
                'args': [
                    {
                        'name': 'cluster_id',
                        'type': {
                            'displayName': [
                                'ClusterId',
                            ],
                            'type': 1,
                        },
                    },
                ],
                'docs': [
                    ' Get rate for streaming (price per gb)',
                ],
                'mutates': false,
                'name': [
                    'cdn_get_rate',
                ],
                'payable': true,
                'returnType': {
                    'displayName': [
                        'Balance',
                    ],
                    'type': 8,
                },
                'selector': '0xa1e3ea8a',
            },
            {
                'args': [
                    {
                        'name': 'cluster_id',
                        'type': {
                            'displayName': [
                                'ClusterId',
                            ],
                            'type': 1,
                        },
                    },
                    {
                        'name': 'aggregates_accounts',
                        'type': {
                            'displayName': [
                                'Vec',
                            ],
                            'type': 56,
                        },
                    },
                    {
                        'name': 'aggregates_nodes',
                        'type': {
                            'displayName': [
                                'Vec',
                            ],
                            'type': 58,
                        },
                    },
                    {
                        'name': 'aggregates_buckets',
                        'type': {
                            'displayName': [
                                'Vec',
                            ],
                            'type': 60,
                        },
                    },
                    {
                        'name': 'era',
                        'type': {
                            'displayName': [
                                'u64',
                            ],
                            'type': 22,
                        },
                    },
                ],
                'docs': [
                    ' As validator, charge payments from users and allocate undistributed payments to CDN nodes.',
                    '',
                    ' As a result CDN cluster revenue increases, which can be distributed between CDN node providers via method cdn_cluster_distribute_revenues.',
                ],
                'mutates': true,
                'name': [
                    'cdn_cluster_put_revenue',
                ],
                'payable': false,
                'returnType': {
                    'displayName': [],
                    'type': 44,
                },
                'selector': '0x7219be3f',
            },
            {
                'args': [
                    {
                        'name': 'cluster_id',
                        'type': {
                            'displayName': [
                                'ClusterId',
                            ],
                            'type': 1,
                        },
                    },
                ],
                'docs': [
                    ' Trigger the distribution of revenues from the cluster to the CDN node providers.',
                    '',
                    ' Anyone can call this method.',
                    '',
                    ' Undistributed payments will be trasnferred, CDN cluster revenue will decrease.',
                ],
                'mutates': true,
                'name': [
                    'cdn_cluster_distribute_revenues',
                ],
                'payable': false,
                'returnType': null,
                'selector': '0xfa8d570d',
            },
            {
                'args': [
                    {
                        'name': 'cluster_id',
                        'type': {
                            'displayName': [
                                'ClusterId',
                            ],
                            'type': 1,
                        },
                    },
                ],
                'docs': [
                    ' Get the current status of a cluster.',
                ],
                'mutates': false,
                'name': [
                    'cdn_cluster_get',
                ],
                'payable': false,
                'returnType': {
                    'displayName': [
                        'Result',
                    ],
                    'type': 62,
                },
                'selector': '0x4b22fbf1',
            },
            {
                'args': [
                    {
                        'name': 'offset',
                        'type': {
                            'displayName': [
                                'u32',
                            ],
                            'type': 1,
                        },
                    },
                    {
                        'name': 'limit',
                        'type': {
                            'displayName': [
                                'u32',
                            ],
                            'type': 1,
                        },
                    },
                    {
                        'name': 'filter_manager_id',
                        'type': {
                            'displayName': [
                                'Option',
                            ],
                            'type': 43,
                        },
                    },
                ],
                'docs': [
                    ' Iterate through all clusters.',
                    '',
                    ' The algorithm for paging is: start with `offset = 1` and `limit = 20`. The function returns a `(results, max_id)`. Call again with `offset += limit`, until `offset >= max_id`.',
                    ' The optimal `limit` depends on the size of params.',
                    '',
                    ' The results can be filtered by manager. Note that paging must still be completed fully.',
                ],
                'mutates': false,
                'name': [
                    'cdn_cluster_list',
                ],
                'payable': false,
                'returnType': {
                    'displayName': [],
                    'type': 64,
                },
                'selector': '0xb242a64f',
            },
            {
                'args': [
                    {
                        'name': 'cdn_owner',
                        'type': {
                            'displayName': [
                                'AccountId',
                            ],
                            'type': 3,
                        },
                    },
                    {
                        'name': 'node_id',
                        'type': {
                            'displayName': [
                                'NodeId',
                            ],
                            'type': 1,
                        },
                    },
                    {
                        'name': 'commit',
                        'type': {
                            'displayName': [
                                'Commit',
                            ],
                            'type': 36,
                        },
                    },
                ],
                'docs': [
                    ' CDN node operator sets the commit for current era.',
                ],
                'mutates': true,
                'name': [
                    'set_commit',
                ],
                'payable': false,
                'returnType': null,
                'selector': '0xe445e1fd',
            },
            {
                'args': [
                    {
                        'name': 'cdn_owner',
                        'type': {
                            'displayName': [
                                'AccountId',
                            ],
                            'type': 3,
                        },
                    },
                ],
                'docs': [
                    ' Return the last commit submitted by CDN node operator',
                ],
                'mutates': false,
                'name': [
                    'get_commit',
                ],
                'payable': false,
                'returnType': {
                    'displayName': [
                        'Vec',
                    ],
                    'type': 34,
                },
                'selector': '0x5329f551',
            },
            {
                'args': [
                    {
                        'name': 'node',
                        'type': {
                            'displayName': [
                                'NodeId',
                            ],
                            'type': 1,
                        },
                    },
                ],
                'docs': [
                    ' Return last era validated per CDN node',
                ],
                'mutates': false,
                'name': [
                    'get_validated_commit',
                ],
                'payable': false,
                'returnType': {
                    'displayName': [
                        'EraAndTimestamp',
                    ],
                    'type': 39,
                },
                'selector': '0x7d497bc1',
            },
            {
                'args': [
                    {
                        'name': 'era_config',
                        'type': {
                            'displayName': [
                                'EraConfig',
                            ],
                            'type': 66,
                        },
                    },
                ],
                'docs': [
                    ' Set the new configs for era',
                ],
                'mutates': true,
                'name': [
                    'set_era',
                ],
                'payable': false,
                'returnType': {
                    'displayName': [],
                    'type': 44,
                },
                'selector': '0x49a5b8f7',
            },
            {
                'args': [],
                'docs': [
                    ' Return current status of an era',
                ],
                'mutates': false,
                'name': [
                    'get_era',
                ],
                'payable': false,
                'returnType': {
                    'displayName': [
                        'EraStatus',
                    ],
                    'type': 67,
                },
                'selector': '0x617f696b',
            },
            {
                'args': [],
                'docs': [
                    ' Return current era settings',
                ],
                'mutates': false,
                'name': [
                    'get_era_settings',
                ],
                'payable': false,
                'returnType': {
                    'displayName': [
                        'EraConfig',
                    ],
                    'type': 66,
                },
                'selector': '0x84b61468',
            },
            {
                'args': [
                    {
                        'name': 'manager',
                        'type': {
                            'displayName': [
                                'AccountId',
                            ],
                            'type': 3,
                        },
                    },
                ],
                'docs': [
                    ' As node provider, authorize a cluster manager to use his nodes.',
                ],
                'mutates': true,
                'name': [
                    'cdn_node_trust_manager',
                ],
                'payable': true,
                'returnType': null,
                'selector': '0x372daa96',
            },
            {
                'args': [
                    {
                        'name': 'manager',
                        'type': {
                            'displayName': [
                                'AccountId',
                            ],
                            'type': 3,
                        },
                    },
                ],
                'docs': [
                    ' As node provider, revoke the authorization of a cluster manager to use his nodes.',
                ],
                'mutates': true,
                'name': [
                    'cdn_node_distrust_manager',
                ],
                'payable': false,
                'returnType': null,
                'selector': '0xf67f5438',
            },
            {
                'args': [
                    {
                        'name': 'node_params',
                        'type': {
                            'displayName': [
                                'Params',
                            ],
                            'type': 15,
                        },
                    },
                ],
                'docs': [
                    ' Create a new node and return its `node_id`.',
                    '',
                    ' The caller will be its owner.',
                    '',
                    ' `node_params` is configuration used by clients and nodes. In particular, this contains the URL to the service. See the [data structure of NodeParams](https://docs.cere.network/ddc/protocols/contract-params-schema)',
                ],
                'mutates': true,
                'name': [
                    'cdn_node_create',
                ],
                'payable': true,
                'returnType': {
                    'displayName': [
                        'NodeId',
                    ],
                    'type': 1,
                },
                'selector': '0xe8aa4ade',
            },
            {
                'args': [
                    {
                        'name': 'node_id',
                        'type': {
                            'displayName': [
                                'NodeId',
                            ],
                            'type': 1,
                        },
                    },
                    {
                        'name': 'params',
                        'type': {
                            'displayName': [
                                'NodeParams',
                            ],
                            'type': 15,
                        },
                    },
                ],
                'docs': [
                    ' Change the `node_params`, which is configuration used by clients and nodes.',
                    '',
                    ' See the [data structure of NodeParams](https://docs.cere.network/ddc/protocols/contract-params-schema)',
                ],
                'mutates': true,
                'name': [
                    'cdn_node_change_params',
                ],
                'payable': true,
                'returnType': null,
                'selector': '0xf52c20f5',
            },
            {
                'args': [
                    {
                        'name': 'node_id',
                        'type': {
                            'displayName': [
                                'NodeId',
                            ],
                            'type': 1,
                        },
                    },
                ],
                'docs': [
                    ' Get the current state of the cdn node',
                ],
                'mutates': false,
                'name': [
                    'cdn_node_get',
                ],
                'payable': false,
                'returnType': {
                    'displayName': [
                        'Result',
                    ],
                    'type': 69,
                },
                'selector': '0xf9a5a813',
            },
            {
                'args': [
                    {
                        'name': 'offset',
                        'type': {
                            'displayName': [
                                'u32',
                            ],
                            'type': 1,
                        },
                    },
                    {
                        'name': 'limit',
                        'type': {
                            'displayName': [
                                'u32',
                            ],
                            'type': 1,
                        },
                    },
                    {
                        'name': 'filter_provider_id',
                        'type': {
                            'displayName': [
                                'Option',
                            ],
                            'type': 43,
                        },
                    },
                ],
                'docs': [
                    ' Iterate through all nodes.',
                    '',
                    ' The algorithm for paging is: start with `offset = 1` and `limit = 20`. The function returns a `(results, max_id)`. Call again with `offset += limit`, until `offset >= max_id`.',
                    ' The optimal `limit` depends on the size of params.',
                    '',
                    ' The results can be filtered by owner. Note that paging must still be completed fully.',
                ],
                'mutates': false,
                'name': [
                    'cdn_node_list',
                ],
                'payable': false,
                'returnType': {
                    'displayName': [],
                    'type': 71,
                },
                'selector': '0xf8589aae',
            },
            {
                'args': [
                    {
                        'name': 'manager',
                        'type': {
                            'displayName': [
                                'AccountId',
                            ],
                            'type': 3,
                        },
                    },
                ],
                'docs': [
                    ' As node provider, authorize a cluster manager to use his nodes.',
                ],
                'mutates': true,
                'name': [
                    'node_trust_manager',
                ],
                'payable': true,
                'returnType': null,
                'selector': '0x6fd54a01',
            },
            {
                'args': [
                    {
                        'name': 'manager',
                        'type': {
                            'displayName': [
                                'AccountId',
                            ],
                            'type': 3,
                        },
                    },
                ],
                'docs': [
                    ' As node provider, revoke the authorization of a cluster manager to use his nodes.',
                ],
                'mutates': true,
                'name': [
                    'node_distrust_manager',
                ],
                'payable': false,
                'returnType': null,
                'selector': '0x40912279',
            },
            {
                'args': [
                    {
                        'name': 'rent_per_month',
                        'type': {
                            'displayName': [
                                'Balance',
                            ],
                            'type': 8,
                        },
                    },
                    {
                        'name': 'node_params',
                        'type': {
                            'displayName': [
                                'NodeParams',
                            ],
                            'type': 15,
                        },
                    },
                    {
                        'name': 'capacity',
                        'type': {
                            'displayName': [
                                'Resource',
                            ],
                            'type': 1,
                        },
                    },
                    {
                        'name': 'node_tag',
                        'type': {
                            'displayName': [
                                'NodeTag',
                            ],
                            'type': 26,
                        },
                    },
                ],
                'docs': [
                    ' Create a new node and return its `node_id`.',
                    '',
                    ' The caller will be its owner.',
                    '',
                    ' `node_params` is configuration used by clients and nodes. In particular, this contains the URL to the service. See the [data structure of NodeParams](https://docs.cere.network/ddc/protocols/contract-params-schema)',
                ],
                'mutates': true,
                'name': [
                    'node_create',
                ],
                'payable': true,
                'returnType': {
                    'displayName': [
                        'NodeId',
                    ],
                    'type': 1,
                },
                'selector': '0xb77ac1bb',
            },
            {
                'args': [
                    {
                        'name': 'node_id',
                        'type': {
                            'displayName': [
                                'NodeId',
                            ],
                            'type': 1,
                        },
                    },
                    {
                        'name': 'params',
                        'type': {
                            'displayName': [
                                'NodeParams',
                            ],
                            'type': 15,
                        },
                    },
                ],
                'docs': [
                    ' Change the `node_params`, which is configuration used by clients and nodes.',
                    '',
                    ' See the [data structure of NodeParams](https://docs.cere.network/ddc/protocols/contract-params-schema)',
                ],
                'mutates': true,
                'name': [
                    'node_change_params',
                ],
                'payable': true,
                'returnType': null,
                'selector': '0x258ccb2a',
            },
            {
                'args': [
                    {
                        'name': 'node_id',
                        'type': {
                            'displayName': [
                                'NodeId',
                            ],
                            'type': 1,
                        },
                    },
                ],
                'docs': [
                    ' Get the current status of a node.',
                ],
                'mutates': false,
                'name': [
                    'node_get',
                ],
                'payable': false,
                'returnType': {
                    'displayName': [
                        'Result',
                    ],
                    'type': 73,
                },
                'selector': '0x847f3997',
            },
            {
                'args': [
                    {
                        'name': 'offset',
                        'type': {
                            'displayName': [
                                'u32',
                            ],
                            'type': 1,
                        },
                    },
                    {
                        'name': 'limit',
                        'type': {
                            'displayName': [
                                'u32',
                            ],
                            'type': 1,
                        },
                    },
                    {
                        'name': 'filter_provider_id',
                        'type': {
                            'displayName': [
                                'Option',
                            ],
                            'type': 43,
                        },
                    },
                ],
                'docs': [
                    ' Iterate through all nodes.',
                    '',
                    ' The algorithm for paging is: start with `offset = 1` and `limit = 20`. The function returns a `(results, max_id)`. Call again with `offset += limit`, until `offset >= max_id`.',
                    ' The optimal `limit` depends on the size of params.',
                    '',
                    ' The results can be filtered by owner. Note that paging must still be completed fully.',
                ],
                'mutates': false,
                'name': [
                    'node_list',
                ],
                'payable': false,
                'returnType': {
                    'displayName': [],
                    'type': 75,
                },
                'selector': '0x423286d6',
            },
            {
                'args': [],
                'docs': [
                    ' Get the Fee Percentage Basis Points that will be charged by the protocol',
                ],
                'mutates': false,
                'name': [
                    'get_fee_bp',
                ],
                'payable': false,
                'returnType': {
                    'displayName': [
                        'u32',
                    ],
                    'type': 1,
                },
                'selector': '0x0d5daf5f',
            },
            {
                'args': [
                    {
                        'name': 'fee_bp',
                        'type': {
                            'displayName': [
                                'u32',
                            ],
                            'type': 1,
                        },
                    },
                ],
                'docs': [
                    ' Return the last commit submitted by CDN node operator',
                ],
                'mutates': true,
                'name': [
                    'set_fee_bp',
                ],
                'payable': false,
                'returnType': {
                    'displayName': [],
                    'type': 44,
                },
                'selector': '0xc5e3e2ca',
            },
            {
                'args': [],
                'docs': [
                    ' Return fees accumulated by the protocol',
                ],
                'mutates': false,
                'name': [
                    'get_protocol_revenues',
                ],
                'payable': false,
                'returnType': {
                    'displayName': [
                        'Cash',
                    ],
                    'type': 18,
                },
                'selector': '0x07c63885',
            },
            {
                'args': [
                    {
                        'name': 'amount',
                        'type': {
                            'displayName': [
                                'u128',
                            ],
                            'type': 8,
                        },
                    },
                ],
                'docs': [
                    ' Pay the revenues accumulated by the protocol',
                ],
                'mutates': true,
                'name': [
                    'protocol_withdraw_revenues',
                ],
                'payable': false,
                'returnType': {
                    'displayName': [],
                    'type': 44,
                },
                'selector': '0x85c6fa6d',
            },
            {
                'args': [],
                'docs': [
                    ' As user, deposit tokens on the account of the caller from the transaction value. This deposit',
                    ' can be used to pay for the services to buckets of the account.',
                ],
                'mutates': true,
                'name': [
                    'account_deposit',
                ],
                'payable': true,
                'returnType': {
                    'displayName': [],
                    'type': 44,
                },
                'selector': '0xc311af62',
            },
            {
                'args': [
                    {
                        'name': 'bond_amount',
                        'type': {
                            'displayName': [
                                'Balance',
                            ],
                            'type': 8,
                        },
                    },
                ],
                'docs': [
                    ' As user, bond some amount of tokens from the withdrawable balance. These funds will be used to pay for CDN node service.',
                ],
                'mutates': true,
                'name': [
                    'account_bond',
                ],
                'payable': true,
                'returnType': {
                    'displayName': [],
                    'type': 44,
                },
                'selector': '0xe9fad0bf',
            },
            {
                'args': [
                    {
                        'name': 'amount_to_unbond',
                        'type': {
                            'displayName': [
                                'Cash',
                            ],
                            'type': 18,
                        },
                    },
                ],
                'docs': [
                    ' As user, unbond a specified amount of tokens. The tokens will be locked for some time, as defined by contract owner.',
                ],
                'mutates': true,
                'name': [
                    'account_unbond',
                ],
                'payable': true,
                'returnType': {
                    'displayName': [],
                    'type': 44,
                },
                'selector': '0xf7ea2c67',
            },
            {
                'args': [],
                'docs': [
                    ' As user, move the unbonded tokens back to withdrawable balance state.',
                    '',
                    ' This can be triggered after unbonded_timestamp',
                ],
                'mutates': true,
                'name': [
                    'account_withdraw_unbonded',
                ],
                'payable': true,
                'returnType': {
                    'displayName': [],
                    'type': 44,
                },
                'selector': '0x98173716',
            },
            {
                'args': [
                    {
                        'name': 'account_id',
                        'type': {
                            'displayName': [
                                'AccountId',
                            ],
                            'type': 3,
                        },
                    },
                ],
                'docs': [
                    ' Get the current status of an account.',
                ],
                'mutates': false,
                'name': [
                    'account_get',
                ],
                'payable': false,
                'returnType': {
                    'displayName': [
                        'Result',
                    ],
                    'type': 77,
                },
                'selector': '0x1d4220fa',
            },
            {
                'args': [],
                'docs': [
                    ' Get the current conversion rate between the native currency and an external currency (USD).',
                ],
                'mutates': false,
                'name': [
                    'account_get_usd_per_cere',
                ],
                'payable': false,
                'returnType': {
                    'displayName': [
                        'Balance',
                    ],
                    'type': 8,
                },
                'selector': '0xe4a4652a',
            },
            {
                'args': [
                    {
                        'name': 'usd_per_cere',
                        'type': {
                            'displayName': [
                                'Balance',
                            ],
                            'type': 8,
                        },
                    },
                ],
                'docs': [
                    ' As price oracle, set the current conversion rate between the native currency and an external currency (USD).',
                    '',
                    ' This requires the permission SetExchangeRate or SuperAdmin.',
                ],
                'mutates': true,
                'name': [
                    'account_set_usd_per_cere',
                ],
                'payable': false,
                'returnType': null,
                'selector': '0x48d45ee8',
            },
            {
                'args': [
                    {
                        'name': 'grantee',
                        'type': {
                            'displayName': [
                                'AccountId',
                            ],
                            'type': 3,
                        },
                    },
                    {
                        'name': 'permission',
                        'type': {
                            'displayName': [
                                'Permission',
                            ],
                            'type': 78,
                        },
                    },
                ],
                'docs': [
                    ' Check whether the given account has the given permission currently,',
                    ' or the SuperAdmin permission.',
                ],
                'mutates': false,
                'name': [
                    'has_permission',
                ],
                'payable': false,
                'returnType': {
                    'displayName': [
                        'bool',
                    ],
                    'type': 9,
                },
                'selector': '0xe0942492',
            },
            {
                'args': [
                    {
                        'name': 'grantee',
                        'type': {
                            'displayName': [
                                'AccountId',
                            ],
                            'type': 3,
                        },
                    },
                    {
                        'name': 'permission',
                        'type': {
                            'displayName': [
                                'Permission',
                            ],
                            'type': 78,
                        },
                    },
                ],
                'docs': [
                    ' As SuperAdmin, grant any permission to any account.',
                ],
                'mutates': true,
                'name': [
                    'admin_grant_permission',
                ],
                'payable': true,
                'returnType': null,
                'selector': '0xbe41ea55',
            },
            {
                'args': [
                    {
                        'name': 'grantee',
                        'type': {
                            'displayName': [
                                'AccountId',
                            ],
                            'type': 3,
                        },
                    },
                    {
                        'name': 'permission',
                        'type': {
                            'displayName': [
                                'Permission',
                            ],
                            'type': 78,
                        },
                    },
                ],
                'docs': [
                    ' As SuperAdmin, revoke any permission to any account.',
                ],
                'mutates': true,
                'name': [
                    'admin_revoke_permission',
                ],
                'payable': false,
                'returnType': null,
                'selector': '0x6b150666',
            },
            {
                'args': [
                    {
                        'name': 'amount',
                        'type': {
                            'displayName': [
                                'Balance',
                            ],
                            'type': 8,
                        },
                    },
                ],
                'docs': [
                    ' As SuperAdmin, withdraw the funds held in custody in this contract.',
                    '',
                    ' This is a temporary measure to allow migrating the funds to a new version of the contract.',
                ],
                'mutates': true,
                'name': [
                    'admin_withdraw',
                ],
                'payable': false,
                'returnType': null,
                'selector': '0x2f6e0868',
            },
            {
                'args': [
                    {
                        'name': 'config',
                        'type': {
                            'displayName': [
                                'FeeConfig',
                            ],
                            'type': 79,
                        },
                    },
                ],
                'docs': [
                    ' As SuperAdmin, set the network and cluster fee configuration.',
                ],
                'mutates': true,
                'name': [
                    'admin_set_fee_config',
                ],
                'payable': false,
                'returnType': null,
                'selector': '0x00d441e7',
            },
            {
                'args': [],
                'docs': [
                    ' Get all Account IDs stored in the SC',
                ],
                'mutates': false,
                'name': [
                    'get_accounts',
                ],
                'payable': true,
                'returnType': {
                    'displayName': [
                        'Vec',
                    ],
                    'type': 14,
                },
                'selector': '0xef03ead7',
            },
        ],
    },
    'storage': {
        'struct': {
            'fields': [
                {
                    'layout': {
                        'struct': {
                            'fields': [
                                {
                                    'layout': {
                                        'struct': {
                                            'fields': [
                                                {
                                                    'layout': {
                                                        'cell': {
                                                            'key': '0x0000000000000000000000000000000000000000000000000000000000000000',
                                                            'ty': 1,
                                                        },
                                                    },
                                                    'name': 'len',
                                                },
                                                {
                                                    'layout': {
                                                        'array': {
                                                            'cellsPerElem': 1,
                                                            'layout': {
                                                                'cell': {
                                                                    'key': '0x0000000001000000000000000000000000000000000000000000000000000000',
                                                                    'ty': 2,
                                                                },
                                                            },
                                                            'len': 4294967295,
                                                            'offset': '0x0100000000000000000000000000000000000000000000000000000000000000',
                                                        },
                                                    },
                                                    'name': 'elems',
                                                },
                                            ],
                                        },
                                    },
                                    'name': null,
                                },
                            ],
                        },
                    },
                    'name': 'buckets',
                },
                {
                    'layout': {
                        'struct': {
                            'fields': [
                                {
                                    'layout': {
                                        'struct': {
                                            'fields': [
                                                {
                                                    'layout': {
                                                        'struct': {
                                                            'fields': [
                                                                {
                                                                    'layout': {
                                                                        'cell': {
                                                                            'key': '0x0000000001000000000000000000000000000000000000000000000000000000',
                                                                            'ty': 10,
                                                                        },
                                                                    },
                                                                    'name': 'header',
                                                                },
                                                                {
                                                                    'layout': {
                                                                        'struct': {
                                                                            'fields': [
                                                                                {
                                                                                    'layout': {
                                                                                        'cell': {
                                                                                            'key': '0x0100000001000000000000000000000000000000000000000000000000000000',
                                                                                            'ty': 1,
                                                                                        },
                                                                                    },
                                                                                    'name': 'len',
                                                                                },
                                                                                {
                                                                                    'layout': {
                                                                                        'array': {
                                                                                            'cellsPerElem': 1,
                                                                                            'layout': {
                                                                                                'cell': {
                                                                                                    'key': '0x0100000002000000000000000000000000000000000000000000000000000000',
                                                                                                    'ty': 11,
                                                                                                },
                                                                                            },
                                                                                            'len': 4294967295,
                                                                                            'offset': '0x0200000001000000000000000000000000000000000000000000000000000000',
                                                                                        },
                                                                                    },
                                                                                    'name': 'elems',
                                                                                },
                                                                            ],
                                                                        },
                                                                    },
                                                                    'name': 'entries',
                                                                },
                                                            ],
                                                        },
                                                    },
                                                    'name': 'keys',
                                                },
                                                {
                                                    'layout': {
                                                        'hash': {
                                                            'layout': {
                                                                'cell': {
                                                                    'key': '0x0200000002000000000000000000000000000000000000000000000000000000',
                                                                    'ty': 13,
                                                                },
                                                            },
                                                            'offset': '0x0100000002000000000000000000000000000000000000000000000000000000',
                                                            'strategy': {
                                                                'hasher': 'Blake2x256',
                                                                'postfix': '',
                                                                'prefix': '0x696e6b20686173686d6170',
                                                            },
                                                        },
                                                    },
                                                    'name': 'values',
                                                },
                                            ],
                                        },
                                    },
                                    'name': 'writers',
                                },
                                {
                                    'layout': {
                                        'struct': {
                                            'fields': [
                                                {
                                                    'layout': {
                                                        'struct': {
                                                            'fields': [
                                                                {
                                                                    'layout': {
                                                                        'cell': {
                                                                            'key': '0x0200000002000000000000000000000000000000000000000000000000000000',
                                                                            'ty': 10,
                                                                        },
                                                                    },
                                                                    'name': 'header',
                                                                },
                                                                {
                                                                    'layout': {
                                                                        'struct': {
                                                                            'fields': [
                                                                                {
                                                                                    'layout': {
                                                                                        'cell': {
                                                                                            'key': '0x0300000002000000000000000000000000000000000000000000000000000000',
                                                                                            'ty': 1,
                                                                                        },
                                                                                    },
                                                                                    'name': 'len',
                                                                                },
                                                                                {
                                                                                    'layout': {
                                                                                        'array': {
                                                                                            'cellsPerElem': 1,
                                                                                            'layout': {
                                                                                                'cell': {
                                                                                                    'key': '0x0300000003000000000000000000000000000000000000000000000000000000',
                                                                                                    'ty': 11,
                                                                                                },
                                                                                            },
                                                                                            'len': 4294967295,
                                                                                            'offset': '0x0400000002000000000000000000000000000000000000000000000000000000',
                                                                                        },
                                                                                    },
                                                                                    'name': 'elems',
                                                                                },
                                                                            ],
                                                                        },
                                                                    },
                                                                    'name': 'entries',
                                                                },
                                                            ],
                                                        },
                                                    },
                                                    'name': 'keys',
                                                },
                                                {
                                                    'layout': {
                                                        'hash': {
                                                            'layout': {
                                                                'cell': {
                                                                    'key': '0x0400000003000000000000000000000000000000000000000000000000000000',
                                                                    'ty': 13,
                                                                },
                                                            },
                                                            'offset': '0x0300000003000000000000000000000000000000000000000000000000000000',
                                                            'strategy': {
                                                                'hasher': 'Blake2x256',
                                                                'postfix': '',
                                                                'prefix': '0x696e6b20686173686d6170',
                                                            },
                                                        },
                                                    },
                                                    'name': 'values',
                                                },
                                            ],
                                        },
                                    },
                                    'name': 'readers',
                                },
                            ],
                        },
                    },
                    'name': 'buckets_perms',
                },
                {
                    'layout': {
                        'struct': {
                            'fields': [
                                {
                                    'layout': {
                                        'struct': {
                                            'fields': [
                                                {
                                                    'layout': {
                                                        'cell': {
                                                            'key': '0x0400000003000000000000000000000000000000000000000000000000000000',
                                                            'ty': 1,
                                                        },
                                                    },
                                                    'name': 'len',
                                                },
                                                {
                                                    'layout': {
                                                        'array': {
                                                            'cellsPerElem': 1,
                                                            'layout': {
                                                                'cell': {
                                                                    'key': '0x0400000004000000000000000000000000000000000000000000000000000000',
                                                                    'ty': 15,
                                                                },
                                                            },
                                                            'len': 4294967295,
                                                            'offset': '0x0500000003000000000000000000000000000000000000000000000000000000',
                                                        },
                                                    },
                                                    'name': 'elems',
                                                },
                                            ],
                                        },
                                    },
                                    'name': null,
                                },
                            ],
                        },
                    },
                    'name': 'bucket_params',
                },
                {
                    'layout': {
                        'struct': {
                            'fields': [
                                {
                                    'layout': {
                                        'cell': {
                                            'key': '0x0400000004000000000000000000000000000000000000000000000000000000',
                                            'ty': 16,
                                        },
                                    },
                                    'name': null,
                                },
                            ],
                        },
                    },
                    'name': 'clusters',
                },
                {
                    'layout': {
                        'struct': {
                            'fields': [
                                {
                                    'layout': {
                                        'struct': {
                                            'fields': [
                                                {
                                                    'layout': {
                                                        'cell': {
                                                            'key': '0x0500000004000000000000000000000000000000000000000000000000000000',
                                                            'ty': 1,
                                                        },
                                                    },
                                                    'name': 'len',
                                                },
                                                {
                                                    'layout': {
                                                        'array': {
                                                            'cellsPerElem': 1,
                                                            'layout': {
                                                                'cell': {
                                                                    'key': '0x0500000005000000000000000000000000000000000000000000000000000000',
                                                                    'ty': 23,
                                                                },
                                                            },
                                                            'len': 4294967295,
                                                            'offset': '0x0600000004000000000000000000000000000000000000000000000000000000',
                                                        },
                                                    },
                                                    'name': 'elems',
                                                },
                                            ],
                                        },
                                    },
                                    'name': null,
                                },
                            ],
                        },
                    },
                    'name': 'cdn_clusters',
                },
                {
                    'layout': {
                        'struct': {
                            'fields': [
                                {
                                    'layout': {
                                        'struct': {
                                            'fields': [
                                                {
                                                    'layout': {
                                                        'cell': {
                                                            'key': '0x0500000005000000000000000000000000000000000000000000000000000000',
                                                            'ty': 1,
                                                        },
                                                    },
                                                    'name': 'len',
                                                },
                                                {
                                                    'layout': {
                                                        'array': {
                                                            'cellsPerElem': 1,
                                                            'layout': {
                                                                'cell': {
                                                                    'key': '0x0500000006000000000000000000000000000000000000000000000000000000',
                                                                    'ty': 15,
                                                                },
                                                            },
                                                            'len': 4294967295,
                                                            'offset': '0x0600000005000000000000000000000000000000000000000000000000000000',
                                                        },
                                                    },
                                                    'name': 'elems',
                                                },
                                            ],
                                        },
                                    },
                                    'name': null,
                                },
                            ],
                        },
                    },
                    'name': 'cluster_params',
                },
                {
                    'layout': {
                        'struct': {
                            'fields': [
                                {
                                    'layout': {
                                        'struct': {
                                            'fields': [
                                                {
                                                    'layout': {
                                                        'cell': {
                                                            'key': '0x0500000006000000000000000000000000000000000000000000000000000000',
                                                            'ty': 1,
                                                        },
                                                    },
                                                    'name': 'len',
                                                },
                                                {
                                                    'layout': {
                                                        'array': {
                                                            'cellsPerElem': 1,
                                                            'layout': {
                                                                'cell': {
                                                                    'key': '0x0500000007000000000000000000000000000000000000000000000000000000',
                                                                    'ty': 24,
                                                                },
                                                            },
                                                            'len': 4294967295,
                                                            'offset': '0x0600000006000000000000000000000000000000000000000000000000000000',
                                                        },
                                                    },
                                                    'name': 'elems',
                                                },
                                            ],
                                        },
                                    },
                                    'name': null,
                                },
                            ],
                        },
                    },
                    'name': 'cdn_nodes',
                },
                {
                    'layout': {
                        'struct': {
                            'fields': [
                                {
                                    'layout': {
                                        'struct': {
                                            'fields': [
                                                {
                                                    'layout': {
                                                        'cell': {
                                                            'key': '0x0500000007000000000000000000000000000000000000000000000000000000',
                                                            'ty': 1,
                                                        },
                                                    },
                                                    'name': 'len',
                                                },
                                                {
                                                    'layout': {
                                                        'array': {
                                                            'cellsPerElem': 1,
                                                            'layout': {
                                                                'cell': {
                                                                    'key': '0x0500000008000000000000000000000000000000000000000000000000000000',
                                                                    'ty': 15,
                                                                },
                                                            },
                                                            'len': 4294967295,
                                                            'offset': '0x0600000007000000000000000000000000000000000000000000000000000000',
                                                        },
                                                    },
                                                    'name': 'elems',
                                                },
                                            ],
                                        },
                                    },
                                    'name': null,
                                },
                            ],
                        },
                    },
                    'name': 'cdn_node_params',
                },
                {
                    'layout': {
                        'struct': {
                            'fields': [
                                {
                                    'layout': {
                                        'struct': {
                                            'fields': [
                                                {
                                                    'layout': {
                                                        'cell': {
                                                            'key': '0x0500000008000000000000000000000000000000000000000000000000000000',
                                                            'ty': 1,
                                                        },
                                                    },
                                                    'name': 'len',
                                                },
                                                {
                                                    'layout': {
                                                        'array': {
                                                            'cellsPerElem': 1,
                                                            'layout': {
                                                                'cell': {
                                                                    'key': '0x0500000009000000000000000000000000000000000000000000000000000000',
                                                                    'ty': 25,
                                                                },
                                                            },
                                                            'len': 4294967295,
                                                            'offset': '0x0600000008000000000000000000000000000000000000000000000000000000',
                                                        },
                                                    },
                                                    'name': 'elems',
                                                },
                                            ],
                                        },
                                    },
                                    'name': null,
                                },
                            ],
                        },
                    },
                    'name': 'nodes',
                },
                {
                    'layout': {
                        'struct': {
                            'fields': [
                                {
                                    'layout': {
                                        'struct': {
                                            'fields': [
                                                {
                                                    'layout': {
                                                        'cell': {
                                                            'key': '0x0500000009000000000000000000000000000000000000000000000000000000',
                                                            'ty': 1,
                                                        },
                                                    },
                                                    'name': 'len',
                                                },
                                                {
                                                    'layout': {
                                                        'array': {
                                                            'cellsPerElem': 1,
                                                            'layout': {
                                                                'cell': {
                                                                    'key': '0x050000000a000000000000000000000000000000000000000000000000000000',
                                                                    'ty': 15,
                                                                },
                                                            },
                                                            'len': 4294967295,
                                                            'offset': '0x0600000009000000000000000000000000000000000000000000000000000000',
                                                        },
                                                    },
                                                    'name': 'elems',
                                                },
                                            ],
                                        },
                                    },
                                    'name': null,
                                },
                            ],
                        },
                    },
                    'name': 'node_params',
                },
                {
                    'layout': {
                        'struct': {
                            'fields': [
                                {
                                    'layout': {
                                        'struct': {
                                            'fields': [
                                                {
                                                    'layout': {
                                                        'struct': {
                                                            'fields': [
                                                                {
                                                                    'layout': {
                                                                        'cell': {
                                                                            'key': '0x050000000a000000000000000000000000000000000000000000000000000000',
                                                                            'ty': 10,
                                                                        },
                                                                    },
                                                                    'name': 'header',
                                                                },
                                                                {
                                                                    'layout': {
                                                                        'struct': {
                                                                            'fields': [
                                                                                {
                                                                                    'layout': {
                                                                                        'cell': {
                                                                                            'key': '0x060000000a000000000000000000000000000000000000000000000000000000',
                                                                                            'ty': 1,
                                                                                        },
                                                                                    },
                                                                                    'name': 'len',
                                                                                },
                                                                                {
                                                                                    'layout': {
                                                                                        'array': {
                                                                                            'cellsPerElem': 1,
                                                                                            'layout': {
                                                                                                'cell': {
                                                                                                    'key': '0x060000000b000000000000000000000000000000000000000000000000000000',
                                                                                                    'ty': 27,
                                                                                                },
                                                                                            },
                                                                                            'len': 4294967295,
                                                                                            'offset': '0x070000000a000000000000000000000000000000000000000000000000000000',
                                                                                        },
                                                                                    },
                                                                                    'name': 'elems',
                                                                                },
                                                                            ],
                                                                        },
                                                                    },
                                                                    'name': 'entries',
                                                                },
                                                            ],
                                                        },
                                                    },
                                                    'name': 'keys',
                                                },
                                                {
                                                    'layout': {
                                                        'hash': {
                                                            'layout': {
                                                                'cell': {
                                                                    'key': '0x070000000b000000000000000000000000000000000000000000000000000000',
                                                                    'ty': 28,
                                                                },
                                                            },
                                                            'offset': '0x060000000b000000000000000000000000000000000000000000000000000000',
                                                            'strategy': {
                                                                'hasher': 'Blake2x256',
                                                                'postfix': '',
                                                                'prefix': '0x696e6b20686173686d6170',
                                                            },
                                                        },
                                                    },
                                                    'name': 'values',
                                                },
                                            ],
                                        },
                                    },
                                    'name': null,
                                },
                                {
                                    'layout': {
                                        'struct': {
                                            'fields': [
                                                {
                                                    'layout': {
                                                        'cell': {
                                                            'key': '0x070000000b000000000000000000000000000000000000000000000000000000',
                                                            'ty': 8,
                                                        },
                                                    },
                                                    'name': null,
                                                },
                                            ],
                                        },
                                    },
                                    'name': null,
                                },
                            ],
                        },
                    },
                    'name': 'accounts',
                },
                {
                    'layout': {
                        'struct': {
                            'fields': [
                                {
                                    'layout': {
                                        'struct': {
                                            'fields': [
                                                {
                                                    'layout': {
                                                        'struct': {
                                                            'fields': [
                                                                {
                                                                    'layout': {
                                                                        'cell': {
                                                                            'key': '0x080000000b000000000000000000000000000000000000000000000000000000',
                                                                            'ty': 10,
                                                                        },
                                                                    },
                                                                    'name': 'header',
                                                                },
                                                                {
                                                                    'layout': {
                                                                        'struct': {
                                                                            'fields': [
                                                                                {
                                                                                    'layout': {
                                                                                        'cell': {
                                                                                            'key': '0x090000000b000000000000000000000000000000000000000000000000000000',
                                                                                            'ty': 1,
                                                                                        },
                                                                                    },
                                                                                    'name': 'len',
                                                                                },
                                                                                {
                                                                                    'layout': {
                                                                                        'array': {
                                                                                            'cellsPerElem': 1,
                                                                                            'layout': {
                                                                                                'cell': {
                                                                                                    'key': '0x090000000c000000000000000000000000000000000000000000000000000000',
                                                                                                    'ty': 30,
                                                                                                },
                                                                                            },
                                                                                            'len': 4294967295,
                                                                                            'offset': '0x0a0000000b000000000000000000000000000000000000000000000000000000',
                                                                                        },
                                                                                    },
                                                                                    'name': 'elems',
                                                                                },
                                                                            ],
                                                                        },
                                                                    },
                                                                    'name': 'entries',
                                                                },
                                                            ],
                                                        },
                                                    },
                                                    'name': 'keys',
                                                },
                                                {
                                                    'layout': {
                                                        'hash': {
                                                            'layout': {
                                                                'cell': {
                                                                    'key': '0x0a0000000c000000000000000000000000000000000000000000000000000000',
                                                                    'ty': 32,
                                                                },
                                                            },
                                                            'offset': '0x090000000c000000000000000000000000000000000000000000000000000000',
                                                            'strategy': {
                                                                'hasher': 'Blake2x256',
                                                                'postfix': '',
                                                                'prefix': '0x696e6b20686173686d6170',
                                                            },
                                                        },
                                                    },
                                                    'name': 'values',
                                                },
                                            ],
                                        },
                                    },
                                    'name': null,
                                },
                            ],
                        },
                    },
                    'name': 'perms',
                },
                {
                    'layout': {
                        'struct': {
                            'fields': [
                                {
                                    'layout': {
                                        'struct': {
                                            'fields': [
                                                {
                                                    'layout': {
                                                        'cell': {
                                                            'key': '0x0a0000000c000000000000000000000000000000000000000000000000000000',
                                                            'ty': 8,
                                                        },
                                                    },
                                                    'name': 'network_fee_bp',
                                                },
                                                {
                                                    'layout': {
                                                        'cell': {
                                                            'key': '0x0b0000000c000000000000000000000000000000000000000000000000000000',
                                                            'ty': 3,
                                                        },
                                                    },
                                                    'name': 'network_fee_destination',
                                                },
                                                {
                                                    'layout': {
                                                        'cell': {
                                                            'key': '0x0c0000000c000000000000000000000000000000000000000000000000000000',
                                                            'ty': 8,
                                                        },
                                                    },
                                                    'name': 'cluster_management_fee_bp',
                                                },
                                            ],
                                        },
                                    },
                                    'name': null,
                                },
                            ],
                        },
                    },
                    'name': 'network_fee',
                },
                {
                    'layout': {
                        'struct': {
                            'fields': [
                                {
                                    'layout': {
                                        'cell': {
                                            'key': '0x0d0000000c000000000000000000000000000000000000000000000000000000',
                                            'ty': 3,
                                        },
                                    },
                                    'name': 'operator_id',
                                },
                                {
                                    'layout': {
                                        'struct': {
                                            'fields': [
                                                {
                                                    'layout': {
                                                        'struct': {
                                                            'fields': [
                                                                {
                                                                    'layout': {
                                                                        'cell': {
                                                                            'key': '0x0e0000000c000000000000000000000000000000000000000000000000000000',
                                                                            'ty': 10,
                                                                        },
                                                                    },
                                                                    'name': 'header',
                                                                },
                                                                {
                                                                    'layout': {
                                                                        'struct': {
                                                                            'fields': [
                                                                                {
                                                                                    'layout': {
                                                                                        'cell': {
                                                                                            'key': '0x0f0000000c000000000000000000000000000000000000000000000000000000',
                                                                                            'ty': 1,
                                                                                        },
                                                                                    },
                                                                                    'name': 'len',
                                                                                },
                                                                                {
                                                                                    'layout': {
                                                                                        'array': {
                                                                                            'cellsPerElem': 1,
                                                                                            'layout': {
                                                                                                'cell': {
                                                                                                    'key': '0x0f0000000d000000000000000000000000000000000000000000000000000000',
                                                                                                    'ty': 27,
                                                                                                },
                                                                                            },
                                                                                            'len': 4294967295,
                                                                                            'offset': '0x100000000c000000000000000000000000000000000000000000000000000000',
                                                                                        },
                                                                                    },
                                                                                    'name': 'elems',
                                                                                },
                                                                            ],
                                                                        },
                                                                    },
                                                                    'name': 'entries',
                                                                },
                                                            ],
                                                        },
                                                    },
                                                    'name': 'keys',
                                                },
                                                {
                                                    'layout': {
                                                        'hash': {
                                                            'layout': {
                                                                'cell': {
                                                                    'key': '0x100000000d000000000000000000000000000000000000000000000000000000',
                                                                    'ty': 33,
                                                                },
                                                            },
                                                            'offset': '0x0f0000000d000000000000000000000000000000000000000000000000000000',
                                                            'strategy': {
                                                                'hasher': 'Blake2x256',
                                                                'postfix': '',
                                                                'prefix': '0x696e6b20686173686d6170',
                                                            },
                                                        },
                                                    },
                                                    'name': 'values',
                                                },
                                            ],
                                        },
                                    },
                                    'name': 'commits',
                                },
                                {
                                    'layout': {
                                        'struct': {
                                            'fields': [
                                                {
                                                    'layout': {
                                                        'struct': {
                                                            'fields': [
                                                                {
                                                                    'layout': {
                                                                        'cell': {
                                                                            'key': '0x100000000d000000000000000000000000000000000000000000000000000000',
                                                                            'ty': 10,
                                                                        },
                                                                    },
                                                                    'name': 'header',
                                                                },
                                                                {
                                                                    'layout': {
                                                                        'struct': {
                                                                            'fields': [
                                                                                {
                                                                                    'layout': {
                                                                                        'cell': {
                                                                                            'key': '0x110000000d000000000000000000000000000000000000000000000000000000',
                                                                                            'ty': 1,
                                                                                        },
                                                                                    },
                                                                                    'name': 'len',
                                                                                },
                                                                                {
                                                                                    'layout': {
                                                                                        'array': {
                                                                                            'cellsPerElem': 1,
                                                                                            'layout': {
                                                                                                'cell': {
                                                                                                    'key': '0x110000000e000000000000000000000000000000000000000000000000000000',
                                                                                                    'ty': 11,
                                                                                                },
                                                                                            },
                                                                                            'len': 4294967295,
                                                                                            'offset': '0x120000000d000000000000000000000000000000000000000000000000000000',
                                                                                        },
                                                                                    },
                                                                                    'name': 'elems',
                                                                                },
                                                                            ],
                                                                        },
                                                                    },
                                                                    'name': 'entries',
                                                                },
                                                            ],
                                                        },
                                                    },
                                                    'name': 'keys',
                                                },
                                                {
                                                    'layout': {
                                                        'hash': {
                                                            'layout': {
                                                                'cell': {
                                                                    'key': '0x120000000e000000000000000000000000000000000000000000000000000000',
                                                                    'ty': 38,
                                                                },
                                                            },
                                                            'offset': '0x110000000e000000000000000000000000000000000000000000000000000000',
                                                            'strategy': {
                                                                'hasher': 'Blake2x256',
                                                                'postfix': '',
                                                                'prefix': '0x696e6b20686173686d6170',
                                                            },
                                                        },
                                                    },
                                                    'name': 'values',
                                                },
                                            ],
                                        },
                                    },
                                    'name': 'validated_commits',
                                },
                                {
                                    'layout': {
                                        'struct': {
                                            'fields': [
                                                {
                                                    'layout': {
                                                        'cell': {
                                                            'key': '0x120000000e000000000000000000000000000000000000000000000000000000',
                                                            'ty': 22,
                                                        },
                                                    },
                                                    'name': 'start',
                                                },
                                                {
                                                    'layout': {
                                                        'cell': {
                                                            'key': '0x130000000e000000000000000000000000000000000000000000000000000000',
                                                            'ty': 22,
                                                        },
                                                    },
                                                    'name': 'interval',
                                                },
                                                {
                                                    'layout': {
                                                        'cell': {
                                                            'key': '0x140000000e000000000000000000000000000000000000000000000000000000',
                                                            'ty': 22,
                                                        },
                                                    },
                                                    'name': 'commit_duration',
                                                },
                                                {
                                                    'layout': {
                                                        'cell': {
                                                            'key': '0x150000000e000000000000000000000000000000000000000000000000000000',
                                                            'ty': 22,
                                                        },
                                                    },
                                                    'name': 'validation_duration',
                                                },
                                            ],
                                        },
                                    },
                                    'name': 'era_settings',
                                },
                            ],
                        },
                    },
                    'name': 'committer_store',
                },
                {
                    'layout': {
                        'struct': {
                            'fields': [
                                {
                                    'layout': {
                                        'cell': {
                                            'key': '0x160000000e000000000000000000000000000000000000000000000000000000',
                                            'ty': 3,
                                        },
                                    },
                                    'name': 'admin',
                                },
                                {
                                    'layout': {
                                        'cell': {
                                            'key': '0x170000000e000000000000000000000000000000000000000000000000000000',
                                            'ty': 1,
                                        },
                                    },
                                    'name': 'fee_bp',
                                },
                                {
                                    'layout': {
                                        'struct': {
                                            'fields': [
                                                {
                                                    'layout': {
                                                        'cell': {
                                                            'key': '0x180000000e000000000000000000000000000000000000000000000000000000',
                                                            'ty': 8,
                                                        },
                                                    },
                                                    'name': null,
                                                },
                                            ],
                                        },
                                    },
                                    'name': 'revenues',
                                },
                            ],
                        },
                    },
                    'name': 'protocol_store',
                },
                {
                    'layout': {
                        'struct': {
                            'fields': [
                                {
                                    'layout': {
                                        'struct': {
                                            'fields': [
                                                {
                                                    'layout': {
                                                        'struct': {
                                                            'fields': [
                                                                {
                                                                    'layout': {
                                                                        'cell': {
                                                                            'key': '0x190000000e000000000000000000000000000000000000000000000000000000',
                                                                            'ty': 10,
                                                                        },
                                                                    },
                                                                    'name': 'header',
                                                                },
                                                                {
                                                                    'layout': {
                                                                        'struct': {
                                                                            'fields': [
                                                                                {
                                                                                    'layout': {
                                                                                        'cell': {
                                                                                            'key': '0x1a0000000e000000000000000000000000000000000000000000000000000000',
                                                                                            'ty': 1,
                                                                                        },
                                                                                    },
                                                                                    'name': 'len',
                                                                                },
                                                                                {
                                                                                    'layout': {
                                                                                        'array': {
                                                                                            'cellsPerElem': 1,
                                                                                            'layout': {
                                                                                                'cell': {
                                                                                                    'key': '0x1a0000000f000000000000000000000000000000000000000000000000000000',
                                                                                                    'ty': 40,
                                                                                                },
                                                                                            },
                                                                                            'len': 4294967295,
                                                                                            'offset': '0x1b0000000e000000000000000000000000000000000000000000000000000000',
                                                                                        },
                                                                                    },
                                                                                    'name': 'elems',
                                                                                },
                                                                            ],
                                                                        },
                                                                    },
                                                                    'name': 'entries',
                                                                },
                                                            ],
                                                        },
                                                    },
                                                    'name': 'keys',
                                                },
                                                {
                                                    'layout': {
                                                        'hash': {
                                                            'layout': {
                                                                'cell': {
                                                                    'key': '0x1b0000000f000000000000000000000000000000000000000000000000000000',
                                                                    'ty': 42,
                                                                },
                                                            },
                                                            'offset': '0x1a0000000f000000000000000000000000000000000000000000000000000000',
                                                            'strategy': {
                                                                'hasher': 'Blake2x256',
                                                                'postfix': '',
                                                                'prefix': '0x696e6b20686173686d6170',
                                                            },
                                                        },
                                                    },
                                                    'name': 'values',
                                                },
                                            ],
                                        },
                                    },
                                    'name': null,
                                },
                            ],
                        },
                    },
                    'name': 'topology_store',
                },
            ],
        },
    },
    'types': [
        {
            'def': {
                'primitive': 'u32',
            },
        },
        {
            'def': {
                'composite': {
                    'fields': [
                        {
                            'name': 'owner_id',
                            'type': 3,
                            'typeName': 'AccountId',
                        },
                        {
                            'name': 'cluster_id',
                            'type': 1,
                            'typeName': 'ClusterId',
                        },
                        {
                            'name': 'flow',
                            'type': 6,
                            'typeName': 'Flow',
                        },
                        {
                            'name': 'resource_reserved',
                            'type': 1,
                            'typeName': 'Resource',
                        },
                        {
                            'name': 'public_availability',
                            'type': 9,
                            'typeName': 'bool',
                        },
                        {
                            'name': 'resource_consumption_cap',
                            'type': 1,
                            'typeName': 'Resource',
                        },
                    ],
                },
            },
            'path': [
                'ddc_bucket',
                'ddc_bucket',
                'bucket',
                'entity',
                'Bucket',
            ],
        },
        {
            'def': {
                'composite': {
                    'fields': [
                        {
                            'type': 4,
                            'typeName': '[u8; 32]',
                        },
                    ],
                },
            },
            'path': [
                'ink_env',
                'types',
                'AccountId',
            ],
        },
        {
            'def': {
                'array': {
                    'len': 32,
                    'type': 5,
                },
            },
        },
        {
            'def': {
                'primitive': 'u8',
            },
        },
        {
            'def': {
                'composite': {
                    'fields': [
                        {
                            'name': 'from',
                            'type': 3,
                            'typeName': 'AccountId',
                        },
                        {
                            'name': 'schedule',
                            'type': 7,
                            'typeName': 'Schedule',
                        },
                    ],
                },
            },
            'path': [
                'ddc_bucket',
                'ddc_bucket',
                'flow',
                'Flow',
            ],
        },
        {
            'def': {
                'composite': {
                    'fields': [
                        {
                            'name': 'rate',
                            'type': 8,
                            'typeName': 'Balance',
                        },
                        {
                            'name': 'offset',
                            'type': 8,
                            'typeName': 'Balance',
                        },
                    ],
                },
            },
            'path': [
                'ddc_bucket',
                'ddc_bucket',
                'schedule',
                'Schedule',
            ],
        },
        {
            'def': {
                'primitive': 'u128',
            },
        },
        {
            'def': {
                'primitive': 'bool',
            },
        },
        {
            'def': {
                'composite': {
                    'fields': [
                        {
                            'name': 'last_vacant',
                            'type': 1,
                            'typeName': 'Index',
                        },
                        {
                            'name': 'len',
                            'type': 1,
                            'typeName': 'u32',
                        },
                        {
                            'name': 'len_entries',
                            'type': 1,
                            'typeName': 'u32',
                        },
                    ],
                },
            },
            'path': [
                'ink_storage',
                'collections',
                'stash',
                'Header',
            ],
        },
        {
            'def': {
                'variant': {
                    'variants': [
                        {
                            'fields': [
                                {
                                    'type': 12,
                                    'typeName': 'VacantEntry',
                                },
                            ],
                            'name': 'Vacant',
                        },
                        {
                            'fields': [
                                {
                                    'type': 1,
                                    'typeName': 'T',
                                },
                            ],
                            'name': 'Occupied',
                        },
                    ],
                },
            },
            'params': [
                1,
            ],
            'path': [
                'ink_storage',
                'collections',
                'stash',
                'Entry',
            ],
        },
        {
            'def': {
                'composite': {
                    'fields': [
                        {
                            'name': 'next',
                            'type': 1,
                            'typeName': 'Index',
                        },
                        {
                            'name': 'prev',
                            'type': 1,
                            'typeName': 'Index',
                        },
                    ],
                },
            },
            'path': [
                'ink_storage',
                'collections',
                'stash',
                'VacantEntry',
            ],
        },
        {
            'def': {
                'composite': {
                    'fields': [
                        {
                            'name': 'value',
                            'type': 14,
                            'typeName': 'V',
                        },
                        {
                            'name': 'key_index',
                            'type': 1,
                            'typeName': 'KeyIndex',
                        },
                    ],
                },
            },
            'params': [
                14,
            ],
            'path': [
                'ink_storage',
                'collections',
                'hashmap',
                'ValueEntry',
            ],
        },
        {
            'def': {
                'sequence': {
                    'type': 3,
                },
            },
        },
        {
            'def': {
                'primitive': 'str',
            },
        },
        {
            'def': {
                'sequence': {
                    'type': 17,
                },
            },
        },
        {
            'def': {
                'composite': {
                    'fields': [
                        {
                            'name': 'manager_id',
                            'type': 3,
                            'typeName': 'AccountId',
                        },
                        {
                            'name': 'resource_per_vnode',
                            'type': 1,
                            'typeName': 'Resource',
                        },
                        {
                            'name': 'resource_used',
                            'type': 1,
                            'typeName': 'Resource',
                        },
                        {
                            'name': 'revenues',
                            'type': 18,
                            'typeName': 'Cash',
                        },
                        {
                            'name': 'node_ids',
                            'type': 19,
                            'typeName': 'Vec<NodeId>',
                        },
                        {
                            'name': 'v_nodes',
                            'type': 20,
                            'typeName': 'Vec<Vec<u64>>',
                        },
                        {
                            'name': 'total_rent',
                            'type': 8,
                            'typeName': 'Balance',
                        },
                    ],
                },
            },
            'path': [
                'ddc_bucket',
                'ddc_bucket',
                'cluster',
                'entity',
                'Cluster',
            ],
        },
        {
            'def': {
                'composite': {
                    'fields': [
                        {
                            'name': 'value',
                            'type': 8,
                            'typeName': 'Balance',
                        },
                    ],
                },
            },
            'path': [
                'ddc_bucket',
                'ddc_bucket',
                'cash',
                'Cash',
            ],
        },
        {
            'def': {
                'sequence': {
                    'type': 1,
                },
            },
        },
        {
            'def': {
                'sequence': {
                    'type': 21,
                },
            },
        },
        {
            'def': {
                'sequence': {
                    'type': 22,
                },
            },
        },
        {
            'def': {
                'primitive': 'u64',
            },
        },
        {
            'def': {
                'composite': {
                    'fields': [
                        {
                            'name': 'manager_id',
                            'type': 3,
                            'typeName': 'AccountId',
                        },
                        {
                            'name': 'cdn_nodes',
                            'type': 19,
                            'typeName': 'Vec<NodeId>',
                        },
                        {
                            'name': 'resources_used',
                            'type': 1,
                            'typeName': 'Resource',
                        },
                        {
                            'name': 'revenues',
                            'type': 18,
                            'typeName': 'Cash',
                        },
                        {
                            'name': 'usd_per_gb',
                            'type': 8,
                            'typeName': 'Balance',
                        },
                    ],
                },
            },
            'path': [
                'ddc_bucket',
                'ddc_bucket',
                'cdn_cluster',
                'entity',
                'CdnCluster',
            ],
        },
        {
            'def': {
                'composite': {
                    'fields': [
                        {
                            'name': 'provider_id',
                            'type': 3,
                            'typeName': 'ProviderId',
                        },
                        {
                            'name': 'undistributed_payment',
                            'type': 8,
                            'typeName': 'Balance',
                        },
                    ],
                },
            },
            'path': [
                'ddc_bucket',
                'ddc_bucket',
                'cdn_node',
                'entity',
                'CdnNode',
            ],
        },
        {
            'def': {
                'composite': {
                    'fields': [
                        {
                            'name': 'provider_id',
                            'type': 3,
                            'typeName': 'ProviderId',
                        },
                        {
                            'name': 'rent_per_month',
                            'type': 8,
                            'typeName': 'Balance',
                        },
                        {
                            'name': 'free_resource',
                            'type': 1,
                            'typeName': 'Resource',
                        },
                        {
                            'name': 'node_tag',
                            'type': 26,
                            'typeName': 'NodeTag',
                        },
                    ],
                },
            },
            'path': [
                'ddc_bucket',
                'ddc_bucket',
                'node',
                'entity',
                'Node',
            ],
        },
        {
            'def': {
                'variant': {
                    'variants': [
                        {
                            'discriminant': 0,
                            'name': 'ACTIVE',
                        },
                        {
                            'discriminant': 1,
                            'name': 'ADDING',
                        },
                        {
                            'discriminant': 2,
                            'name': 'DELETING',
                        },
                        {
                            'discriminant': 3,
                            'name': 'OFFLINE',
                        },
                    ],
                },
            },
            'path': [
                'ddc_bucket',
                'ddc_bucket',
                'node',
                'entity',
                'NodeTag',
            ],
        },
        {
            'def': {
                'variant': {
                    'variants': [
                        {
                            'fields': [
                                {
                                    'type': 12,
                                    'typeName': 'VacantEntry',
                                },
                            ],
                            'name': 'Vacant',
                        },
                        {
                            'fields': [
                                {
                                    'type': 3,
                                    'typeName': 'T',
                                },
                            ],
                            'name': 'Occupied',
                        },
                    ],
                },
            },
            'params': [
                3,
            ],
            'path': [
                'ink_storage',
                'collections',
                'stash',
                'Entry',
            ],
        },
        {
            'def': {
                'composite': {
                    'fields': [
                        {
                            'name': 'value',
                            'type': 29,
                            'typeName': 'V',
                        },
                        {
                            'name': 'key_index',
                            'type': 1,
                            'typeName': 'KeyIndex',
                        },
                    ],
                },
            },
            'params': [
                29,
            ],
            'path': [
                'ink_storage',
                'collections',
                'hashmap',
                'ValueEntry',
            ],
        },
        {
            'def': {
                'composite': {
                    'fields': [
                        {
                            'name': 'deposit',
                            'type': 18,
                            'typeName': 'Cash',
                        },
                        {
                            'name': 'bonded',
                            'type': 18,
                            'typeName': 'Cash',
                        },
                        {
                            'name': 'negative',
                            'type': 18,
                            'typeName': 'Cash',
                        },
                        {
                            'name': 'unbonded_amount',
                            'type': 18,
                            'typeName': 'Cash',
                        },
                        {
                            'name': 'unbonded_timestamp',
                            'type': 22,
                            'typeName': 'u64',
                        },
                        {
                            'name': 'payable_schedule',
                            'type': 7,
                            'typeName': 'Schedule',
                        },
                    ],
                },
            },
            'path': [
                'ddc_bucket',
                'ddc_bucket',
                'account',
                'entity',
                'Account',
            ],
        },
        {
            'def': {
                'variant': {
                    'variants': [
                        {
                            'fields': [
                                {
                                    'type': 12,
                                    'typeName': 'VacantEntry',
                                },
                            ],
                            'name': 'Vacant',
                        },
                        {
                            'fields': [
                                {
                                    'type': 31,
                                    'typeName': 'T',
                                },
                            ],
                            'name': 'Occupied',
                        },
                    ],
                },
            },
            'params': [
                31,
            ],
            'path': [
                'ink_storage',
                'collections',
                'stash',
                'Entry',
            ],
        },
        {
            'def': {
                'sequence': {
                    'type': 5,
                },
            },
        },
        {
            'def': {
                'composite': {
                    'fields': [
                        {
                            'name': 'value',
                            'type': 9,
                            'typeName': 'V',
                        },
                        {
                            'name': 'key_index',
                            'type': 1,
                            'typeName': 'KeyIndex',
                        },
                    ],
                },
            },
            'params': [
                9,
            ],
            'path': [
                'ink_storage',
                'collections',
                'hashmap',
                'ValueEntry',
            ],
        },
        {
            'def': {
                'composite': {
                    'fields': [
                        {
                            'name': 'value',
                            'type': 34,
                            'typeName': 'V',
                        },
                        {
                            'name': 'key_index',
                            'type': 1,
                            'typeName': 'KeyIndex',
                        },
                    ],
                },
            },
            'params': [
                34,
            ],
            'path': [
                'ink_storage',
                'collections',
                'hashmap',
                'ValueEntry',
            ],
        },
        {
            'def': {
                'sequence': {
                    'type': 35,
                },
            },
        },
        {
            'def': {
                'tuple': [
                    1,
                    36,
                ],
            },
        },
        {
            'def': {
                'composite': {
                    'fields': [
                        {
                            'name': 'hash',
                            'type': 37,
                            'typeName': 'Hash',
                        },
                        {
                            'name': 'total_logs',
                            'type': 8,
                            'typeName': 'u128',
                        },
                        {
                            'name': 'from_timestamp',
                            'type': 22,
                            'typeName': 'u64',
                        },
                        {
                            'name': 'to_timestamp',
                            'type': 22,
                            'typeName': 'u64',
                        },
                    ],
                },
            },
            'path': [
                'ddc_bucket',
                'ddc_bucket',
                'committer',
                'store',
                'Commit',
            ],
        },
        {
            'def': {
                'composite': {
                    'fields': [
                        {
                            'type': 4,
                            'typeName': '[u8; 32]',
                        },
                    ],
                },
            },
            'path': [
                'ink_env',
                'types',
                'Hash',
            ],
        },
        {
            'def': {
                'composite': {
                    'fields': [
                        {
                            'name': 'value',
                            'type': 39,
                            'typeName': 'V',
                        },
                        {
                            'name': 'key_index',
                            'type': 1,
                            'typeName': 'KeyIndex',
                        },
                    ],
                },
            },
            'params': [
                39,
            ],
            'path': [
                'ink_storage',
                'collections',
                'hashmap',
                'ValueEntry',
            ],
        },
        {
            'def': {
                'tuple': [
                    22,
                    22,
                ],
            },
        },
        {
            'def': {
                'variant': {
                    'variants': [
                        {
                            'fields': [
                                {
                                    'type': 12,
                                    'typeName': 'VacantEntry',
                                },
                            ],
                            'name': 'Vacant',
                        },
                        {
                            'fields': [
                                {
                                    'type': 41,
                                    'typeName': 'T',
                                },
                            ],
                            'name': 'Occupied',
                        },
                    ],
                },
            },
            'params': [
                41,
            ],
            'path': [
                'ink_storage',
                'collections',
                'stash',
                'Entry',
            ],
        },
        {
            'def': {
                'tuple': [
                    1,
                    22,
                ],
            },
        },
        {
            'def': {
                'composite': {
                    'fields': [
                        {
                            'name': 'value',
                            'type': 1,
                            'typeName': 'V',
                        },
                        {
                            'name': 'key_index',
                            'type': 1,
                            'typeName': 'KeyIndex',
                        },
                    ],
                },
            },
            'params': [
                1,
            ],
            'path': [
                'ink_storage',
                'collections',
                'hashmap',
                'ValueEntry',
            ],
        },
        {
            'def': {
                'variant': {
                    'variants': [
                        {
                            'name': 'None',
                        },
                        {
                            'fields': [
                                {
                                    'type': 3,
                                    'typeName': 'T',
                                },
                            ],
                            'name': 'Some',
                        },
                    ],
                },
            },
            'params': [
                3,
            ],
            'path': [
                'Option',
            ],
        },
        {
            'def': {
                'tuple': [],
            },
        },
        {
            'def': {
                'variant': {
                    'variants': [
                        {
                            'fields': [
                                {
                                    'type': 46,
                                    'typeName': 'T',
                                },
                            ],
                            'name': 'Ok',
                        },
                        {
                            'fields': [
                                {
                                    'type': 48,
                                    'typeName': 'E',
                                },
                            ],
                            'name': 'Err',
                        },
                    ],
                },
            },
            'params': [
                46,
                48,
            ],
            'path': [
                'Result',
            ],
        },
        {
            'def': {
                'composite': {
                    'fields': [
                        {
                            'name': 'bucket_id',
                            'type': 1,
                            'typeName': 'BucketId',
                        },
                        {
                            'name': 'bucket',
                            'type': 47,
                            'typeName': 'BucketInStatus',
                        },
                        {
                            'name': 'params',
                            'type': 15,
                            'typeName': 'BucketParams',
                        },
                        {
                            'name': 'writer_ids',
                            'type': 14,
                            'typeName': 'Vec<AccountId>',
                        },
                        {
                            'name': 'reader_ids',
                            'type': 14,
                            'typeName': 'Vec<AccountId>',
                        },
                        {
                            'name': 'rent_covered_until_ms',
                            'type': 22,
                            'typeName': 'u64',
                        },
                    ],
                },
            },
            'path': [
                'ddc_bucket',
                'ddc_bucket',
                'bucket',
                'entity',
                'BucketStatus',
            ],
        },
        {
            'def': {
                'composite': {
                    'fields': [
                        {
                            'name': 'owner_id',
                            'type': 3,
                            'typeName': 'AccountId',
                        },
                        {
                            'name': 'cluster_id',
                            'type': 1,
                            'typeName': 'ClusterId',
                        },
                        {
                            'name': 'resource_reserved',
                            'type': 1,
                            'typeName': 'Resource',
                        },
                        {
                            'name': 'public_availability',
                            'type': 9,
                            'typeName': 'bool',
                        },
                        {
                            'name': 'resource_consumption_cap',
                            'type': 1,
                            'typeName': 'Resource',
                        },
                    ],
                },
            },
            'path': [
                'ddc_bucket',
                'ddc_bucket',
                'bucket',
                'entity',
                'BucketInStatus',
            ],
        },
        {
            'def': {
                'variant': {
                    'variants': [
                        {
                            'discriminant': 0,
                            'name': 'BucketDoesNotExist',
                        },
                        {
                            'discriminant': 1,
                            'name': 'ClusterDoesNotExist',
                        },
                        {
                            'discriminant': 2,
                            'name': 'ParamsTooBig',
                        },
                        {
                            'discriminant': 3,
                            'name': 'VNodeDoesNotExist',
                        },
                        {
                            'discriminant': 4,
                            'name': 'BondingPeriodNotFinished',
                        },
                        {
                            'discriminant': 5,
                            'name': 'BucketClusterAlreadyConnected',
                        },
                        {
                            'discriminant': 6,
                            'name': 'BucketClusterNotSetup',
                        },
                        {
                            'discriminant': 7,
                            'name': 'NodeDoesNotExist',
                        },
                        {
                            'discriminant': 8,
                            'name': 'FlowDoesNotExist',
                        },
                        {
                            'discriminant': 9,
                            'name': 'AccountDoesNotExist',
                        },
                        {
                            'discriminant': 10,
                            'name': 'ParamsDoesNotExist',
                        },
                        {
                            'discriminant': 11,
                            'name': 'UnauthorizedProvider',
                        },
                        {
                            'discriminant': 12,
                            'name': 'UnauthorizedOwner',
                        },
                        {
                            'discriminant': 13,
                            'name': 'UnauthorizedClusterManager',
                        },
                        {
                            'discriminant': 14,
                            'name': 'ClusterManagerIsNotTrusted',
                        },
                        {
                            'discriminant': 15,
                            'name': 'TransferFailed',
                        },
                        {
                            'discriminant': 16,
                            'name': 'InsufficientBalance',
                        },
                        {
                            'discriminant': 17,
                            'name': 'InsufficientResources',
                        },
                        {
                            'discriminant': 18,
                            'name': 'Unauthorized',
                        },
                        {
                            'discriminant': 19,
                            'name': 'UnknownNode',
                        },
                    ],
                },
            },
            'path': [
                'ddc_bucket',
                'ddc_bucket',
                'Error',
            ],
        },
        {
            'def': {
                'tuple': [
                    50,
                    1,
                ],
            },
        },
        {
            'def': {
                'sequence': {
                    'type': 46,
                },
            },
        },
        {
            'def': {
                'sequence': {
                    'type': 2,
                },
            },
        },
        {
            'def': {
                'variant': {
                    'variants': [
                        {
                            'fields': [
                                {
                                    'type': 53,
                                    'typeName': 'T',
                                },
                            ],
                            'name': 'Ok',
                        },
                        {
                            'fields': [
                                {
                                    'type': 48,
                                    'typeName': 'E',
                                },
                            ],
                            'name': 'Err',
                        },
                    ],
                },
            },
            'params': [
                53,
                48,
            ],
            'path': [
                'Result',
            ],
        },
        {
            'def': {
                'composite': {
                    'fields': [
                        {
                            'name': 'cluster_id',
                            'type': 1,
                            'typeName': 'ClusterId',
                        },
                        {
                            'name': 'cluster',
                            'type': 17,
                            'typeName': 'Cluster',
                        },
                        {
                            'name': 'params',
                            'type': 15,
                            'typeName': 'Params',
                        },
                    ],
                },
            },
            'path': [
                'ddc_bucket',
                'ddc_bucket',
                'cluster',
                'entity',
                'ClusterStatus',
            ],
        },
        {
            'def': {
                'tuple': [
                    55,
                    1,
                ],
            },
        },
        {
            'def': {
                'sequence': {
                    'type': 53,
                },
            },
        },
        {
            'def': {
                'sequence': {
                    'type': 57,
                },
            },
        },
        {
            'def': {
                'tuple': [
                    3,
                    8,
                ],
            },
        },
        {
            'def': {
                'sequence': {
                    'type': 59,
                },
            },
        },
        {
            'def': {
                'tuple': [
                    1,
                    8,
                ],
            },
        },
        {
            'def': {
                'sequence': {
                    'type': 61,
                },
            },
        },
        {
            'def': {
                'tuple': [
                    1,
                    1,
                ],
            },
        },
        {
            'def': {
                'variant': {
                    'variants': [
                        {
                            'fields': [
                                {
                                    'type': 63,
                                    'typeName': 'T',
                                },
                            ],
                            'name': 'Ok',
                        },
                        {
                            'fields': [
                                {
                                    'type': 48,
                                    'typeName': 'E',
                                },
                            ],
                            'name': 'Err',
                        },
                    ],
                },
            },
            'params': [
                63,
                48,
            ],
            'path': [
                'Result',
            ],
        },
        {
            'def': {
                'composite': {
                    'fields': [
                        {
                            'name': 'cluster_id',
                            'type': 1,
                            'typeName': 'ClusterId',
                        },
                        {
                            'name': 'cluster',
                            'type': 23,
                            'typeName': 'CdnCluster',
                        },
                    ],
                },
            },
            'path': [
                'ddc_bucket',
                'ddc_bucket',
                'cdn_cluster',
                'entity',
                'CdnClusterStatus',
            ],
        },
        {
            'def': {
                'tuple': [
                    65,
                    1,
                ],
            },
        },
        {
            'def': {
                'sequence': {
                    'type': 63,
                },
            },
        },
        {
            'def': {
                'composite': {
                    'fields': [
                        {
                            'name': 'start',
                            'type': 22,
                            'typeName': 'u64',
                        },
                        {
                            'name': 'interval',
                            'type': 22,
                            'typeName': 'u64',
                        },
                        {
                            'name': 'commit_duration',
                            'type': 22,
                            'typeName': 'u64',
                        },
                        {
                            'name': 'validation_duration',
                            'type': 22,
                            'typeName': 'u64',
                        },
                    ],
                },
            },
            'path': [
                'ddc_bucket',
                'ddc_bucket',
                'committer',
                'store',
                'EraConfig',
            ],
        },
        {
            'def': {
                'composite': {
                    'fields': [
                        {
                            'name': 'current_era',
                            'type': 22,
                            'typeName': 'u64',
                        },
                        {
                            'name': 'current_phase',
                            'type': 68,
                            'typeName': 'Phase',
                        },
                        {
                            'name': 'previous_era',
                            'type': 22,
                            'typeName': 'u64',
                        },
                        {
                            'name': 'prev_era_from_timestamp',
                            'type': 22,
                            'typeName': 'u64',
                        },
                        {
                            'name': 'prev_era_to_timestamp',
                            'type': 22,
                            'typeName': 'u64',
                        },
                    ],
                },
            },
            'path': [
                'ddc_bucket',
                'ddc_bucket',
                'committer',
                'store',
                'EraStatus',
            ],
        },
        {
            'def': {
                'variant': {
                    'variants': [
                        {
                            'discriminant': 0,
                            'name': 'Commit',
                        },
                        {
                            'discriminant': 1,
                            'name': 'Valiadation',
                        },
                        {
                            'discriminant': 2,
                            'name': 'Payout',
                        },
                    ],
                },
            },
            'path': [
                'ddc_bucket',
                'ddc_bucket',
                'committer',
                'store',
                'Phase',
            ],
        },
        {
            'def': {
                'variant': {
                    'variants': [
                        {
                            'fields': [
                                {
                                    'type': 70,
                                    'typeName': 'T',
                                },
                            ],
                            'name': 'Ok',
                        },
                        {
                            'fields': [
                                {
                                    'type': 48,
                                    'typeName': 'E',
                                },
                            ],
                            'name': 'Err',
                        },
                    ],
                },
            },
            'params': [
                70,
                48,
            ],
            'path': [
                'Result',
            ],
        },
        {
            'def': {
                'composite': {
                    'fields': [
                        {
                            'name': 'node_id',
                            'type': 1,
                            'typeName': 'NodeId',
                        },
                        {
                            'name': 'node',
                            'type': 24,
                            'typeName': 'CdnNode',
                        },
                        {
                            'name': 'params',
                            'type': 15,
                            'typeName': 'Params',
                        },
                    ],
                },
            },
            'path': [
                'ddc_bucket',
                'ddc_bucket',
                'cdn_node',
                'entity',
                'CdnNodeStatus',
            ],
        },
        {
            'def': {
                'tuple': [
                    72,
                    1,
                ],
            },
        },
        {
            'def': {
                'sequence': {
                    'type': 70,
                },
            },
        },
        {
            'def': {
                'variant': {
                    'variants': [
                        {
                            'fields': [
                                {
                                    'type': 74,
                                    'typeName': 'T',
                                },
                            ],
                            'name': 'Ok',
                        },
                        {
                            'fields': [
                                {
                                    'type': 48,
                                    'typeName': 'E',
                                },
                            ],
                            'name': 'Err',
                        },
                    ],
                },
            },
            'params': [
                74,
                48,
            ],
            'path': [
                'Result',
            ],
        },
        {
            'def': {
                'composite': {
                    'fields': [
                        {
                            'name': 'node_id',
                            'type': 1,
                            'typeName': 'NodeId',
                        },
                        {
                            'name': 'node',
                            'type': 25,
                            'typeName': 'Node',
                        },
                        {
                            'name': 'params',
                            'type': 15,
                            'typeName': 'Params',
                        },
                    ],
                },
            },
            'path': [
                'ddc_bucket',
                'ddc_bucket',
                'node',
                'entity',
                'NodeStatus',
            ],
        },
        {
            'def': {
                'tuple': [
                    76,
                    1,
                ],
            },
        },
        {
            'def': {
                'sequence': {
                    'type': 74,
                },
            },
        },
        {
            'def': {
                'variant': {
                    'variants': [
                        {
                            'fields': [
                                {
                                    'type': 29,
                                    'typeName': 'T',
                                },
                            ],
                            'name': 'Ok',
                        },
                        {
                            'fields': [
                                {
                                    'type': 48,
                                    'typeName': 'E',
                                },
                            ],
                            'name': 'Err',
                        },
                    ],
                },
            },
            'params': [
                29,
                48,
            ],
            'path': [
                'Result',
            ],
        },
        {
            'def': {
                'variant': {
                    'variants': [
                        {
                            'fields': [
                                {
                                    'type': 3,
                                    'typeName': 'AccountId',
                                },
                            ],
                            'name': 'ManagerTrustedBy',
                        },
                        {
                            'name': 'SetExchangeRate',
                        },
                        {
                            'name': 'SuperAdmin',
                        },
                    ],
                },
            },
            'path': [
                'ddc_bucket',
                'ddc_bucket',
                'perm',
                'entity',
                'Permission',
            ],
        },
        {
            'def': {
                'composite': {
                    'fields': [
                        {
                            'name': 'network_fee_bp',
                            'type': 8,
                            'typeName': 'BasisPoints',
                        },
                        {
                            'name': 'network_fee_destination',
                            'type': 3,
                            'typeName': 'AccountId',
                        },
                        {
                            'name': 'cluster_management_fee_bp',
                            'type': 8,
                            'typeName': 'BasisPoints',
                        },
                    ],
                },
            },
            'path': [
                'ddc_bucket',
                'ddc_bucket',
                'network_fee',
                'FeeConfig',
            ],
        },
    ],
};

export type ContractAbi = typeof ddcBucketAbi;
