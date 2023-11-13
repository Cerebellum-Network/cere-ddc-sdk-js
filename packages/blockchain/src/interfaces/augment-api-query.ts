// Auto-generated via `yarn polkadot-types-from-chain`, do not edit
/* eslint-disable */

// import type lookup before we augment - in some environments
// this is required to allow for ambient/previous definitions
import '@polkadot/api-base/types/storage';

import type {ApiTypes, AugmentedQuery, QueryableStorageEntry} from '@polkadot/api-base/types';
import type {Data} from '@polkadot/types';
import type {
    BTreeMap,
    Bytes,
    Option,
    U256,
    U8aFixed,
    Vec,
    WrapperKeepOpaque,
    WrapperOpaque,
    bool,
    u128,
    u32,
    u64,
    u8,
} from '@polkadot/types-codec';
import type {AnyNumber, IMethod, ITuple} from '@polkadot/types-codec/types';
import type {AccountId32, Call, H160, H256, Perbill, Percent} from '@polkadot/types/interfaces/runtime';
import type {Observable} from '@polkadot/types/types';
import {
    CereDevRuntimeSessionKeys,
    DdcPrimitivesNodePubKey,
    FrameSupportDispatchPerDispatchClassWeight,
    FrameSystemAccountInfo,
    FrameSystemEventRecord,
    FrameSystemLastRuntimeUpgradeInfo,
    FrameSystemPhase,
    PalletAuthorshipUncleEntryItem,
    PalletBagsListListBag,
    PalletBagsListListNode,
    PalletBalancesAccountData,
    PalletBalancesBalanceLock,
    PalletBalancesReleases,
    PalletBalancesReserveData,
    PalletBountiesBounty,
    PalletChainbridgeProposalVotes,
    PalletChildBountiesChildBounty,
    PalletCollectiveVotes,
    PalletContractsStorageContractInfo,
    PalletContractsStorageDeletedContract,
    PalletContractsWasmOwnerInfo,
    PalletContractsWasmPrefabWasmModule,
    PalletDdcClustersCluster,
    PalletDdcClustersClusterClusterGovParams,
    PalletDdcCustomersAccountsLedger,
    PalletDdcCustomersBucket,
    PalletDdcNodesCdnNode,
    PalletDdcNodesStorageNode,
    PalletDdcStakingStakingLedger,
    PalletDemocracyPreimageStatus,
    PalletDemocracyReferendumInfo,
    PalletDemocracyReleases,
    PalletDemocracyVoteThreshold,
    PalletDemocracyVoteVoting,
    PalletElectionProviderMultiPhasePhase,
    PalletElectionProviderMultiPhaseReadySolution,
    PalletElectionProviderMultiPhaseRoundSnapshot,
    PalletElectionProviderMultiPhaseSignedSignedSubmission,
    PalletElectionProviderMultiPhaseSolutionOrSnapshotSize,
    PalletElectionsPhragmenSeatHolder,
    PalletElectionsPhragmenVoter,
    PalletErc721Erc721Token,
    PalletFastUnstakeUnstakeRequest,
    PalletGrandpaStoredPendingChange,
    PalletGrandpaStoredState,
    PalletIdentityRegistrarInfo,
    PalletIdentityRegistration,
    PalletImOnlineBoundedOpaqueNetworkState,
    PalletImOnlineSr25519AppSr25519Public,
    PalletMultisigMultisig,
    PalletNominationPoolsBondedPoolInner,
    PalletNominationPoolsPoolMember,
    PalletNominationPoolsRewardPool,
    PalletNominationPoolsSubPools,
    PalletProxyAnnouncement,
    PalletProxyProxyDefinition,
    PalletRecoveryActiveRecovery,
    PalletRecoveryRecoveryConfig,
    PalletSchedulerScheduledV3,
    PalletSocietyBid,
    PalletSocietyBidKind,
    PalletSocietyVote,
    PalletSocietyVouchingStatus,
    PalletStakingActiveEraInfo,
    PalletStakingEraRewardPoints,
    PalletStakingExposure,
    PalletStakingForcing,
    PalletStakingNominations,
    PalletStakingReleases,
    PalletStakingRewardDestination,
    PalletStakingSlashingSlashingSpans,
    PalletStakingSlashingSpanRecord,
    PalletStakingStakingLedger,
    PalletStakingUnappliedSlash,
    PalletStakingValidatorPrefs,
    PalletTipsOpenTip,
    PalletTransactionPaymentReleases,
    PalletTreasuryProposal,
    PalletVestingReleases,
    PalletVestingVestingInfo,
    SpAuthorityDiscoveryAppPublic,
    SpConsensusBabeAppPublic,
    SpConsensusBabeBabeEpochConfiguration,
    SpConsensusBabeDigestsNextConfigDescriptor,
    SpConsensusBabeDigestsPreDigest,
    SpCoreCryptoKeyTypeId,
    SpNposElectionsElectionScore,
    SpRuntimeDigest,
    SpStakingOffenceOffenceDetails,
} from '@polkadot/types/lookup';

export type __AugmentedQuery<ApiType extends ApiTypes> = AugmentedQuery<ApiType, () => unknown>;
export type __QueryableStorageEntry<ApiType extends ApiTypes> = QueryableStorageEntry<ApiType>;

declare module '@polkadot/api-base/types/storage' {
    interface AugmentedQueries<ApiType extends ApiTypes> {
        authorityDiscovery: {
            /**
             * Keys of the current authority set.
             **/
            keys: AugmentedQuery<ApiType, () => Observable<Vec<SpAuthorityDiscoveryAppPublic>>, []>;
            /**
             * Keys of the next authority set.
             **/
            nextKeys: AugmentedQuery<ApiType, () => Observable<Vec<SpAuthorityDiscoveryAppPublic>>, []>;
        };
        authorship: {
            /**
             * Author of current block.
             **/
            author: AugmentedQuery<ApiType, () => Observable<Option<AccountId32>>, []>;
            /**
             * Whether uncles were already set in this block.
             **/
            didSetUncles: AugmentedQuery<ApiType, () => Observable<bool>, []>;
            /**
             * Uncles
             **/
            uncles: AugmentedQuery<ApiType, () => Observable<Vec<PalletAuthorshipUncleEntryItem>>, []>;
        };
        babe: {
            /**
             * Current epoch authorities.
             **/
            authorities: AugmentedQuery<ApiType, () => Observable<Vec<ITuple<[SpConsensusBabeAppPublic, u64]>>>, []>;
            /**
             * This field should always be populated during block processing unless
             * secondary plain slots are enabled (which don't contain a VRF output).
             *
             * It is set in `on_finalize`, before it will contain the value from the last block.
             **/
            authorVrfRandomness: AugmentedQuery<ApiType, () => Observable<Option<U8aFixed>>, []>;
            /**
             * Current slot number.
             **/
            currentSlot: AugmentedQuery<ApiType, () => Observable<u64>, []>;
            /**
             * The configuration for the current epoch. Should never be `None` as it is initialized in
             * genesis.
             **/
            epochConfig: AugmentedQuery<ApiType, () => Observable<Option<SpConsensusBabeBabeEpochConfiguration>>, []>;
            /**
             * Current epoch index.
             **/
            epochIndex: AugmentedQuery<ApiType, () => Observable<u64>, []>;
            /**
             * The block numbers when the last and current epoch have started, respectively `N-1` and
             * `N`.
             * NOTE: We track this is in order to annotate the block number when a given pool of
             * entropy was fixed (i.e. it was known to chain observers). Since epochs are defined in
             * slots, which may be skipped, the block numbers may not line up with the slot numbers.
             **/
            epochStart: AugmentedQuery<ApiType, () => Observable<ITuple<[u32, u32]>>, []>;
            /**
             * The slot at which the first epoch actually started. This is 0
             * until the first block of the chain.
             **/
            genesisSlot: AugmentedQuery<ApiType, () => Observable<u64>, []>;
            /**
             * Temporary value (cleared at block finalization) which is `Some`
             * if per-block initialization has already been called for current block.
             **/
            initialized: AugmentedQuery<ApiType, () => Observable<Option<Option<SpConsensusBabeDigestsPreDigest>>>, []>;
            /**
             * How late the current block is compared to its parent.
             *
             * This entry is populated as part of block execution and is cleaned up
             * on block finalization. Querying this storage entry outside of block
             * execution context should always yield zero.
             **/
            lateness: AugmentedQuery<ApiType, () => Observable<u32>, []>;
            /**
             * Next epoch authorities.
             **/
            nextAuthorities: AugmentedQuery<
                ApiType,
                () => Observable<Vec<ITuple<[SpConsensusBabeAppPublic, u64]>>>,
                []
            >;
            /**
             * The configuration for the next epoch, `None` if the config will not change
             * (you can fallback to `EpochConfig` instead in that case).
             **/
            nextEpochConfig: AugmentedQuery<
                ApiType,
                () => Observable<Option<SpConsensusBabeBabeEpochConfiguration>>,
                []
            >;
            /**
             * Next epoch randomness.
             **/
            nextRandomness: AugmentedQuery<ApiType, () => Observable<U8aFixed>, []>;
            /**
             * Pending epoch configuration change that will be applied when the next epoch is enacted.
             **/
            pendingEpochConfigChange: AugmentedQuery<
                ApiType,
                () => Observable<Option<SpConsensusBabeDigestsNextConfigDescriptor>>,
                []
            >;
            /**
             * The epoch randomness for the *current* epoch.
             *
             * # Security
             *
             * This MUST NOT be used for gambling, as it can be influenced by a
             * malicious validator in the short term. It MAY be used in many
             * cryptographic protocols, however, so long as one remembers that this
             * (like everything else on-chain) it is public. For example, it can be
             * used where a number is needed that cannot have been chosen by an
             * adversary, for purposes such as public-coin zero-knowledge proofs.
             **/
            randomness: AugmentedQuery<ApiType, () => Observable<U8aFixed>, []>;
            /**
             * Randomness under construction.
             *
             * We make a trade-off between storage accesses and list length.
             * We store the under-construction randomness in segments of up to
             * `UNDER_CONSTRUCTION_SEGMENT_LENGTH`.
             *
             * Once a segment reaches this length, we begin the next one.
             * We reset all segments and return to `0` at the beginning of every
             * epoch.
             **/
            segmentIndex: AugmentedQuery<ApiType, () => Observable<u32>, []>;
            /**
             * TWOX-NOTE: `SegmentIndex` is an increasing integer, so this is okay.
             **/
            underConstruction: AugmentedQuery<
                ApiType,
                (arg: u32 | AnyNumber | Uint8Array) => Observable<Vec<U8aFixed>>,
                [u32]
            >;
        };
        balances: {
            /**
             * The Balances pallet example of storing the balance of an account.
             *
             * # Example
             *
             * ```nocompile
             * impl pallet_balances::Config for Runtime {
             * type AccountStore = StorageMapShim<Self::Account<Runtime>, frame_system::Provider<Runtime>, AccountId, Self::AccountData<Balance>>
             * }
             * ```
             *
             * You can also store the balance of an account in the `System` pallet.
             *
             * # Example
             *
             * ```nocompile
             * impl pallet_balances::Config for Runtime {
             * type AccountStore = System
             * }
             * ```
             *
             * But this comes with tradeoffs, storing account balances in the system pallet stores
             * `frame_system` data alongside the account data contrary to storing account balances in the
             * `Balances` pallet, which uses a `StorageMap` to store balances data only.
             * NOTE: This is only used in the case that this pallet is used to store balances.
             **/
            account: AugmentedQuery<
                ApiType,
                (arg: AccountId32 | string | Uint8Array) => Observable<PalletBalancesAccountData>,
                [AccountId32]
            >;
            /**
             * Any liquidity locks on some account balances.
             * NOTE: Should only be accessed when setting, changing and freeing a lock.
             **/
            locks: AugmentedQuery<
                ApiType,
                (arg: AccountId32 | string | Uint8Array) => Observable<Vec<PalletBalancesBalanceLock>>,
                [AccountId32]
            >;
            /**
             * Named reserves on some account balances.
             **/
            reserves: AugmentedQuery<
                ApiType,
                (arg: AccountId32 | string | Uint8Array) => Observable<Vec<PalletBalancesReserveData>>,
                [AccountId32]
            >;
            /**
             * Storage version of the pallet.
             *
             * This is set to v2.0.0 for new networks.
             **/
            storageVersion: AugmentedQuery<ApiType, () => Observable<PalletBalancesReleases>, []>;
            /**
             * The total units issued in the system.
             **/
            totalIssuance: AugmentedQuery<ApiType, () => Observable<u128>, []>;
        };
        bounties: {
            /**
             * Bounties that have been made.
             **/
            bounties: AugmentedQuery<
                ApiType,
                (arg: u32 | AnyNumber | Uint8Array) => Observable<Option<PalletBountiesBounty>>,
                [u32]
            >;
            /**
             * Bounty indices that have been approved but not yet funded.
             **/
            bountyApprovals: AugmentedQuery<ApiType, () => Observable<Vec<u32>>, []>;
            /**
             * Number of bounty proposals that have been made.
             **/
            bountyCount: AugmentedQuery<ApiType, () => Observable<u32>, []>;
            /**
             * The description of each bounty.
             **/
            bountyDescriptions: AugmentedQuery<
                ApiType,
                (arg: u32 | AnyNumber | Uint8Array) => Observable<Option<Bytes>>,
                [u32]
            >;
        };
        cereDDCModule: {
            /**
             * The lookup table for string.
             **/
            stringDataOf: AugmentedQuery<
                ApiType,
                (arg: AccountId32 | string | Uint8Array) => Observable<Option<Bytes>>,
                [AccountId32]
            >;
        };
        chainBridge: {
            /**
             * All whitelisted chains and their respective transaction counts
             **/
            chainNonces: AugmentedQuery<ApiType, (arg: u8 | AnyNumber | Uint8Array) => Observable<Option<u64>>, [u8]>;
            /**
             * Number of relayers in set
             **/
            relayerCount: AugmentedQuery<ApiType, () => Observable<u32>, []>;
            /**
             * Tracks current relayer set
             **/
            relayers: AugmentedQuery<
                ApiType,
                (arg: AccountId32 | string | Uint8Array) => Observable<bool>,
                [AccountId32]
            >;
            /**
             * Number of votes required for a proposal to execute
             **/
            relayerThreshold: AugmentedQuery<ApiType, () => Observable<u32>, []>;
            /**
             * Utilized by the bridge software to map resource IDs to actual methods
             **/
            resources: AugmentedQuery<
                ApiType,
                (arg: U8aFixed | string | Uint8Array) => Observable<Option<Bytes>>,
                [U8aFixed]
            >;
            /**
             * All known proposals.
             * The key is the hash of the call and the deposit ID, to ensure it's unique.
             **/
            votes: AugmentedQuery<
                ApiType,
                (
                    arg1: u8 | AnyNumber | Uint8Array,
                    arg2: ITuple<[u64, Call]> | [u64 | AnyNumber | Uint8Array, Call | IMethod | string | Uint8Array],
                ) => Observable<Option<PalletChainbridgeProposalVotes>>,
                [u8, ITuple<[u64, Call]>]
            >;
        };
        childBounties: {
            /**
             * Child bounties that have been added.
             **/
            childBounties: AugmentedQuery<
                ApiType,
                (
                    arg1: u32 | AnyNumber | Uint8Array,
                    arg2: u32 | AnyNumber | Uint8Array,
                ) => Observable<Option<PalletChildBountiesChildBounty>>,
                [u32, u32]
            >;
            /**
             * Number of total child bounties.
             **/
            childBountyCount: AugmentedQuery<ApiType, () => Observable<u32>, []>;
            /**
             * The description of each child-bounty.
             **/
            childBountyDescriptions: AugmentedQuery<
                ApiType,
                (arg: u32 | AnyNumber | Uint8Array) => Observable<Option<Bytes>>,
                [u32]
            >;
            /**
             * The cumulative child-bounty curator fee for each parent bounty.
             **/
            childrenCuratorFees: AugmentedQuery<
                ApiType,
                (arg: u32 | AnyNumber | Uint8Array) => Observable<u128>,
                [u32]
            >;
            /**
             * Number of child bounties per parent bounty.
             * Map of parent bounty index to number of child bounties.
             **/
            parentChildBounties: AugmentedQuery<ApiType, (arg: u32 | AnyNumber | Uint8Array) => Observable<u32>, [u32]>;
        };
        contracts: {
            /**
             * A mapping between an original code hash and instrumented wasm code, ready for execution.
             **/
            codeStorage: AugmentedQuery<
                ApiType,
                (arg: H256 | string | Uint8Array) => Observable<Option<PalletContractsWasmPrefabWasmModule>>,
                [H256]
            >;
            /**
             * The code associated with a given account.
             *
             * TWOX-NOTE: SAFE since `AccountId` is a secure hash.
             **/
            contractInfoOf: AugmentedQuery<
                ApiType,
                (arg: AccountId32 | string | Uint8Array) => Observable<Option<PalletContractsStorageContractInfo>>,
                [AccountId32]
            >;
            /**
             * Evicted contracts that await child trie deletion.
             *
             * Child trie deletion is a heavy operation depending on the amount of storage items
             * stored in said trie. Therefore this operation is performed lazily in `on_initialize`.
             **/
            deletionQueue: AugmentedQuery<ApiType, () => Observable<Vec<PalletContractsStorageDeletedContract>>, []>;
            /**
             * This is a **monotonic** counter incremented on contract instantiation.
             *
             * This is used in order to generate unique trie ids for contracts.
             * The trie id of a new contract is calculated from hash(account_id, nonce).
             * The nonce is required because otherwise the following sequence would lead to
             * a possible collision of storage:
             *
             * 1. Create a new contract.
             * 2. Terminate the contract.
             * 3. Immediately recreate the contract with the same account_id.
             *
             * This is bad because the contents of a trie are deleted lazily and there might be
             * storage of the old instantiation still in it when the new contract is created. Please
             * note that we can't replace the counter by the block number because the sequence above
             * can happen in the same block. We also can't keep the account counter in memory only
             * because storage is the only way to communicate across different extrinsics in the
             * same block.
             *
             * # Note
             *
             * Do not use it to determine the number of contracts. It won't be decremented if
             * a contract is destroyed.
             **/
            nonce: AugmentedQuery<ApiType, () => Observable<u64>, []>;
            /**
             * A mapping between an original code hash and its owner information.
             **/
            ownerInfoOf: AugmentedQuery<
                ApiType,
                (arg: H256 | string | Uint8Array) => Observable<Option<PalletContractsWasmOwnerInfo>>,
                [H256]
            >;
            /**
             * A mapping from an original code hash to the original code, untouched by instrumentation.
             **/
            pristineCode: AugmentedQuery<
                ApiType,
                (arg: H256 | string | Uint8Array) => Observable<Option<Bytes>>,
                [H256]
            >;
        };
        council: {
            /**
             * The current members of the collective. This is stored sorted (just by value).
             **/
            members: AugmentedQuery<ApiType, () => Observable<Vec<AccountId32>>, []>;
            /**
             * The prime member that helps determine the default vote behavior in case of absentations.
             **/
            prime: AugmentedQuery<ApiType, () => Observable<Option<AccountId32>>, []>;
            /**
             * Proposals so far.
             **/
            proposalCount: AugmentedQuery<ApiType, () => Observable<u32>, []>;
            /**
             * Actual proposal for a given hash, if it's current.
             **/
            proposalOf: AugmentedQuery<ApiType, (arg: H256 | string | Uint8Array) => Observable<Option<Call>>, [H256]>;
            /**
             * The hashes of the active proposals.
             **/
            proposals: AugmentedQuery<ApiType, () => Observable<Vec<H256>>, []>;
            /**
             * Votes on a given proposal, if it is ongoing.
             **/
            voting: AugmentedQuery<
                ApiType,
                (arg: H256 | string | Uint8Array) => Observable<Option<PalletCollectiveVotes>>,
                [H256]
            >;
        };
        ddcClusters: {
            clusters: AugmentedQuery<
                ApiType,
                (arg: H160 | string | Uint8Array) => Observable<Option<PalletDdcClustersCluster>>,
                [H160]
            >;
            clustersGovParams: AugmentedQuery<
                ApiType,
                (arg: H160 | string | Uint8Array) => Observable<Option<PalletDdcClustersClusterClusterGovParams>>,
                [H160]
            >;
            clustersNodes: AugmentedQuery<
                ApiType,
                (
                    arg1: H160 | string | Uint8Array,
                    arg2: DdcPrimitivesNodePubKey | {StoragePubKey: any} | {CDNPubKey: any} | string | Uint8Array,
                ) => Observable<Option<bool>>,
                [H160, DdcPrimitivesNodePubKey]
            >;
        };
        ddcCustomers: {
            /**
             * Map from bucket ID to to the bucket structure
             **/
            buckets: AugmentedQuery<
                ApiType,
                (arg: u64 | AnyNumber | Uint8Array) => Observable<Option<PalletDdcCustomersBucket>>,
                [u64]
            >;
            bucketsCount: AugmentedQuery<ApiType, () => Observable<u64>, []>;
            /**
             * Map from all (unlocked) "owner" accounts to the info regarding the staking.
             **/
            ledger: AugmentedQuery<
                ApiType,
                (arg: AccountId32 | string | Uint8Array) => Observable<Option<PalletDdcCustomersAccountsLedger>>,
                [AccountId32]
            >;
        };
        ddcMetricsOffchainWorker: {};
        ddcNodes: {
            cdnNodes: AugmentedQuery<
                ApiType,
                (arg: AccountId32 | string | Uint8Array) => Observable<Option<PalletDdcNodesCdnNode>>,
                [AccountId32]
            >;
            storageNodes: AugmentedQuery<
                ApiType,
                (arg: AccountId32 | string | Uint8Array) => Observable<Option<PalletDdcNodesStorageNode>>,
                [AccountId32]
            >;
        };
        ddcStaking: {
            /**
             * Map from all locked "stash" accounts to the controller account.
             **/
            bonded: AugmentedQuery<
                ApiType,
                (arg: AccountId32 | string | Uint8Array) => Observable<Option<AccountId32>>,
                [AccountId32]
            >;
            /**
             * The map of (wannabe) CDN participants stash keys to the DDC cluster ID they wish to
             * participate into.
             **/
            cdNs: AugmentedQuery<
                ApiType,
                (arg: AccountId32 | string | Uint8Array) => Observable<Option<H160>>,
                [AccountId32]
            >;
            /**
             * Map from all (unlocked) "controller" accounts to the info regarding the staking.
             **/
            ledger: AugmentedQuery<
                ApiType,
                (arg: AccountId32 | string | Uint8Array) => Observable<Option<PalletDdcStakingStakingLedger>>,
                [AccountId32]
            >;
            /**
             * Map from DDC node ID to the node operator stash account.
             **/
            nodes: AugmentedQuery<
                ApiType,
                (
                    arg: DdcPrimitivesNodePubKey | {StoragePubKey: any} | {CDNPubKey: any} | string | Uint8Array,
                ) => Observable<Option<AccountId32>>,
                [DdcPrimitivesNodePubKey]
            >;
            /**
             * The map of (wannabe) storage network participants stash keys to the DDC cluster ID they wish
             * to participate into.
             **/
            storages: AugmentedQuery<
                ApiType,
                (arg: AccountId32 | string | Uint8Array) => Observable<Option<H160>>,
                [AccountId32]
            >;
        };
        democracy: {
            /**
             * A record of who vetoed what. Maps proposal hash to a possible existent block number
             * (until when it may not be resubmitted) and who vetoed it.
             **/
            blacklist: AugmentedQuery<
                ApiType,
                (arg: H256 | string | Uint8Array) => Observable<Option<ITuple<[u32, Vec<AccountId32>]>>>,
                [H256]
            >;
            /**
             * Record of all proposals that have been subject to emergency cancellation.
             **/
            cancellations: AugmentedQuery<ApiType, (arg: H256 | string | Uint8Array) => Observable<bool>, [H256]>;
            /**
             * Those who have locked a deposit.
             *
             * TWOX-NOTE: Safe, as increasing integer keys are safe.
             **/
            depositOf: AugmentedQuery<
                ApiType,
                (arg: u32 | AnyNumber | Uint8Array) => Observable<Option<ITuple<[Vec<AccountId32>, u128]>>>,
                [u32]
            >;
            /**
             * True if the last referendum tabled was submitted externally. False if it was a public
             * proposal.
             **/
            lastTabledWasExternal: AugmentedQuery<ApiType, () => Observable<bool>, []>;
            /**
             * The lowest referendum index representing an unbaked referendum. Equal to
             * `ReferendumCount` if there isn't a unbaked referendum.
             **/
            lowestUnbaked: AugmentedQuery<ApiType, () => Observable<u32>, []>;
            /**
             * The referendum to be tabled whenever it would be valid to table an external proposal.
             * This happens when a referendum needs to be tabled and one of two conditions are met:
             * - `LastTabledWasExternal` is `false`; or
             * - `PublicProps` is empty.
             **/
            nextExternal: AugmentedQuery<
                ApiType,
                () => Observable<Option<ITuple<[H256, PalletDemocracyVoteThreshold]>>>,
                []
            >;
            /**
             * Map of hashes to the proposal preimage, along with who registered it and their deposit.
             * The block number is the block at which it was deposited.
             **/
            preimages: AugmentedQuery<
                ApiType,
                (arg: H256 | string | Uint8Array) => Observable<Option<PalletDemocracyPreimageStatus>>,
                [H256]
            >;
            /**
             * The number of (public) proposals that have been made so far.
             **/
            publicPropCount: AugmentedQuery<ApiType, () => Observable<u32>, []>;
            /**
             * The public proposals. Unsorted. The second item is the proposal's hash.
             **/
            publicProps: AugmentedQuery<ApiType, () => Observable<Vec<ITuple<[u32, H256, AccountId32]>>>, []>;
            /**
             * The next free referendum index, aka the number of referenda started so far.
             **/
            referendumCount: AugmentedQuery<ApiType, () => Observable<u32>, []>;
            /**
             * Information concerning any given referendum.
             *
             * TWOX-NOTE: SAFE as indexes are not under an attacker’s control.
             **/
            referendumInfoOf: AugmentedQuery<
                ApiType,
                (arg: u32 | AnyNumber | Uint8Array) => Observable<Option<PalletDemocracyReferendumInfo>>,
                [u32]
            >;
            /**
             * Storage version of the pallet.
             *
             * New networks start with last version.
             **/
            storageVersion: AugmentedQuery<ApiType, () => Observable<Option<PalletDemocracyReleases>>, []>;
            /**
             * All votes for a particular voter. We store the balance for the number of votes that we
             * have recorded. The second item is the total amount of delegations, that will be added.
             *
             * TWOX-NOTE: SAFE as `AccountId`s are crypto hashes anyway.
             **/
            votingOf: AugmentedQuery<
                ApiType,
                (arg: AccountId32 | string | Uint8Array) => Observable<PalletDemocracyVoteVoting>,
                [AccountId32]
            >;
        };
        electionProviderMultiPhase: {
            /**
             * Current phase.
             **/
            currentPhase: AugmentedQuery<ApiType, () => Observable<PalletElectionProviderMultiPhasePhase>, []>;
            /**
             * Desired number of targets to elect for this round.
             *
             * Only exists when [`Snapshot`] is present.
             **/
            desiredTargets: AugmentedQuery<ApiType, () => Observable<Option<u32>>, []>;
            /**
             * The minimum score that each 'untrusted' solution must attain in order to be considered
             * feasible.
             *
             * Can be set via `set_minimum_untrusted_score`.
             **/
            minimumUntrustedScore: AugmentedQuery<ApiType, () => Observable<Option<SpNposElectionsElectionScore>>, []>;
            /**
             * Current best solution, signed or unsigned, queued to be returned upon `elect`.
             **/
            queuedSolution: AugmentedQuery<
                ApiType,
                () => Observable<Option<PalletElectionProviderMultiPhaseReadySolution>>,
                []
            >;
            /**
             * Internal counter for the number of rounds.
             *
             * This is useful for de-duplication of transactions submitted to the pool, and general
             * diagnostics of the pallet.
             *
             * This is merely incremented once per every time that an upstream `elect` is called.
             **/
            round: AugmentedQuery<ApiType, () => Observable<u32>, []>;
            /**
             * A sorted, bounded set of `(score, index)`, where each `index` points to a value in
             * `SignedSubmissions`.
             *
             * We never need to process more than a single signed submission at a time. Signed submissions
             * can be quite large, so we're willing to pay the cost of multiple database accesses to access
             * them one at a time instead of reading and decoding all of them at once.
             **/
            signedSubmissionIndices: AugmentedQuery<
                ApiType,
                () => Observable<BTreeMap<SpNposElectionsElectionScore, u32>>,
                []
            >;
            /**
             * The next index to be assigned to an incoming signed submission.
             *
             * Every accepted submission is assigned a unique index; that index is bound to that particular
             * submission for the duration of the election. On election finalization, the next index is
             * reset to 0.
             *
             * We can't just use `SignedSubmissionIndices.len()`, because that's a bounded set; past its
             * capacity, it will simply saturate. We can't just iterate over `SignedSubmissionsMap`,
             * because iteration is slow. Instead, we store the value here.
             **/
            signedSubmissionNextIndex: AugmentedQuery<ApiType, () => Observable<u32>, []>;
            /**
             * Unchecked, signed solutions.
             *
             * Together with `SubmissionIndices`, this stores a bounded set of `SignedSubmissions` while
             * allowing us to keep only a single one in memory at a time.
             *
             * Twox note: the key of the map is an auto-incrementing index which users cannot inspect or
             * affect; we shouldn't need a cryptographically secure hasher.
             **/
            signedSubmissionsMap: AugmentedQuery<
                ApiType,
                (
                    arg: u32 | AnyNumber | Uint8Array,
                ) => Observable<Option<PalletElectionProviderMultiPhaseSignedSignedSubmission>>,
                [u32]
            >;
            /**
             * Snapshot data of the round.
             *
             * This is created at the beginning of the signed phase and cleared upon calling `elect`.
             **/
            snapshot: AugmentedQuery<
                ApiType,
                () => Observable<Option<PalletElectionProviderMultiPhaseRoundSnapshot>>,
                []
            >;
            /**
             * The metadata of the [`RoundSnapshot`]
             *
             * Only exists when [`Snapshot`] is present.
             **/
            snapshotMetadata: AugmentedQuery<
                ApiType,
                () => Observable<Option<PalletElectionProviderMultiPhaseSolutionOrSnapshotSize>>,
                []
            >;
        };
        elections: {
            /**
             * The present candidate list. A current member or runner-up can never enter this vector
             * and is always implicitly assumed to be a candidate.
             *
             * Second element is the deposit.
             *
             * Invariant: Always sorted based on account id.
             **/
            candidates: AugmentedQuery<ApiType, () => Observable<Vec<ITuple<[AccountId32, u128]>>>, []>;
            /**
             * The total number of vote rounds that have happened, excluding the upcoming one.
             **/
            electionRounds: AugmentedQuery<ApiType, () => Observable<u32>, []>;
            /**
             * The current elected members.
             *
             * Invariant: Always sorted based on account id.
             **/
            members: AugmentedQuery<ApiType, () => Observable<Vec<PalletElectionsPhragmenSeatHolder>>, []>;
            /**
             * The current reserved runners-up.
             *
             * Invariant: Always sorted based on rank (worse to best). Upon removal of a member, the
             * last (i.e. _best_) runner-up will be replaced.
             **/
            runnersUp: AugmentedQuery<ApiType, () => Observable<Vec<PalletElectionsPhragmenSeatHolder>>, []>;
            /**
             * Votes and locked stake of a particular voter.
             *
             * TWOX-NOTE: SAFE as `AccountId` is a crypto hash.
             **/
            voting: AugmentedQuery<
                ApiType,
                (arg: AccountId32 | string | Uint8Array) => Observable<PalletElectionsPhragmenVoter>,
                [AccountId32]
            >;
        };
        erc20: {};
        erc721: {
            /**
             * Total number of tokens in existence
             **/
            tokenCount: AugmentedQuery<ApiType, () => Observable<U256>, []>;
            /**
             * Maps tokenId to owner
             **/
            tokenOwner: AugmentedQuery<
                ApiType,
                (arg: U256 | AnyNumber | Uint8Array) => Observable<Option<AccountId32>>,
                [U256]
            >;
            /**
             * Maps tokenId to Erc721 object
             **/
            tokens: AugmentedQuery<
                ApiType,
                (arg: U256 | AnyNumber | Uint8Array) => Observable<Option<PalletErc721Erc721Token>>,
                [U256]
            >;
        };
        fastUnstake: {
            /**
             * Counter for the related counted storage map
             **/
            counterForQueue: AugmentedQuery<ApiType, () => Observable<u32>, []>;
            /**
             * Number of eras to check per block.
             *
             * If set to 0, this pallet does absolutely nothing.
             *
             * Based on the amount of weight available at `on_idle`, up to this many eras of a single
             * nominator might be checked.
             **/
            erasToCheckPerBlock: AugmentedQuery<ApiType, () => Observable<u32>, []>;
            /**
             * The current "head of the queue" being unstaked.
             **/
            head: AugmentedQuery<ApiType, () => Observable<Option<PalletFastUnstakeUnstakeRequest>>, []>;
            /**
             * The map of all accounts wishing to be unstaked.
             *
             * Keeps track of `AccountId` wishing to unstake and it's corresponding deposit.
             **/
            queue: AugmentedQuery<
                ApiType,
                (arg: AccountId32 | string | Uint8Array) => Observable<Option<u128>>,
                [AccountId32]
            >;
        };
        grandpa: {
            /**
             * The number of changes (both in terms of keys and underlying economic responsibilities)
             * in the "set" of Grandpa validators from genesis.
             **/
            currentSetId: AugmentedQuery<ApiType, () => Observable<u64>, []>;
            /**
             * next block number where we can force a change.
             **/
            nextForced: AugmentedQuery<ApiType, () => Observable<Option<u32>>, []>;
            /**
             * Pending change: (signaled at, scheduled change).
             **/
            pendingChange: AugmentedQuery<ApiType, () => Observable<Option<PalletGrandpaStoredPendingChange>>, []>;
            /**
             * A mapping from grandpa set ID to the index of the *most recent* session for which its
             * members were responsible.
             *
             * TWOX-NOTE: `SetId` is not under user control.
             **/
            setIdSession: AugmentedQuery<
                ApiType,
                (arg: u64 | AnyNumber | Uint8Array) => Observable<Option<u32>>,
                [u64]
            >;
            /**
             * `true` if we are currently stalled.
             **/
            stalled: AugmentedQuery<ApiType, () => Observable<Option<ITuple<[u32, u32]>>>, []>;
            /**
             * State of the current authority set.
             **/
            state: AugmentedQuery<ApiType, () => Observable<PalletGrandpaStoredState>, []>;
        };
        identity: {
            /**
             * Information that is pertinent to identify the entity behind an account.
             *
             * TWOX-NOTE: OK ― `AccountId` is a secure hash.
             **/
            identityOf: AugmentedQuery<
                ApiType,
                (arg: AccountId32 | string | Uint8Array) => Observable<Option<PalletIdentityRegistration>>,
                [AccountId32]
            >;
            /**
             * The set of registrars. Not expected to get very big as can only be added through a
             * special origin (likely a council motion).
             *
             * The index into this can be cast to `RegistrarIndex` to get a valid value.
             **/
            registrars: AugmentedQuery<ApiType, () => Observable<Vec<Option<PalletIdentityRegistrarInfo>>>, []>;
            /**
             * Alternative "sub" identities of this account.
             *
             * The first item is the deposit, the second is a vector of the accounts.
             *
             * TWOX-NOTE: OK ― `AccountId` is a secure hash.
             **/
            subsOf: AugmentedQuery<
                ApiType,
                (arg: AccountId32 | string | Uint8Array) => Observable<ITuple<[u128, Vec<AccountId32>]>>,
                [AccountId32]
            >;
            /**
             * The super-identity of an alternative "sub" identity together with its name, within that
             * context. If the account is not some other account's sub-identity, then just `None`.
             **/
            superOf: AugmentedQuery<
                ApiType,
                (arg: AccountId32 | string | Uint8Array) => Observable<Option<ITuple<[AccountId32, Data]>>>,
                [AccountId32]
            >;
        };
        imOnline: {
            /**
             * For each session index, we keep a mapping of `ValidatorId<T>` to the
             * number of blocks authored by the given authority.
             **/
            authoredBlocks: AugmentedQuery<
                ApiType,
                (arg1: u32 | AnyNumber | Uint8Array, arg2: AccountId32 | string | Uint8Array) => Observable<u32>,
                [u32, AccountId32]
            >;
            /**
             * The block number after which it's ok to send heartbeats in the current
             * session.
             *
             * At the beginning of each session we set this to a value that should fall
             * roughly in the middle of the session duration. The idea is to first wait for
             * the validators to produce a block in the current session, so that the
             * heartbeat later on will not be necessary.
             *
             * This value will only be used as a fallback if we fail to get a proper session
             * progress estimate from `NextSessionRotation`, as those estimates should be
             * more accurate then the value we calculate for `HeartbeatAfter`.
             **/
            heartbeatAfter: AugmentedQuery<ApiType, () => Observable<u32>, []>;
            /**
             * The current set of keys that may issue a heartbeat.
             **/
            keys: AugmentedQuery<ApiType, () => Observable<Vec<PalletImOnlineSr25519AppSr25519Public>>, []>;
            /**
             * For each session index, we keep a mapping of `SessionIndex` and `AuthIndex` to
             * `WrapperOpaque<BoundedOpaqueNetworkState>`.
             **/
            receivedHeartbeats: AugmentedQuery<
                ApiType,
                (
                    arg1: u32 | AnyNumber | Uint8Array,
                    arg2: u32 | AnyNumber | Uint8Array,
                ) => Observable<Option<WrapperOpaque<PalletImOnlineBoundedOpaqueNetworkState>>>,
                [u32, u32]
            >;
        };
        indices: {
            /**
             * The lookup from index to account.
             **/
            accounts: AugmentedQuery<
                ApiType,
                (arg: u32 | AnyNumber | Uint8Array) => Observable<Option<ITuple<[AccountId32, u128, bool]>>>,
                [u32]
            >;
        };
        multisig: {
            calls: AugmentedQuery<
                ApiType,
                (
                    arg: U8aFixed | string | Uint8Array,
                ) => Observable<Option<ITuple<[WrapperKeepOpaque<Call>, AccountId32, u128]>>>,
                [U8aFixed]
            >;
            /**
             * The set of open multisig operations.
             **/
            multisigs: AugmentedQuery<
                ApiType,
                (
                    arg1: AccountId32 | string | Uint8Array,
                    arg2: U8aFixed | string | Uint8Array,
                ) => Observable<Option<PalletMultisigMultisig>>,
                [AccountId32, U8aFixed]
            >;
        };
        nominationPools: {
            /**
             * Storage for bonded pools.
             **/
            bondedPools: AugmentedQuery<
                ApiType,
                (arg: u32 | AnyNumber | Uint8Array) => Observable<Option<PalletNominationPoolsBondedPoolInner>>,
                [u32]
            >;
            /**
             * Counter for the related counted storage map
             **/
            counterForBondedPools: AugmentedQuery<ApiType, () => Observable<u32>, []>;
            /**
             * Counter for the related counted storage map
             **/
            counterForMetadata: AugmentedQuery<ApiType, () => Observable<u32>, []>;
            /**
             * Counter for the related counted storage map
             **/
            counterForPoolMembers: AugmentedQuery<ApiType, () => Observable<u32>, []>;
            /**
             * Counter for the related counted storage map
             **/
            counterForReversePoolIdLookup: AugmentedQuery<ApiType, () => Observable<u32>, []>;
            /**
             * Counter for the related counted storage map
             **/
            counterForRewardPools: AugmentedQuery<ApiType, () => Observable<u32>, []>;
            /**
             * Counter for the related counted storage map
             **/
            counterForSubPoolsStorage: AugmentedQuery<ApiType, () => Observable<u32>, []>;
            /**
             * Ever increasing number of all pools created so far.
             **/
            lastPoolId: AugmentedQuery<ApiType, () => Observable<u32>, []>;
            /**
             * Maximum number of members that can exist in the system. If `None`, then the count
             * members are not bound on a system wide basis.
             **/
            maxPoolMembers: AugmentedQuery<ApiType, () => Observable<Option<u32>>, []>;
            /**
             * Maximum number of members that may belong to pool. If `None`, then the count of
             * members is not bound on a per pool basis.
             **/
            maxPoolMembersPerPool: AugmentedQuery<ApiType, () => Observable<Option<u32>>, []>;
            /**
             * Maximum number of nomination pools that can exist. If `None`, then an unbounded number of
             * pools can exist.
             **/
            maxPools: AugmentedQuery<ApiType, () => Observable<Option<u32>>, []>;
            /**
             * Metadata for the pool.
             **/
            metadata: AugmentedQuery<ApiType, (arg: u32 | AnyNumber | Uint8Array) => Observable<Bytes>, [u32]>;
            /**
             * Minimum bond required to create a pool.
             *
             * This is the amount that the depositor must put as their initial stake in the pool, as an
             * indication of "skin in the game".
             *
             * This is the value that will always exist in the staking ledger of the pool bonded account
             * while all other accounts leave.
             **/
            minCreateBond: AugmentedQuery<ApiType, () => Observable<u128>, []>;
            /**
             * Minimum amount to bond to join a pool.
             **/
            minJoinBond: AugmentedQuery<ApiType, () => Observable<u128>, []>;
            /**
             * Active members.
             **/
            poolMembers: AugmentedQuery<
                ApiType,
                (arg: AccountId32 | string | Uint8Array) => Observable<Option<PalletNominationPoolsPoolMember>>,
                [AccountId32]
            >;
            /**
             * A reverse lookup from the pool's account id to its id.
             *
             * This is only used for slashing. In all other instances, the pool id is used, and the
             * accounts are deterministically derived from it.
             **/
            reversePoolIdLookup: AugmentedQuery<
                ApiType,
                (arg: AccountId32 | string | Uint8Array) => Observable<Option<u32>>,
                [AccountId32]
            >;
            /**
             * Reward pools. This is where there rewards for each pool accumulate. When a members payout
             * is claimed, the balance comes out fo the reward pool. Keyed by the bonded pools account.
             **/
            rewardPools: AugmentedQuery<
                ApiType,
                (arg: u32 | AnyNumber | Uint8Array) => Observable<Option<PalletNominationPoolsRewardPool>>,
                [u32]
            >;
            /**
             * Groups of unbonding pools. Each group of unbonding pools belongs to a bonded pool,
             * hence the name sub-pools. Keyed by the bonded pools account.
             **/
            subPoolsStorage: AugmentedQuery<
                ApiType,
                (arg: u32 | AnyNumber | Uint8Array) => Observable<Option<PalletNominationPoolsSubPools>>,
                [u32]
            >;
        };
        offences: {
            /**
             * A vector of reports of the same kind that happened at the same time slot.
             **/
            concurrentReportsIndex: AugmentedQuery<
                ApiType,
                (arg1: U8aFixed | string | Uint8Array, arg2: Bytes | string | Uint8Array) => Observable<Vec<H256>>,
                [U8aFixed, Bytes]
            >;
            /**
             * The primary structure that holds all offence records keyed by report identifiers.
             **/
            reports: AugmentedQuery<
                ApiType,
                (arg: H256 | string | Uint8Array) => Observable<Option<SpStakingOffenceOffenceDetails>>,
                [H256]
            >;
            /**
             * Enumerates all reports of a kind along with the time they happened.
             *
             * All reports are sorted by the time of offence.
             *
             * Note that the actual type of this mapping is `Vec<u8>`, this is because values of
             * different types are not supported at the moment so we are doing the manual serialization.
             **/
            reportsByKindIndex: AugmentedQuery<
                ApiType,
                (arg: U8aFixed | string | Uint8Array) => Observable<Bytes>,
                [U8aFixed]
            >;
        };
        proxy: {
            /**
             * The announcements made by the proxy (key).
             **/
            announcements: AugmentedQuery<
                ApiType,
                (arg: AccountId32 | string | Uint8Array) => Observable<ITuple<[Vec<PalletProxyAnnouncement>, u128]>>,
                [AccountId32]
            >;
            /**
             * The set of account proxies. Maps the account which has delegated to the accounts
             * which are being delegated to, together with the amount held on deposit.
             **/
            proxies: AugmentedQuery<
                ApiType,
                (arg: AccountId32 | string | Uint8Array) => Observable<ITuple<[Vec<PalletProxyProxyDefinition>, u128]>>,
                [AccountId32]
            >;
        };
        randomnessCollectiveFlip: {
            /**
             * Series of block headers from the last 81 blocks that acts as random seed material. This
             * is arranged as a ring buffer with `block_number % 81` being the index into the `Vec` of
             * the oldest hash.
             **/
            randomMaterial: AugmentedQuery<ApiType, () => Observable<Vec<H256>>, []>;
        };
        recovery: {
            /**
             * Active recovery attempts.
             *
             * First account is the account to be recovered, and the second account
             * is the user trying to recover the account.
             **/
            activeRecoveries: AugmentedQuery<
                ApiType,
                (
                    arg1: AccountId32 | string | Uint8Array,
                    arg2: AccountId32 | string | Uint8Array,
                ) => Observable<Option<PalletRecoveryActiveRecovery>>,
                [AccountId32, AccountId32]
            >;
            /**
             * The list of allowed proxy accounts.
             *
             * Map from the user who can access it to the recovered account.
             **/
            proxy: AugmentedQuery<
                ApiType,
                (arg: AccountId32 | string | Uint8Array) => Observable<Option<AccountId32>>,
                [AccountId32]
            >;
            /**
             * The set of recoverable accounts and their recovery configuration.
             **/
            recoverable: AugmentedQuery<
                ApiType,
                (arg: AccountId32 | string | Uint8Array) => Observable<Option<PalletRecoveryRecoveryConfig>>,
                [AccountId32]
            >;
        };
        scheduler: {
            /**
             * Items to be executed, indexed by the block number that they should be executed on.
             **/
            agenda: AugmentedQuery<
                ApiType,
                (arg: u32 | AnyNumber | Uint8Array) => Observable<Vec<Option<PalletSchedulerScheduledV3>>>,
                [u32]
            >;
            /**
             * Lookup from identity to the block number and index of the task.
             **/
            lookup: AugmentedQuery<
                ApiType,
                (arg: Bytes | string | Uint8Array) => Observable<Option<ITuple<[u32, u32]>>>,
                [Bytes]
            >;
        };
        session: {
            /**
             * Current index of the session.
             **/
            currentIndex: AugmentedQuery<ApiType, () => Observable<u32>, []>;
            /**
             * Indices of disabled validators.
             *
             * The vec is always kept sorted so that we can find whether a given validator is
             * disabled using binary search. It gets cleared when `on_session_ending` returns
             * a new set of identities.
             **/
            disabledValidators: AugmentedQuery<ApiType, () => Observable<Vec<u32>>, []>;
            /**
             * The owner of a key. The key is the `KeyTypeId` + the encoded key.
             **/
            keyOwner: AugmentedQuery<
                ApiType,
                (
                    arg:
                        | ITuple<[SpCoreCryptoKeyTypeId, Bytes]>
                        | [SpCoreCryptoKeyTypeId | string | Uint8Array, Bytes | string | Uint8Array],
                ) => Observable<Option<AccountId32>>,
                [ITuple<[SpCoreCryptoKeyTypeId, Bytes]>]
            >;
            /**
             * The next session keys for a validator.
             **/
            nextKeys: AugmentedQuery<
                ApiType,
                (arg: AccountId32 | string | Uint8Array) => Observable<Option<CereDevRuntimeSessionKeys>>,
                [AccountId32]
            >;
            /**
             * True if the underlying economic identities or weighting behind the validators
             * has changed in the queued validator set.
             **/
            queuedChanged: AugmentedQuery<ApiType, () => Observable<bool>, []>;
            /**
             * The queued keys for the next session. When the next session begins, these keys
             * will be used to determine the validator's session keys.
             **/
            queuedKeys: AugmentedQuery<
                ApiType,
                () => Observable<Vec<ITuple<[AccountId32, CereDevRuntimeSessionKeys]>>>,
                []
            >;
            /**
             * The current set of validators.
             **/
            validators: AugmentedQuery<ApiType, () => Observable<Vec<AccountId32>>, []>;
        };
        society: {
            /**
             * The current bids, stored ordered by the value of the bid.
             **/
            bids: AugmentedQuery<ApiType, () => Observable<Vec<PalletSocietyBid>>, []>;
            /**
             * The current set of candidates; bidders that are attempting to become members.
             **/
            candidates: AugmentedQuery<ApiType, () => Observable<Vec<PalletSocietyBid>>, []>;
            /**
             * The defending member currently being challenged.
             **/
            defender: AugmentedQuery<ApiType, () => Observable<Option<AccountId32>>, []>;
            /**
             * Votes for the defender.
             **/
            defenderVotes: AugmentedQuery<
                ApiType,
                (arg: AccountId32 | string | Uint8Array) => Observable<Option<PalletSocietyVote>>,
                [AccountId32]
            >;
            /**
             * The first member.
             **/
            founder: AugmentedQuery<ApiType, () => Observable<Option<AccountId32>>, []>;
            /**
             * The most primary from the most recently approved members.
             **/
            head: AugmentedQuery<ApiType, () => Observable<Option<AccountId32>>, []>;
            /**
             * The max number of members for the society at one time.
             **/
            maxMembers: AugmentedQuery<ApiType, () => Observable<u32>, []>;
            /**
             * The current set of members, ordered.
             **/
            members: AugmentedQuery<ApiType, () => Observable<Vec<AccountId32>>, []>;
            /**
             * Pending payouts; ordered by block number, with the amount that should be paid out.
             **/
            payouts: AugmentedQuery<
                ApiType,
                (arg: AccountId32 | string | Uint8Array) => Observable<Vec<ITuple<[u32, u128]>>>,
                [AccountId32]
            >;
            /**
             * Amount of our account balance that is specifically for the next round's bid(s).
             **/
            pot: AugmentedQuery<ApiType, () => Observable<u128>, []>;
            /**
             * A hash of the rules of this society concerning membership. Can only be set once and
             * only by the founder.
             **/
            rules: AugmentedQuery<ApiType, () => Observable<Option<H256>>, []>;
            /**
             * The ongoing number of losing votes cast by the member.
             **/
            strikes: AugmentedQuery<
                ApiType,
                (arg: AccountId32 | string | Uint8Array) => Observable<u32>,
                [AccountId32]
            >;
            /**
             * The set of suspended candidates.
             **/
            suspendedCandidates: AugmentedQuery<
                ApiType,
                (arg: AccountId32 | string | Uint8Array) => Observable<Option<ITuple<[u128, PalletSocietyBidKind]>>>,
                [AccountId32]
            >;
            /**
             * The set of suspended members.
             **/
            suspendedMembers: AugmentedQuery<
                ApiType,
                (arg: AccountId32 | string | Uint8Array) => Observable<bool>,
                [AccountId32]
            >;
            /**
             * Double map from Candidate -> Voter -> (Maybe) Vote.
             **/
            votes: AugmentedQuery<
                ApiType,
                (
                    arg1: AccountId32 | string | Uint8Array,
                    arg2: AccountId32 | string | Uint8Array,
                ) => Observable<Option<PalletSocietyVote>>,
                [AccountId32, AccountId32]
            >;
            /**
             * Members currently vouching or banned from vouching again
             **/
            vouching: AugmentedQuery<
                ApiType,
                (arg: AccountId32 | string | Uint8Array) => Observable<Option<PalletSocietyVouchingStatus>>,
                [AccountId32]
            >;
        };
        staking: {
            /**
             * The active era information, it holds index and start.
             *
             * The active era is the era being currently rewarded. Validator set of this era must be
             * equal to [`SessionInterface::validators`].
             **/
            activeEra: AugmentedQuery<ApiType, () => Observable<Option<PalletStakingActiveEraInfo>>, []>;
            /**
             * Map from all locked "stash" accounts to the controller account.
             **/
            bonded: AugmentedQuery<
                ApiType,
                (arg: AccountId32 | string | Uint8Array) => Observable<Option<AccountId32>>,
                [AccountId32]
            >;
            /**
             * A mapping from still-bonded eras to the first session index of that era.
             *
             * Must contains information for eras for the range:
             * `[active_era - bounding_duration; active_era]`
             **/
            bondedEras: AugmentedQuery<ApiType, () => Observable<Vec<ITuple<[u32, u32]>>>, []>;
            /**
             * The amount of currency given to reporters of a slash event which was
             * canceled by extraordinary circumstances (e.g. governance).
             **/
            canceledSlashPayout: AugmentedQuery<ApiType, () => Observable<u128>, []>;
            /**
             * The threshold for when users can start calling `chill_other` for other validators /
             * nominators. The threshold is compared to the actual number of validators / nominators
             * (`CountFor*`) in the system compared to the configured max (`Max*Count`).
             **/
            chillThreshold: AugmentedQuery<ApiType, () => Observable<Option<Percent>>, []>;
            /**
             * Counter for the related counted storage map
             **/
            counterForNominators: AugmentedQuery<ApiType, () => Observable<u32>, []>;
            /**
             * Counter for the related counted storage map
             **/
            counterForValidators: AugmentedQuery<ApiType, () => Observable<u32>, []>;
            /**
             * The current era index.
             *
             * This is the latest planned era, depending on how the Session pallet queues the validator
             * set, it might be active or not.
             **/
            currentEra: AugmentedQuery<ApiType, () => Observable<Option<u32>>, []>;
            /**
             * The last planned session scheduled by the session pallet.
             *
             * This is basically in sync with the call to [`pallet_session::SessionManager::new_session`].
             **/
            currentPlannedSession: AugmentedQuery<ApiType, () => Observable<u32>, []>;
            /**
             * Rewards for the last `HISTORY_DEPTH` eras.
             * If reward hasn't been set or has been removed then 0 reward is returned.
             **/
            erasRewardPoints: AugmentedQuery<
                ApiType,
                (arg: u32 | AnyNumber | Uint8Array) => Observable<PalletStakingEraRewardPoints>,
                [u32]
            >;
            /**
             * Exposure of validator at era.
             *
             * This is keyed first by the era index to allow bulk deletion and then the stash account.
             *
             * Is it removed after `HISTORY_DEPTH` eras.
             * If stakers hasn't been set or has been removed then empty exposure is returned.
             **/
            erasStakers: AugmentedQuery<
                ApiType,
                (
                    arg1: u32 | AnyNumber | Uint8Array,
                    arg2: AccountId32 | string | Uint8Array,
                ) => Observable<PalletStakingExposure>,
                [u32, AccountId32]
            >;
            /**
             * Clipped Exposure of validator at era.
             *
             * This is similar to [`ErasStakers`] but number of nominators exposed is reduced to the
             * `T::MaxNominatorRewardedPerValidator` biggest stakers.
             * (Note: the field `total` and `own` of the exposure remains unchanged).
             * This is used to limit the i/o cost for the nominator payout.
             *
             * This is keyed fist by the era index to allow bulk deletion and then the stash account.
             *
             * Is it removed after `HISTORY_DEPTH` eras.
             * If stakers hasn't been set or has been removed then empty exposure is returned.
             **/
            erasStakersClipped: AugmentedQuery<
                ApiType,
                (
                    arg1: u32 | AnyNumber | Uint8Array,
                    arg2: AccountId32 | string | Uint8Array,
                ) => Observable<PalletStakingExposure>,
                [u32, AccountId32]
            >;
            /**
             * The session index at which the era start for the last `HISTORY_DEPTH` eras.
             *
             * Note: This tracks the starting session (i.e. session index when era start being active)
             * for the eras in `[CurrentEra - HISTORY_DEPTH, CurrentEra]`.
             **/
            erasStartSessionIndex: AugmentedQuery<
                ApiType,
                (arg: u32 | AnyNumber | Uint8Array) => Observable<Option<u32>>,
                [u32]
            >;
            /**
             * The total amount staked for the last `HISTORY_DEPTH` eras.
             * If total hasn't been set or has been removed then 0 stake is returned.
             **/
            erasTotalStake: AugmentedQuery<ApiType, (arg: u32 | AnyNumber | Uint8Array) => Observable<u128>, [u32]>;
            /**
             * Similar to `ErasStakers`, this holds the preferences of validators.
             *
             * This is keyed first by the era index to allow bulk deletion and then the stash account.
             *
             * Is it removed after `HISTORY_DEPTH` eras.
             **/
            erasValidatorPrefs: AugmentedQuery<
                ApiType,
                (
                    arg1: u32 | AnyNumber | Uint8Array,
                    arg2: AccountId32 | string | Uint8Array,
                ) => Observable<PalletStakingValidatorPrefs>,
                [u32, AccountId32]
            >;
            /**
             * The total validator era payout for the last `HISTORY_DEPTH` eras.
             *
             * Eras that haven't finished yet or has been removed doesn't have reward.
             **/
            erasValidatorReward: AugmentedQuery<
                ApiType,
                (arg: u32 | AnyNumber | Uint8Array) => Observable<Option<u128>>,
                [u32]
            >;
            /**
             * Mode of era forcing.
             **/
            forceEra: AugmentedQuery<ApiType, () => Observable<PalletStakingForcing>, []>;
            /**
             * Any validators that may never be slashed or forcibly kicked. It's a Vec since they're
             * easy to initialize and the performance hit is minimal (we expect no more than four
             * invulnerables) and restricted to testnets.
             **/
            invulnerables: AugmentedQuery<ApiType, () => Observable<Vec<AccountId32>>, []>;
            /**
             * Map from all (unlocked) "controller" accounts to the info regarding the staking.
             **/
            ledger: AugmentedQuery<
                ApiType,
                (arg: AccountId32 | string | Uint8Array) => Observable<Option<PalletStakingStakingLedger>>,
                [AccountId32]
            >;
            /**
             * The maximum nominator count before we stop allowing new validators to join.
             *
             * When this value is not set, no limits are enforced.
             **/
            maxNominatorsCount: AugmentedQuery<ApiType, () => Observable<Option<u32>>, []>;
            /**
             * The maximum validator count before we stop allowing new validators to join.
             *
             * When this value is not set, no limits are enforced.
             **/
            maxValidatorsCount: AugmentedQuery<ApiType, () => Observable<Option<u32>>, []>;
            /**
             * The minimum amount of commission that validators can set.
             *
             * If set to `0`, no limit exists.
             **/
            minCommission: AugmentedQuery<ApiType, () => Observable<Perbill>, []>;
            /**
             * Minimum number of staking participants before emergency conditions are imposed.
             **/
            minimumValidatorCount: AugmentedQuery<ApiType, () => Observable<u32>, []>;
            /**
             * The minimum active bond to become and maintain the role of a nominator.
             **/
            minNominatorBond: AugmentedQuery<ApiType, () => Observable<u128>, []>;
            /**
             * The minimum active bond to become and maintain the role of a validator.
             **/
            minValidatorBond: AugmentedQuery<ApiType, () => Observable<u128>, []>;
            /**
             * The map from nominator stash key to their nomination preferences, namely the validators that
             * they wish to support.
             *
             * Note that the keys of this storage map might become non-decodable in case the
             * [`Config::MaxNominations`] configuration is decreased. In this rare case, these nominators
             * are still existent in storage, their key is correct and retrievable (i.e. `contains_key`
             * indicates that they exist), but their value cannot be decoded. Therefore, the non-decodable
             * nominators will effectively not-exist, until they re-submit their preferences such that it
             * is within the bounds of the newly set `Config::MaxNominations`.
             *
             * This implies that `::iter_keys().count()` and `::iter().count()` might return different
             * values for this map. Moreover, the main `::count()` is aligned with the former, namely the
             * number of keys that exist.
             *
             * Lastly, if any of the nominators become non-decodable, they can be chilled immediately via
             * [`Call::chill_other`] dispatchable by anyone.
             **/
            nominators: AugmentedQuery<
                ApiType,
                (arg: AccountId32 | string | Uint8Array) => Observable<Option<PalletStakingNominations>>,
                [AccountId32]
            >;
            /**
             * All slashing events on nominators, mapped by era to the highest slash value of the era.
             **/
            nominatorSlashInEra: AugmentedQuery<
                ApiType,
                (
                    arg1: u32 | AnyNumber | Uint8Array,
                    arg2: AccountId32 | string | Uint8Array,
                ) => Observable<Option<u128>>,
                [u32, AccountId32]
            >;
            /**
             * Indices of validators that have offended in the active era and whether they are currently
             * disabled.
             *
             * This value should be a superset of disabled validators since not all offences lead to the
             * validator being disabled (if there was no slash). This is needed to track the percentage of
             * validators that have offended in the current era, ensuring a new era is forced if
             * `OffendingValidatorsThreshold` is reached. The vec is always kept sorted so that we can find
             * whether a given validator has previously offended using binary search. It gets cleared when
             * the era ends.
             **/
            offendingValidators: AugmentedQuery<ApiType, () => Observable<Vec<ITuple<[u32, bool]>>>, []>;
            /**
             * Where the reward payment should be made. Keyed by stash.
             **/
            payee: AugmentedQuery<
                ApiType,
                (arg: AccountId32 | string | Uint8Array) => Observable<PalletStakingRewardDestination>,
                [AccountId32]
            >;
            /**
             * Slashing spans for stash accounts.
             **/
            slashingSpans: AugmentedQuery<
                ApiType,
                (arg: AccountId32 | string | Uint8Array) => Observable<Option<PalletStakingSlashingSlashingSpans>>,
                [AccountId32]
            >;
            /**
             * The percentage of the slash that is distributed to reporters.
             *
             * The rest of the slashed value is handled by the `Slash`.
             **/
            slashRewardFraction: AugmentedQuery<ApiType, () => Observable<Perbill>, []>;
            /**
             * Records information about the maximum slash of a stash within a slashing span,
             * as well as how much reward has been paid out.
             **/
            spanSlash: AugmentedQuery<
                ApiType,
                (
                    arg: ITuple<[AccountId32, u32]> | [AccountId32 | string | Uint8Array, u32 | AnyNumber | Uint8Array],
                ) => Observable<PalletStakingSlashingSpanRecord>,
                [ITuple<[AccountId32, u32]>]
            >;
            /**
             * True if network has been upgraded to this version.
             * Storage version of the pallet.
             *
             * This is set to v7.0.0 for new networks.
             **/
            storageVersion: AugmentedQuery<ApiType, () => Observable<PalletStakingReleases>, []>;
            /**
             * All unapplied slashes that are queued for later.
             **/
            unappliedSlashes: AugmentedQuery<
                ApiType,
                (arg: u32 | AnyNumber | Uint8Array) => Observable<Vec<PalletStakingUnappliedSlash>>,
                [u32]
            >;
            /**
             * The ideal number of staking participants.
             **/
            validatorCount: AugmentedQuery<ApiType, () => Observable<u32>, []>;
            /**
             * The map from (wannabe) validator stash key to the preferences of that validator.
             **/
            validators: AugmentedQuery<
                ApiType,
                (arg: AccountId32 | string | Uint8Array) => Observable<PalletStakingValidatorPrefs>,
                [AccountId32]
            >;
            /**
             * All slashing events on validators, mapped by era to the highest slash proportion
             * and slash value of the era.
             **/
            validatorSlashInEra: AugmentedQuery<
                ApiType,
                (
                    arg1: u32 | AnyNumber | Uint8Array,
                    arg2: AccountId32 | string | Uint8Array,
                ) => Observable<Option<ITuple<[Perbill, u128]>>>,
                [u32, AccountId32]
            >;
        };
        sudo: {
            /**
             * The `AccountId` of the sudo key.
             **/
            key: AugmentedQuery<ApiType, () => Observable<Option<AccountId32>>, []>;
        };
        system: {
            /**
             * The full account information for a particular account ID.
             **/
            account: AugmentedQuery<
                ApiType,
                (arg: AccountId32 | string | Uint8Array) => Observable<FrameSystemAccountInfo>,
                [AccountId32]
            >;
            /**
             * Total length (in bytes) for all extrinsics put together, for the current block.
             **/
            allExtrinsicsLen: AugmentedQuery<ApiType, () => Observable<Option<u32>>, []>;
            /**
             * Map of block numbers to block hashes.
             **/
            blockHash: AugmentedQuery<ApiType, (arg: u32 | AnyNumber | Uint8Array) => Observable<H256>, [u32]>;
            /**
             * The current weight for the block.
             **/
            blockWeight: AugmentedQuery<ApiType, () => Observable<FrameSupportDispatchPerDispatchClassWeight>, []>;
            /**
             * Digest of the current block, also part of the block header.
             **/
            digest: AugmentedQuery<ApiType, () => Observable<SpRuntimeDigest>, []>;
            /**
             * The number of events in the `Events<T>` list.
             **/
            eventCount: AugmentedQuery<ApiType, () => Observable<u32>, []>;
            /**
             * Events deposited for the current block.
             *
             * NOTE: The item is unbound and should therefore never be read on chain.
             * It could otherwise inflate the PoV size of a block.
             *
             * Events have a large in-memory size. Box the events to not go out-of-memory
             * just in case someone still reads them from within the runtime.
             **/
            events: AugmentedQuery<ApiType, () => Observable<Vec<FrameSystemEventRecord>>, []>;
            /**
             * Mapping between a topic (represented by T::Hash) and a vector of indexes
             * of events in the `<Events<T>>` list.
             *
             * All topic vectors have deterministic storage locations depending on the topic. This
             * allows light-clients to leverage the changes trie storage tracking mechanism and
             * in case of changes fetch the list of events of interest.
             *
             * The value has the type `(T::BlockNumber, EventIndex)` because if we used only just
             * the `EventIndex` then in case if the topic has the same contents on the next block
             * no notification will be triggered thus the event might be lost.
             **/
            eventTopics: AugmentedQuery<
                ApiType,
                (arg: H256 | string | Uint8Array) => Observable<Vec<ITuple<[u32, u32]>>>,
                [H256]
            >;
            /**
             * The execution phase of the block.
             **/
            executionPhase: AugmentedQuery<ApiType, () => Observable<Option<FrameSystemPhase>>, []>;
            /**
             * Total extrinsics count for the current block.
             **/
            extrinsicCount: AugmentedQuery<ApiType, () => Observable<Option<u32>>, []>;
            /**
             * Extrinsics data for the current block (maps an extrinsic's index to its data).
             **/
            extrinsicData: AugmentedQuery<ApiType, (arg: u32 | AnyNumber | Uint8Array) => Observable<Bytes>, [u32]>;
            /**
             * Stores the `spec_version` and `spec_name` of when the last runtime upgrade happened.
             **/
            lastRuntimeUpgrade: AugmentedQuery<
                ApiType,
                () => Observable<Option<FrameSystemLastRuntimeUpgradeInfo>>,
                []
            >;
            /**
             * The current block number being processed. Set by `execute_block`.
             **/
            number: AugmentedQuery<ApiType, () => Observable<u32>, []>;
            /**
             * Hash of the previous block.
             **/
            parentHash: AugmentedQuery<ApiType, () => Observable<H256>, []>;
            /**
             * True if we have upgraded so that AccountInfo contains three types of `RefCount`. False
             * (default) if not.
             **/
            upgradedToTripleRefCount: AugmentedQuery<ApiType, () => Observable<bool>, []>;
            /**
             * True if we have upgraded so that `type RefCount` is `u32`. False (default) if not.
             **/
            upgradedToU32RefCount: AugmentedQuery<ApiType, () => Observable<bool>, []>;
        };
        technicalCommittee: {
            /**
             * The current members of the collective. This is stored sorted (just by value).
             **/
            members: AugmentedQuery<ApiType, () => Observable<Vec<AccountId32>>, []>;
            /**
             * The prime member that helps determine the default vote behavior in case of absentations.
             **/
            prime: AugmentedQuery<ApiType, () => Observable<Option<AccountId32>>, []>;
            /**
             * Proposals so far.
             **/
            proposalCount: AugmentedQuery<ApiType, () => Observable<u32>, []>;
            /**
             * Actual proposal for a given hash, if it's current.
             **/
            proposalOf: AugmentedQuery<ApiType, (arg: H256 | string | Uint8Array) => Observable<Option<Call>>, [H256]>;
            /**
             * The hashes of the active proposals.
             **/
            proposals: AugmentedQuery<ApiType, () => Observable<Vec<H256>>, []>;
            /**
             * Votes on a given proposal, if it is ongoing.
             **/
            voting: AugmentedQuery<
                ApiType,
                (arg: H256 | string | Uint8Array) => Observable<Option<PalletCollectiveVotes>>,
                [H256]
            >;
        };
        technicalMembership: {
            /**
             * The current membership, stored as an ordered Vec.
             **/
            members: AugmentedQuery<ApiType, () => Observable<Vec<AccountId32>>, []>;
            /**
             * The current prime member, if one exists.
             **/
            prime: AugmentedQuery<ApiType, () => Observable<Option<AccountId32>>, []>;
        };
        timestamp: {
            /**
             * Did the timestamp get updated in this block?
             **/
            didUpdate: AugmentedQuery<ApiType, () => Observable<bool>, []>;
            /**
             * Current time for the current block.
             **/
            now: AugmentedQuery<ApiType, () => Observable<u64>, []>;
        };
        tips: {
            /**
             * Simple preimage lookup from the reason's hash to the original data. Again, has an
             * insecure enumerable hash since the key is guaranteed to be the result of a secure hash.
             **/
            reasons: AugmentedQuery<ApiType, (arg: H256 | string | Uint8Array) => Observable<Option<Bytes>>, [H256]>;
            /**
             * TipsMap that are not yet completed. Keyed by the hash of `(reason, who)` from the value.
             * This has the insecure enumerable hash function since the key itself is already
             * guaranteed to be a secure hash.
             **/
            tips: AugmentedQuery<
                ApiType,
                (arg: H256 | string | Uint8Array) => Observable<Option<PalletTipsOpenTip>>,
                [H256]
            >;
        };
        transactionPayment: {
            nextFeeMultiplier: AugmentedQuery<ApiType, () => Observable<u128>, []>;
            storageVersion: AugmentedQuery<ApiType, () => Observable<PalletTransactionPaymentReleases>, []>;
        };
        treasury: {
            /**
             * Proposal indices that have been approved but not yet awarded.
             **/
            approvals: AugmentedQuery<ApiType, () => Observable<Vec<u32>>, []>;
            /**
             * Number of proposals that have been made.
             **/
            proposalCount: AugmentedQuery<ApiType, () => Observable<u32>, []>;
            /**
             * Proposals that have been made.
             **/
            proposals: AugmentedQuery<
                ApiType,
                (arg: u32 | AnyNumber | Uint8Array) => Observable<Option<PalletTreasuryProposal>>,
                [u32]
            >;
        };
        vesting: {
            /**
             * Storage version of the pallet.
             *
             * New networks start with latest version, as determined by the genesis build.
             **/
            storageVersion: AugmentedQuery<ApiType, () => Observable<PalletVestingReleases>, []>;
            /**
             * Information regarding the vesting of a given account.
             **/
            vesting: AugmentedQuery<
                ApiType,
                (arg: AccountId32 | string | Uint8Array) => Observable<Option<Vec<PalletVestingVestingInfo>>>,
                [AccountId32]
            >;
        };
        voterList: {
            /**
             * Counter for the related counted storage map
             **/
            counterForListNodes: AugmentedQuery<ApiType, () => Observable<u32>, []>;
            /**
             * A bag stored in storage.
             *
             * Stores a `Bag` struct, which stores head and tail pointers to itself.
             **/
            listBags: AugmentedQuery<
                ApiType,
                (arg: u64 | AnyNumber | Uint8Array) => Observable<Option<PalletBagsListListBag>>,
                [u64]
            >;
            /**
             * A single node, within some bag.
             *
             * Nodes store links forward and back within their respective bags.
             **/
            listNodes: AugmentedQuery<
                ApiType,
                (arg: AccountId32 | string | Uint8Array) => Observable<Option<PalletBagsListListNode>>,
                [AccountId32]
            >;
        };
    } // AugmentedQueries
} // declare module
