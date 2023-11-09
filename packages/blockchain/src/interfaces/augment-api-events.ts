// Auto-generated via `yarn polkadot-types-from-chain`, do not edit
/* eslint-disable */

// import type lookup before we augment - in some environments
// this is required to allow for ambient/previous definitions
import '@polkadot/api-base/types/events';

import type {ApiTypes, AugmentedEvent} from '@polkadot/api-base/types';
import type {
    Bytes,
    Null,
    Option,
    Result,
    U256,
    U8aFixed,
    Vec,
    bool,
    u128,
    u16,
    u32,
    u64,
    u8,
} from '@polkadot/types-codec';
import type {ITuple} from '@polkadot/types-codec/types';
import type {AccountId32, H160, H256} from '@polkadot/types/interfaces/runtime';
import {
    CereDevRuntimeProxyType,
    DdcPrimitivesNodePubKey,
    FrameSupportDispatchDispatchInfo,
    FrameSupportScheduleLookupError,
    FrameSupportTokensMiscBalanceStatus,
    PalletDdcStakingEraRewardPoints,
    PalletDemocracyVoteAccountVote,
    PalletDemocracyVoteThreshold,
    PalletElectionProviderMultiPhaseElectionCompute,
    PalletImOnlineSr25519AppSr25519Public,
    PalletMultisigTimepoint,
    PalletNominationPoolsPoolState,
    PalletStakingExposure,
    PalletStakingValidatorPrefs,
    SpFinalityGrandpaAppPublic,
    SpNposElectionsElectionScore,
    SpRuntimeDispatchError,
} from '@polkadot/types/lookup';

export type __AugmentedEvent<ApiType extends ApiTypes> = AugmentedEvent<ApiType>;

declare module '@polkadot/api-base/types/events' {
    interface AugmentedEvents<ApiType extends ApiTypes> {
        balances: {
            /**
             * A balance was set by root.
             **/
            BalanceSet: AugmentedEvent<
                ApiType,
                [who: AccountId32, free: u128, reserved: u128],
                {who: AccountId32; free: u128; reserved: u128}
            >;
            /**
             * Some amount was deposited (e.g. for transaction fees).
             **/
            Deposit: AugmentedEvent<ApiType, [who: AccountId32, amount: u128], {who: AccountId32; amount: u128}>;
            /**
             * An account was removed whose balance was non-zero but below ExistentialDeposit,
             * resulting in an outright loss.
             **/
            DustLost: AugmentedEvent<
                ApiType,
                [account: AccountId32, amount: u128],
                {account: AccountId32; amount: u128}
            >;
            /**
             * An account was created with some free balance.
             **/
            Endowed: AugmentedEvent<
                ApiType,
                [account: AccountId32, freeBalance: u128],
                {account: AccountId32; freeBalance: u128}
            >;
            /**
             * Some balance was reserved (moved from free to reserved).
             **/
            Reserved: AugmentedEvent<ApiType, [who: AccountId32, amount: u128], {who: AccountId32; amount: u128}>;
            /**
             * Some balance was moved from the reserve of the first account to the second account.
             * Final argument indicates the destination balance type.
             **/
            ReserveRepatriated: AugmentedEvent<
                ApiType,
                [
                    from: AccountId32,
                    to: AccountId32,
                    amount: u128,
                    destinationStatus: FrameSupportTokensMiscBalanceStatus,
                ],
                {
                    from: AccountId32;
                    to: AccountId32;
                    amount: u128;
                    destinationStatus: FrameSupportTokensMiscBalanceStatus;
                }
            >;
            /**
             * Some amount was removed from the account (e.g. for misbehavior).
             **/
            Slashed: AugmentedEvent<ApiType, [who: AccountId32, amount: u128], {who: AccountId32; amount: u128}>;
            /**
             * Transfer succeeded.
             **/
            Transfer: AugmentedEvent<
                ApiType,
                [from: AccountId32, to: AccountId32, amount: u128],
                {from: AccountId32; to: AccountId32; amount: u128}
            >;
            /**
             * Some balance was unreserved (moved from reserved to free).
             **/
            Unreserved: AugmentedEvent<ApiType, [who: AccountId32, amount: u128], {who: AccountId32; amount: u128}>;
            /**
             * Some amount was withdrawn from the account (e.g. for transaction fees).
             **/
            Withdraw: AugmentedEvent<ApiType, [who: AccountId32, amount: u128], {who: AccountId32; amount: u128}>;
        };
        bounties: {
            /**
             * A bounty is awarded to a beneficiary.
             **/
            BountyAwarded: AugmentedEvent<
                ApiType,
                [index: u32, beneficiary: AccountId32],
                {index: u32; beneficiary: AccountId32}
            >;
            /**
             * A bounty proposal is funded and became active.
             **/
            BountyBecameActive: AugmentedEvent<ApiType, [index: u32], {index: u32}>;
            /**
             * A bounty is cancelled.
             **/
            BountyCanceled: AugmentedEvent<ApiType, [index: u32], {index: u32}>;
            /**
             * A bounty is claimed by beneficiary.
             **/
            BountyClaimed: AugmentedEvent<
                ApiType,
                [index: u32, payout: u128, beneficiary: AccountId32],
                {index: u32; payout: u128; beneficiary: AccountId32}
            >;
            /**
             * A bounty expiry is extended.
             **/
            BountyExtended: AugmentedEvent<ApiType, [index: u32], {index: u32}>;
            /**
             * New bounty proposal.
             **/
            BountyProposed: AugmentedEvent<ApiType, [index: u32], {index: u32}>;
            /**
             * A bounty proposal was rejected; funds were slashed.
             **/
            BountyRejected: AugmentedEvent<ApiType, [index: u32, bond: u128], {index: u32; bond: u128}>;
        };
        cereDDCModule: {
            /**
             * A data string was changed. \[who\]
             **/
            DataStringChanged: AugmentedEvent<ApiType, [AccountId32]>;
            /**
             * A data string was set. \[who\]
             **/
            DataStringSet: AugmentedEvent<ApiType, [AccountId32]>;
        };
        chainBridge: {
            /**
             * Chain now available for transfers (chain_id)
             **/
            ChainWhitelisted: AugmentedEvent<ApiType, [u8]>;
            /**
             * FunglibleTransfer is for relaying fungibles (dest_id, nonce, resource_id, amount, recipient, metadata)
             **/
            FungibleTransfer: AugmentedEvent<ApiType, [u8, u64, U8aFixed, U256, Bytes]>;
            /**
             * GenericTransfer is for a generic data payload (dest_id, nonce, resource_id, metadata)
             **/
            GenericTransfer: AugmentedEvent<ApiType, [u8, u64, U8aFixed, Bytes]>;
            /**
             * NonFungibleTransfer is for relaying NFTS (dest_id, nonce, resource_id, token_id, recipient, metadata)
             **/
            NonFungibleTransfer: AugmentedEvent<ApiType, [u8, u64, U8aFixed, Bytes, Bytes, Bytes]>;
            /**
             * Voting successful for a proposal
             **/
            ProposalApproved: AugmentedEvent<ApiType, [u8, u64]>;
            /**
             * Execution of call failed
             **/
            ProposalFailed: AugmentedEvent<ApiType, [u8, u64]>;
            /**
             * Voting rejected a proposal
             **/
            ProposalRejected: AugmentedEvent<ApiType, [u8, u64]>;
            /**
             * Execution of call succeeded
             **/
            ProposalSucceeded: AugmentedEvent<ApiType, [u8, u64]>;
            /**
             * Relayer added to set
             **/
            RelayerAdded: AugmentedEvent<ApiType, [AccountId32]>;
            /**
             * Relayer removed from set
             **/
            RelayerRemoved: AugmentedEvent<ApiType, [AccountId32]>;
            /**
             * Vote threshold has changed (new_threshold)
             **/
            RelayerThresholdChanged: AugmentedEvent<ApiType, [u32]>;
            /**
             * Vot submitted against proposal
             **/
            VoteAgainst: AugmentedEvent<ApiType, [u8, u64, AccountId32]>;
            /**
             * Vote submitted in favour of proposal
             **/
            VoteFor: AugmentedEvent<ApiType, [u8, u64, AccountId32]>;
        };
        childBounties: {
            /**
             * A child-bounty is added.
             **/
            Added: AugmentedEvent<ApiType, [index: u32, childIndex: u32], {index: u32; childIndex: u32}>;
            /**
             * A child-bounty is awarded to a beneficiary.
             **/
            Awarded: AugmentedEvent<
                ApiType,
                [index: u32, childIndex: u32, beneficiary: AccountId32],
                {index: u32; childIndex: u32; beneficiary: AccountId32}
            >;
            /**
             * A child-bounty is cancelled.
             **/
            Canceled: AugmentedEvent<ApiType, [index: u32, childIndex: u32], {index: u32; childIndex: u32}>;
            /**
             * A child-bounty is claimed by beneficiary.
             **/
            Claimed: AugmentedEvent<
                ApiType,
                [index: u32, childIndex: u32, payout: u128, beneficiary: AccountId32],
                {index: u32; childIndex: u32; payout: u128; beneficiary: AccountId32}
            >;
        };
        contracts: {
            /**
             * A contract was called either by a plain account or another contract.
             *
             * # Note
             *
             * Please keep in mind that like all events this is only emitted for successful
             * calls. This is because on failure all storage changes including events are
             * rolled back.
             **/
            Called: AugmentedEvent<
                ApiType,
                [caller: AccountId32, contract: AccountId32],
                {caller: AccountId32; contract: AccountId32}
            >;
            /**
             * A code with the specified hash was removed.
             **/
            CodeRemoved: AugmentedEvent<ApiType, [codeHash: H256], {codeHash: H256}>;
            /**
             * Code with the specified hash has been stored.
             **/
            CodeStored: AugmentedEvent<ApiType, [codeHash: H256], {codeHash: H256}>;
            /**
             * A contract's code was updated.
             **/
            ContractCodeUpdated: AugmentedEvent<
                ApiType,
                [contract: AccountId32, newCodeHash: H256, oldCodeHash: H256],
                {contract: AccountId32; newCodeHash: H256; oldCodeHash: H256}
            >;
            /**
             * A custom event emitted by the contract.
             **/
            ContractEmitted: AugmentedEvent<
                ApiType,
                [contract: AccountId32, data: Bytes],
                {contract: AccountId32; data: Bytes}
            >;
            /**
             * A contract delegate called a code hash.
             *
             * # Note
             *
             * Please keep in mind that like all events this is only emitted for successful
             * calls. This is because on failure all storage changes including events are
             * rolled back.
             **/
            DelegateCalled: AugmentedEvent<
                ApiType,
                [contract: AccountId32, codeHash: H256],
                {contract: AccountId32; codeHash: H256}
            >;
            /**
             * Contract deployed by address at the specified address.
             **/
            Instantiated: AugmentedEvent<
                ApiType,
                [deployer: AccountId32, contract: AccountId32],
                {deployer: AccountId32; contract: AccountId32}
            >;
            /**
             * Contract has been removed.
             *
             * # Note
             *
             * The only way for a contract to be removed and emitting this event is by calling
             * `seal_terminate`.
             **/
            Terminated: AugmentedEvent<
                ApiType,
                [contract: AccountId32, beneficiary: AccountId32],
                {contract: AccountId32; beneficiary: AccountId32}
            >;
        };
        council: {
            /**
             * A motion was approved by the required threshold.
             **/
            Approved: AugmentedEvent<ApiType, [proposalHash: H256], {proposalHash: H256}>;
            /**
             * A proposal was closed because its threshold was reached or after its duration was up.
             **/
            Closed: AugmentedEvent<
                ApiType,
                [proposalHash: H256, yes: u32, no: u32],
                {proposalHash: H256; yes: u32; no: u32}
            >;
            /**
             * A motion was not approved by the required threshold.
             **/
            Disapproved: AugmentedEvent<ApiType, [proposalHash: H256], {proposalHash: H256}>;
            /**
             * A motion was executed; result will be `Ok` if it returned without error.
             **/
            Executed: AugmentedEvent<
                ApiType,
                [proposalHash: H256, result: Result<Null, SpRuntimeDispatchError>],
                {proposalHash: H256; result: Result<Null, SpRuntimeDispatchError>}
            >;
            /**
             * A single member did some action; result will be `Ok` if it returned without error.
             **/
            MemberExecuted: AugmentedEvent<
                ApiType,
                [proposalHash: H256, result: Result<Null, SpRuntimeDispatchError>],
                {proposalHash: H256; result: Result<Null, SpRuntimeDispatchError>}
            >;
            /**
             * A motion (given hash) has been proposed (by given account) with a threshold (given
             * `MemberCount`).
             **/
            Proposed: AugmentedEvent<
                ApiType,
                [account: AccountId32, proposalIndex: u32, proposalHash: H256, threshold: u32],
                {account: AccountId32; proposalIndex: u32; proposalHash: H256; threshold: u32}
            >;
            /**
             * A motion (given hash) has been voted on by given account, leaving
             * a tally (yes votes and no votes given respectively as `MemberCount`).
             **/
            Voted: AugmentedEvent<
                ApiType,
                [account: AccountId32, proposalHash: H256, voted: bool, yes: u32, no: u32],
                {account: AccountId32; proposalHash: H256; voted: bool; yes: u32; no: u32}
            >;
        };
        ddcClusters: {
            ClusterCreated: AugmentedEvent<ApiType, [clusterId: H160], {clusterId: H160}>;
            ClusterGovParamsSet: AugmentedEvent<ApiType, [clusterId: H160], {clusterId: H160}>;
            ClusterNodeAdded: AugmentedEvent<
                ApiType,
                [clusterId: H160, nodePubKey: DdcPrimitivesNodePubKey],
                {clusterId: H160; nodePubKey: DdcPrimitivesNodePubKey}
            >;
            ClusterNodeRemoved: AugmentedEvent<
                ApiType,
                [clusterId: H160, nodePubKey: DdcPrimitivesNodePubKey],
                {clusterId: H160; nodePubKey: DdcPrimitivesNodePubKey}
            >;
            ClusterParamsSet: AugmentedEvent<ApiType, [clusterId: H160], {clusterId: H160}>;
        };
        ddcCustomers: {
            /**
             * Bucket with specific id created
             **/
            BucketCreated: AugmentedEvent<ApiType, [u64]>;
            /**
             * Total amount charged from all accounts to pay CDN nodes
             **/
            Charged: AugmentedEvent<ApiType, [u128]>;
            /**
             * An account has deposited this amount. \[owner, amount\]
             *
             * NOTE: This event is only emitted when funds are deposited via a dispatchable. Notably,
             * it will not be emitted for staking rewards when they are added to stake.
             **/
            Deposited: AugmentedEvent<ApiType, [AccountId32, u128]>;
            /**
             * An account has initiated unlock for amount. \[owner, amount\]
             **/
            InitiatDepositUnlock: AugmentedEvent<ApiType, [AccountId32, u128]>;
            /**
             * An account has called `withdraw_unlocked_deposit` and removed unlocking chunks worth
             * `Balance` from the unlocking queue. \[owner, amount\]
             **/
            Withdrawn: AugmentedEvent<ApiType, [AccountId32, u128]>;
        };
        ddcMetricsOffchainWorker: {
            NewDdcMetric: AugmentedEvent<ApiType, [AccountId32, Bytes]>;
        };
        ddcNodes: {
            NodeCreated: AugmentedEvent<
                ApiType,
                [nodePubKey: DdcPrimitivesNodePubKey],
                {nodePubKey: DdcPrimitivesNodePubKey}
            >;
            NodeDeleted: AugmentedEvent<
                ApiType,
                [nodePubKey: DdcPrimitivesNodePubKey],
                {nodePubKey: DdcPrimitivesNodePubKey}
            >;
            NodeParamsChanged: AugmentedEvent<
                ApiType,
                [nodePubKey: DdcPrimitivesNodePubKey],
                {nodePubKey: DdcPrimitivesNodePubKey}
            >;
        };
        ddcStaking: {
            /**
             * An account has bonded this amount. \[stash, amount\]
             *
             * NOTE: This event is only emitted when funds are bonded via a dispatchable. Notably,
             * it will not be emitted for staking rewards when they are added to stake.
             **/
            Bonded: AugmentedEvent<ApiType, [AccountId32, u128]>;
            /**
             * An account has stopped participating as either a storage network or CDN participant.
             * \[stash\]
             **/
            Chilled: AugmentedEvent<ApiType, [AccountId32]>;
            /**
             * An account has declared desire to stop participating in CDN or storage network soon.
             * \[stash, cluster, era\]
             **/
            ChillSoon: AugmentedEvent<ApiType, [AccountId32, H160, u32]>;
            PayoutNodes: AugmentedEvent<ApiType, [u32, PalletDdcStakingEraRewardPoints, u128]>;
            /**
             * An account has unbonded this amount. \[stash, amount\]
             **/
            Unbonded: AugmentedEvent<ApiType, [AccountId32, u128]>;
            /**
             * An account has called `withdraw_unbonded` and removed unbonding chunks worth `Balance`
             * from the unlocking queue. \[stash, amount\]
             **/
            Withdrawn: AugmentedEvent<ApiType, [AccountId32, u128]>;
        };
        democracy: {
            /**
             * A proposal_hash has been blacklisted permanently.
             **/
            Blacklisted: AugmentedEvent<ApiType, [proposalHash: H256], {proposalHash: H256}>;
            /**
             * A referendum has been cancelled.
             **/
            Cancelled: AugmentedEvent<ApiType, [refIndex: u32], {refIndex: u32}>;
            /**
             * An account has delegated their vote to another account.
             **/
            Delegated: AugmentedEvent<
                ApiType,
                [who: AccountId32, target: AccountId32],
                {who: AccountId32; target: AccountId32}
            >;
            /**
             * A proposal has been enacted.
             **/
            Executed: AugmentedEvent<
                ApiType,
                [refIndex: u32, result: Result<Null, SpRuntimeDispatchError>],
                {refIndex: u32; result: Result<Null, SpRuntimeDispatchError>}
            >;
            /**
             * An external proposal has been tabled.
             **/
            ExternalTabled: AugmentedEvent<ApiType, []>;
            /**
             * A proposal has been rejected by referendum.
             **/
            NotPassed: AugmentedEvent<ApiType, [refIndex: u32], {refIndex: u32}>;
            /**
             * A proposal has been approved by referendum.
             **/
            Passed: AugmentedEvent<ApiType, [refIndex: u32], {refIndex: u32}>;
            /**
             * A proposal could not be executed because its preimage was invalid.
             **/
            PreimageInvalid: AugmentedEvent<
                ApiType,
                [proposalHash: H256, refIndex: u32],
                {proposalHash: H256; refIndex: u32}
            >;
            /**
             * A proposal could not be executed because its preimage was missing.
             **/
            PreimageMissing: AugmentedEvent<
                ApiType,
                [proposalHash: H256, refIndex: u32],
                {proposalHash: H256; refIndex: u32}
            >;
            /**
             * A proposal's preimage was noted, and the deposit taken.
             **/
            PreimageNoted: AugmentedEvent<
                ApiType,
                [proposalHash: H256, who: AccountId32, deposit: u128],
                {proposalHash: H256; who: AccountId32; deposit: u128}
            >;
            /**
             * A registered preimage was removed and the deposit collected by the reaper.
             **/
            PreimageReaped: AugmentedEvent<
                ApiType,
                [proposalHash: H256, provider: AccountId32, deposit: u128, reaper: AccountId32],
                {proposalHash: H256; provider: AccountId32; deposit: u128; reaper: AccountId32}
            >;
            /**
             * A proposal preimage was removed and used (the deposit was returned).
             **/
            PreimageUsed: AugmentedEvent<
                ApiType,
                [proposalHash: H256, provider: AccountId32, deposit: u128],
                {proposalHash: H256; provider: AccountId32; deposit: u128}
            >;
            /**
             * A proposal got canceled.
             **/
            ProposalCanceled: AugmentedEvent<ApiType, [propIndex: u32], {propIndex: u32}>;
            /**
             * A motion has been proposed by a public account.
             **/
            Proposed: AugmentedEvent<ApiType, [proposalIndex: u32, deposit: u128], {proposalIndex: u32; deposit: u128}>;
            /**
             * An account has secconded a proposal
             **/
            Seconded: AugmentedEvent<
                ApiType,
                [seconder: AccountId32, propIndex: u32],
                {seconder: AccountId32; propIndex: u32}
            >;
            /**
             * A referendum has begun.
             **/
            Started: AugmentedEvent<
                ApiType,
                [refIndex: u32, threshold: PalletDemocracyVoteThreshold],
                {refIndex: u32; threshold: PalletDemocracyVoteThreshold}
            >;
            /**
             * A public proposal has been tabled for referendum vote.
             **/
            Tabled: AugmentedEvent<
                ApiType,
                [proposalIndex: u32, deposit: u128, depositors: Vec<AccountId32>],
                {proposalIndex: u32; deposit: u128; depositors: Vec<AccountId32>}
            >;
            /**
             * An account has cancelled a previous delegation operation.
             **/
            Undelegated: AugmentedEvent<ApiType, [account: AccountId32], {account: AccountId32}>;
            /**
             * An external proposal has been vetoed.
             **/
            Vetoed: AugmentedEvent<
                ApiType,
                [who: AccountId32, proposalHash: H256, until: u32],
                {who: AccountId32; proposalHash: H256; until: u32}
            >;
            /**
             * An account has voted in a referendum
             **/
            Voted: AugmentedEvent<
                ApiType,
                [voter: AccountId32, refIndex: u32, vote: PalletDemocracyVoteAccountVote],
                {voter: AccountId32; refIndex: u32; vote: PalletDemocracyVoteAccountVote}
            >;
        };
        electionProviderMultiPhase: {
            /**
             * An election failed.
             *
             * Not much can be said about which computes failed in the process.
             **/
            ElectionFailed: AugmentedEvent<ApiType, []>;
            /**
             * The election has been finalized, with the given computation and score.
             **/
            ElectionFinalized: AugmentedEvent<
                ApiType,
                [compute: PalletElectionProviderMultiPhaseElectionCompute, score: SpNposElectionsElectionScore],
                {compute: PalletElectionProviderMultiPhaseElectionCompute; score: SpNposElectionsElectionScore}
            >;
            /**
             * An account has been rewarded for their signed submission being finalized.
             **/
            Rewarded: AugmentedEvent<ApiType, [account: AccountId32, value: u128], {account: AccountId32; value: u128}>;
            /**
             * The signed phase of the given round has started.
             **/
            SignedPhaseStarted: AugmentedEvent<ApiType, [round: u32], {round: u32}>;
            /**
             * An account has been slashed for submitting an invalid signed submission.
             **/
            Slashed: AugmentedEvent<ApiType, [account: AccountId32, value: u128], {account: AccountId32; value: u128}>;
            /**
             * A solution was stored with the given compute.
             *
             * If the solution is signed, this means that it hasn't yet been processed. If the
             * solution is unsigned, this means that it has also been processed.
             *
             * The `bool` is `true` when a previous solution was ejected to make room for this one.
             **/
            SolutionStored: AugmentedEvent<
                ApiType,
                [compute: PalletElectionProviderMultiPhaseElectionCompute, prevEjected: bool],
                {compute: PalletElectionProviderMultiPhaseElectionCompute; prevEjected: bool}
            >;
            /**
             * The unsigned phase of the given round has started.
             **/
            UnsignedPhaseStarted: AugmentedEvent<ApiType, [round: u32], {round: u32}>;
        };
        elections: {
            /**
             * A candidate was slashed by amount due to failing to obtain a seat as member or
             * runner-up.
             *
             * Note that old members and runners-up are also candidates.
             **/
            CandidateSlashed: AugmentedEvent<
                ApiType,
                [candidate: AccountId32, amount: u128],
                {candidate: AccountId32; amount: u128}
            >;
            /**
             * Internal error happened while trying to perform election.
             **/
            ElectionError: AugmentedEvent<ApiType, []>;
            /**
             * No (or not enough) candidates existed for this round. This is different from
             * `NewTerm(\[\])`. See the description of `NewTerm`.
             **/
            EmptyTerm: AugmentedEvent<ApiType, []>;
            /**
             * A member has been removed. This should always be followed by either `NewTerm` or
             * `EmptyTerm`.
             **/
            MemberKicked: AugmentedEvent<ApiType, [member: AccountId32], {member: AccountId32}>;
            /**
             * A new term with new_members. This indicates that enough candidates existed to run
             * the election, not that enough have has been elected. The inner value must be examined
             * for this purpose. A `NewTerm(\[\])` indicates that some candidates got their bond
             * slashed and none were elected, whilst `EmptyTerm` means that no candidates existed to
             * begin with.
             **/
            NewTerm: AugmentedEvent<
                ApiType,
                [newMembers: Vec<ITuple<[AccountId32, u128]>>],
                {newMembers: Vec<ITuple<[AccountId32, u128]>>}
            >;
            /**
             * Someone has renounced their candidacy.
             **/
            Renounced: AugmentedEvent<ApiType, [candidate: AccountId32], {candidate: AccountId32}>;
            /**
             * A seat holder was slashed by amount by being forcefully removed from the set.
             **/
            SeatHolderSlashed: AugmentedEvent<
                ApiType,
                [seatHolder: AccountId32, amount: u128],
                {seatHolder: AccountId32; amount: u128}
            >;
        };
        erc20: {
            Remark: AugmentedEvent<ApiType, [H256]>;
        };
        erc721: {
            /**
             * Token removed from the system
             **/
            Burned: AugmentedEvent<ApiType, [U256]>;
            /**
             * New token created
             **/
            Minted: AugmentedEvent<ApiType, [AccountId32, U256]>;
            /**
             * Token transfer between two parties
             **/
            Transferred: AugmentedEvent<ApiType, [AccountId32, AccountId32, U256]>;
        };
        fastUnstake: {
            /**
             * A staker was partially checked for the given eras, but the process did not finish.
             **/
            Checking: AugmentedEvent<
                ApiType,
                [stash: AccountId32, eras: Vec<u32>],
                {stash: AccountId32; eras: Vec<u32>}
            >;
            /**
             * Some internal error happened while migrating stash. They are removed as head as a
             * consequence.
             **/
            Errored: AugmentedEvent<ApiType, [stash: AccountId32], {stash: AccountId32}>;
            /**
             * An internal error happened. Operations will be paused now.
             **/
            InternalError: AugmentedEvent<ApiType, []>;
            /**
             * A staker was slashed for requesting fast-unstake whilst being exposed.
             **/
            Slashed: AugmentedEvent<ApiType, [stash: AccountId32, amount: u128], {stash: AccountId32; amount: u128}>;
            /**
             * A staker was unstaked.
             **/
            Unstaked: AugmentedEvent<
                ApiType,
                [stash: AccountId32, result: Result<Null, SpRuntimeDispatchError>],
                {stash: AccountId32; result: Result<Null, SpRuntimeDispatchError>}
            >;
        };
        grandpa: {
            /**
             * New authority set has been applied.
             **/
            NewAuthorities: AugmentedEvent<
                ApiType,
                [authoritySet: Vec<ITuple<[SpFinalityGrandpaAppPublic, u64]>>],
                {authoritySet: Vec<ITuple<[SpFinalityGrandpaAppPublic, u64]>>}
            >;
            /**
             * Current authority set has been paused.
             **/
            Paused: AugmentedEvent<ApiType, []>;
            /**
             * Current authority set has been resumed.
             **/
            Resumed: AugmentedEvent<ApiType, []>;
        };
        identity: {
            /**
             * A name was cleared, and the given balance returned.
             **/
            IdentityCleared: AugmentedEvent<
                ApiType,
                [who: AccountId32, deposit: u128],
                {who: AccountId32; deposit: u128}
            >;
            /**
             * A name was removed and the given balance slashed.
             **/
            IdentityKilled: AugmentedEvent<
                ApiType,
                [who: AccountId32, deposit: u128],
                {who: AccountId32; deposit: u128}
            >;
            /**
             * A name was set or reset (which will remove all judgements).
             **/
            IdentitySet: AugmentedEvent<ApiType, [who: AccountId32], {who: AccountId32}>;
            /**
             * A judgement was given by a registrar.
             **/
            JudgementGiven: AugmentedEvent<
                ApiType,
                [target: AccountId32, registrarIndex: u32],
                {target: AccountId32; registrarIndex: u32}
            >;
            /**
             * A judgement was asked from a registrar.
             **/
            JudgementRequested: AugmentedEvent<
                ApiType,
                [who: AccountId32, registrarIndex: u32],
                {who: AccountId32; registrarIndex: u32}
            >;
            /**
             * A judgement request was retracted.
             **/
            JudgementUnrequested: AugmentedEvent<
                ApiType,
                [who: AccountId32, registrarIndex: u32],
                {who: AccountId32; registrarIndex: u32}
            >;
            /**
             * A registrar was added.
             **/
            RegistrarAdded: AugmentedEvent<ApiType, [registrarIndex: u32], {registrarIndex: u32}>;
            /**
             * A sub-identity was added to an identity and the deposit paid.
             **/
            SubIdentityAdded: AugmentedEvent<
                ApiType,
                [sub: AccountId32, main: AccountId32, deposit: u128],
                {sub: AccountId32; main: AccountId32; deposit: u128}
            >;
            /**
             * A sub-identity was removed from an identity and the deposit freed.
             **/
            SubIdentityRemoved: AugmentedEvent<
                ApiType,
                [sub: AccountId32, main: AccountId32, deposit: u128],
                {sub: AccountId32; main: AccountId32; deposit: u128}
            >;
            /**
             * A sub-identity was cleared, and the given deposit repatriated from the
             * main identity account to the sub-identity account.
             **/
            SubIdentityRevoked: AugmentedEvent<
                ApiType,
                [sub: AccountId32, main: AccountId32, deposit: u128],
                {sub: AccountId32; main: AccountId32; deposit: u128}
            >;
        };
        imOnline: {
            /**
             * At the end of the session, no offence was committed.
             **/
            AllGood: AugmentedEvent<ApiType, []>;
            /**
             * A new heartbeat was received from `AuthorityId`.
             **/
            HeartbeatReceived: AugmentedEvent<
                ApiType,
                [authorityId: PalletImOnlineSr25519AppSr25519Public],
                {authorityId: PalletImOnlineSr25519AppSr25519Public}
            >;
            /**
             * At the end of the session, at least one validator was found to be offline.
             **/
            SomeOffline: AugmentedEvent<
                ApiType,
                [offline: Vec<ITuple<[AccountId32, PalletStakingExposure]>>],
                {offline: Vec<ITuple<[AccountId32, PalletStakingExposure]>>}
            >;
        };
        indices: {
            /**
             * A account index was assigned.
             **/
            IndexAssigned: AugmentedEvent<ApiType, [who: AccountId32, index: u32], {who: AccountId32; index: u32}>;
            /**
             * A account index has been freed up (unassigned).
             **/
            IndexFreed: AugmentedEvent<ApiType, [index: u32], {index: u32}>;
            /**
             * A account index has been frozen to its current account ID.
             **/
            IndexFrozen: AugmentedEvent<ApiType, [index: u32, who: AccountId32], {index: u32; who: AccountId32}>;
        };
        multisig: {
            /**
             * A multisig operation has been approved by someone.
             **/
            MultisigApproval: AugmentedEvent<
                ApiType,
                [approving: AccountId32, timepoint: PalletMultisigTimepoint, multisig: AccountId32, callHash: U8aFixed],
                {approving: AccountId32; timepoint: PalletMultisigTimepoint; multisig: AccountId32; callHash: U8aFixed}
            >;
            /**
             * A multisig operation has been cancelled.
             **/
            MultisigCancelled: AugmentedEvent<
                ApiType,
                [
                    cancelling: AccountId32,
                    timepoint: PalletMultisigTimepoint,
                    multisig: AccountId32,
                    callHash: U8aFixed,
                ],
                {cancelling: AccountId32; timepoint: PalletMultisigTimepoint; multisig: AccountId32; callHash: U8aFixed}
            >;
            /**
             * A multisig operation has been executed.
             **/
            MultisigExecuted: AugmentedEvent<
                ApiType,
                [
                    approving: AccountId32,
                    timepoint: PalletMultisigTimepoint,
                    multisig: AccountId32,
                    callHash: U8aFixed,
                    result: Result<Null, SpRuntimeDispatchError>,
                ],
                {
                    approving: AccountId32;
                    timepoint: PalletMultisigTimepoint;
                    multisig: AccountId32;
                    callHash: U8aFixed;
                    result: Result<Null, SpRuntimeDispatchError>;
                }
            >;
            /**
             * A new multisig operation has begun.
             **/
            NewMultisig: AugmentedEvent<
                ApiType,
                [approving: AccountId32, multisig: AccountId32, callHash: U8aFixed],
                {approving: AccountId32; multisig: AccountId32; callHash: U8aFixed}
            >;
        };
        nominationPools: {
            /**
             * A member has became bonded in a pool.
             **/
            Bonded: AugmentedEvent<
                ApiType,
                [member: AccountId32, poolId: u32, bonded: u128, joined: bool],
                {member: AccountId32; poolId: u32; bonded: u128; joined: bool}
            >;
            /**
             * A pool has been created.
             **/
            Created: AugmentedEvent<
                ApiType,
                [depositor: AccountId32, poolId: u32],
                {depositor: AccountId32; poolId: u32}
            >;
            /**
             * A pool has been destroyed.
             **/
            Destroyed: AugmentedEvent<ApiType, [poolId: u32], {poolId: u32}>;
            /**
             * A member has been removed from a pool.
             *
             * The removal can be voluntary (withdrawn all unbonded funds) or involuntary (kicked).
             **/
            MemberRemoved: AugmentedEvent<
                ApiType,
                [poolId: u32, member: AccountId32],
                {poolId: u32; member: AccountId32}
            >;
            /**
             * A payout has been made to a member.
             **/
            PaidOut: AugmentedEvent<
                ApiType,
                [member: AccountId32, poolId: u32, payout: u128],
                {member: AccountId32; poolId: u32; payout: u128}
            >;
            /**
             * The active balance of pool `pool_id` has been slashed to `balance`.
             **/
            PoolSlashed: AugmentedEvent<ApiType, [poolId: u32, balance: u128], {poolId: u32; balance: u128}>;
            /**
             * The roles of a pool have been updated to the given new roles. Note that the depositor
             * can never change.
             **/
            RolesUpdated: AugmentedEvent<
                ApiType,
                [root: Option<AccountId32>, stateToggler: Option<AccountId32>, nominator: Option<AccountId32>],
                {root: Option<AccountId32>; stateToggler: Option<AccountId32>; nominator: Option<AccountId32>}
            >;
            /**
             * The state of a pool has changed
             **/
            StateChanged: AugmentedEvent<
                ApiType,
                [poolId: u32, newState: PalletNominationPoolsPoolState],
                {poolId: u32; newState: PalletNominationPoolsPoolState}
            >;
            /**
             * A member has unbonded from their pool.
             *
             * - `balance` is the corresponding balance of the number of points that has been
             * requested to be unbonded (the argument of the `unbond` transaction) from the bonded
             * pool.
             * - `points` is the number of points that are issued as a result of `balance` being
             * dissolved into the corresponding unbonding pool.
             * - `era` is the era in which the balance will be unbonded.
             * In the absence of slashing, these values will match. In the presence of slashing, the
             * number of points that are issued in the unbonding pool will be less than the amount
             * requested to be unbonded.
             **/
            Unbonded: AugmentedEvent<
                ApiType,
                [member: AccountId32, poolId: u32, balance: u128, points: u128, era: u32],
                {member: AccountId32; poolId: u32; balance: u128; points: u128; era: u32}
            >;
            /**
             * The unbond pool at `era` of pool `pool_id` has been slashed to `balance`.
             **/
            UnbondingPoolSlashed: AugmentedEvent<
                ApiType,
                [poolId: u32, era: u32, balance: u128],
                {poolId: u32; era: u32; balance: u128}
            >;
            /**
             * A member has withdrawn from their pool.
             *
             * The given number of `points` have been dissolved in return of `balance`.
             *
             * Similar to `Unbonded` event, in the absence of slashing, the ratio of point to balance
             * will be 1.
             **/
            Withdrawn: AugmentedEvent<
                ApiType,
                [member: AccountId32, poolId: u32, balance: u128, points: u128],
                {member: AccountId32; poolId: u32; balance: u128; points: u128}
            >;
        };
        offences: {
            /**
             * There is an offence reported of the given `kind` happened at the `session_index` and
             * (kind-specific) time slot. This event is not deposited for duplicate slashes.
             * \[kind, timeslot\].
             **/
            Offence: AugmentedEvent<ApiType, [kind: U8aFixed, timeslot: Bytes], {kind: U8aFixed; timeslot: Bytes}>;
        };
        proxy: {
            /**
             * An announcement was placed to make a call in the future.
             **/
            Announced: AugmentedEvent<
                ApiType,
                [real: AccountId32, proxy: AccountId32, callHash: H256],
                {real: AccountId32; proxy: AccountId32; callHash: H256}
            >;
            /**
             * A proxy was added.
             **/
            ProxyAdded: AugmentedEvent<
                ApiType,
                [delegator: AccountId32, delegatee: AccountId32, proxyType: CereDevRuntimeProxyType, delay: u32],
                {delegator: AccountId32; delegatee: AccountId32; proxyType: CereDevRuntimeProxyType; delay: u32}
            >;
            /**
             * A proxy was executed correctly, with the given.
             **/
            ProxyExecuted: AugmentedEvent<
                ApiType,
                [result: Result<Null, SpRuntimeDispatchError>],
                {result: Result<Null, SpRuntimeDispatchError>}
            >;
            /**
             * A proxy was removed.
             **/
            ProxyRemoved: AugmentedEvent<
                ApiType,
                [delegator: AccountId32, delegatee: AccountId32, proxyType: CereDevRuntimeProxyType, delay: u32],
                {delegator: AccountId32; delegatee: AccountId32; proxyType: CereDevRuntimeProxyType; delay: u32}
            >;
            /**
             * A pure account has been created by new proxy with given
             * disambiguation index and proxy type.
             **/
            PureCreated: AugmentedEvent<
                ApiType,
                [pure: AccountId32, who: AccountId32, proxyType: CereDevRuntimeProxyType, disambiguationIndex: u16],
                {pure: AccountId32; who: AccountId32; proxyType: CereDevRuntimeProxyType; disambiguationIndex: u16}
            >;
        };
        recovery: {
            /**
             * Lost account has been successfully recovered by rescuer account.
             **/
            AccountRecovered: AugmentedEvent<
                ApiType,
                [lostAccount: AccountId32, rescuerAccount: AccountId32],
                {lostAccount: AccountId32; rescuerAccount: AccountId32}
            >;
            /**
             * A recovery process for lost account by rescuer account has been closed.
             **/
            RecoveryClosed: AugmentedEvent<
                ApiType,
                [lostAccount: AccountId32, rescuerAccount: AccountId32],
                {lostAccount: AccountId32; rescuerAccount: AccountId32}
            >;
            /**
             * A recovery process has been set up for an account.
             **/
            RecoveryCreated: AugmentedEvent<ApiType, [account: AccountId32], {account: AccountId32}>;
            /**
             * A recovery process has been initiated for lost account by rescuer account.
             **/
            RecoveryInitiated: AugmentedEvent<
                ApiType,
                [lostAccount: AccountId32, rescuerAccount: AccountId32],
                {lostAccount: AccountId32; rescuerAccount: AccountId32}
            >;
            /**
             * A recovery process has been removed for an account.
             **/
            RecoveryRemoved: AugmentedEvent<ApiType, [lostAccount: AccountId32], {lostAccount: AccountId32}>;
            /**
             * A recovery process for lost account by rescuer account has been vouched for by sender.
             **/
            RecoveryVouched: AugmentedEvent<
                ApiType,
                [lostAccount: AccountId32, rescuerAccount: AccountId32, sender: AccountId32],
                {lostAccount: AccountId32; rescuerAccount: AccountId32; sender: AccountId32}
            >;
        };
        scheduler: {
            /**
             * The call for the provided hash was not found so the task has been aborted.
             **/
            CallLookupFailed: AugmentedEvent<
                ApiType,
                [task: ITuple<[u32, u32]>, id: Option<Bytes>, error: FrameSupportScheduleLookupError],
                {task: ITuple<[u32, u32]>; id: Option<Bytes>; error: FrameSupportScheduleLookupError}
            >;
            /**
             * Canceled some task.
             **/
            Canceled: AugmentedEvent<ApiType, [when: u32, index: u32], {when: u32; index: u32}>;
            /**
             * Dispatched some task.
             **/
            Dispatched: AugmentedEvent<
                ApiType,
                [task: ITuple<[u32, u32]>, id: Option<Bytes>, result: Result<Null, SpRuntimeDispatchError>],
                {task: ITuple<[u32, u32]>; id: Option<Bytes>; result: Result<Null, SpRuntimeDispatchError>}
            >;
            /**
             * Scheduled some task.
             **/
            Scheduled: AugmentedEvent<ApiType, [when: u32, index: u32], {when: u32; index: u32}>;
        };
        session: {
            /**
             * New session has happened. Note that the argument is the session index, not the
             * block number as the type might suggest.
             **/
            NewSession: AugmentedEvent<ApiType, [sessionIndex: u32], {sessionIndex: u32}>;
        };
        society: {
            /**
             * A candidate was dropped (due to an excess of bids in the system).
             **/
            AutoUnbid: AugmentedEvent<ApiType, [candidate: AccountId32], {candidate: AccountId32}>;
            /**
             * A membership bid just happened. The given account is the candidate's ID and their offer
             * is the second.
             **/
            Bid: AugmentedEvent<
                ApiType,
                [candidateId: AccountId32, offer: u128],
                {candidateId: AccountId32; offer: u128}
            >;
            /**
             * A candidate has been suspended
             **/
            CandidateSuspended: AugmentedEvent<ApiType, [candidate: AccountId32], {candidate: AccountId32}>;
            /**
             * A member has been challenged
             **/
            Challenged: AugmentedEvent<ApiType, [member: AccountId32], {member: AccountId32}>;
            /**
             * A vote has been placed for a defending member
             **/
            DefenderVote: AugmentedEvent<ApiType, [voter: AccountId32, vote: bool], {voter: AccountId32; vote: bool}>;
            /**
             * Some funds were deposited into the society account.
             **/
            Deposit: AugmentedEvent<ApiType, [value: u128], {value: u128}>;
            /**
             * The society is founded by the given identity.
             **/
            Founded: AugmentedEvent<ApiType, [founder: AccountId32], {founder: AccountId32}>;
            /**
             * A group of candidates have been inducted. The batch's primary is the first value, the
             * batch in full is the second.
             **/
            Inducted: AugmentedEvent<
                ApiType,
                [primary: AccountId32, candidates: Vec<AccountId32>],
                {primary: AccountId32; candidates: Vec<AccountId32>}
            >;
            /**
             * A member has been suspended
             **/
            MemberSuspended: AugmentedEvent<ApiType, [member: AccountId32], {member: AccountId32}>;
            /**
             * A new \[max\] member count has been set
             **/
            NewMaxMembers: AugmentedEvent<ApiType, [max: u32], {max: u32}>;
            /**
             * A suspended member has been judged.
             **/
            SuspendedMemberJudgement: AugmentedEvent<
                ApiType,
                [who: AccountId32, judged: bool],
                {who: AccountId32; judged: bool}
            >;
            /**
             * A candidate was dropped (by their request).
             **/
            Unbid: AugmentedEvent<ApiType, [candidate: AccountId32], {candidate: AccountId32}>;
            /**
             * Society is unfounded.
             **/
            Unfounded: AugmentedEvent<ApiType, [founder: AccountId32], {founder: AccountId32}>;
            /**
             * A candidate was dropped (by request of who vouched for them).
             **/
            Unvouch: AugmentedEvent<ApiType, [candidate: AccountId32], {candidate: AccountId32}>;
            /**
             * A vote has been placed
             **/
            Vote: AugmentedEvent<
                ApiType,
                [candidate: AccountId32, voter: AccountId32, vote: bool],
                {candidate: AccountId32; voter: AccountId32; vote: bool}
            >;
            /**
             * A membership bid just happened by vouching. The given account is the candidate's ID and
             * their offer is the second. The vouching party is the third.
             **/
            Vouch: AugmentedEvent<
                ApiType,
                [candidateId: AccountId32, offer: u128, vouching: AccountId32],
                {candidateId: AccountId32; offer: u128; vouching: AccountId32}
            >;
        };
        staking: {
            /**
             * An account has bonded this amount. \[stash, amount\]
             *
             * NOTE: This event is only emitted when funds are bonded via a dispatchable. Notably,
             * it will not be emitted for staking rewards when they are added to stake.
             **/
            Bonded: AugmentedEvent<ApiType, [stash: AccountId32, amount: u128], {stash: AccountId32; amount: u128}>;
            /**
             * An account has stopped participating as either a validator or nominator.
             **/
            Chilled: AugmentedEvent<ApiType, [stash: AccountId32], {stash: AccountId32}>;
            /**
             * The era payout has been set; the first balance is the validator-payout; the second is
             * the remainder from the maximum amount of reward.
             **/
            EraPaid: AugmentedEvent<
                ApiType,
                [eraIndex: u32, validatorPayout: u128, remainder: u128],
                {eraIndex: u32; validatorPayout: u128; remainder: u128}
            >;
            /**
             * A nominator has been kicked from a validator.
             **/
            Kicked: AugmentedEvent<
                ApiType,
                [nominator: AccountId32, stash: AccountId32],
                {nominator: AccountId32; stash: AccountId32}
            >;
            /**
             * An old slashing report from a prior era was discarded because it could
             * not be processed.
             **/
            OldSlashingReportDiscarded: AugmentedEvent<ApiType, [sessionIndex: u32], {sessionIndex: u32}>;
            /**
             * The stakers' rewards are getting paid.
             **/
            PayoutStarted: AugmentedEvent<
                ApiType,
                [eraIndex: u32, validatorStash: AccountId32],
                {eraIndex: u32; validatorStash: AccountId32}
            >;
            /**
             * The nominator has been rewarded by this amount.
             **/
            Rewarded: AugmentedEvent<ApiType, [stash: AccountId32, amount: u128], {stash: AccountId32; amount: u128}>;
            /**
             * One staker (and potentially its nominators) has been slashed by the given amount.
             **/
            Slashed: AugmentedEvent<ApiType, [staker: AccountId32, amount: u128], {staker: AccountId32; amount: u128}>;
            /**
             * A new set of stakers was elected.
             **/
            StakersElected: AugmentedEvent<ApiType, []>;
            /**
             * The election failed. No new era is planned.
             **/
            StakingElectionFailed: AugmentedEvent<ApiType, []>;
            /**
             * An account has unbonded this amount.
             **/
            Unbonded: AugmentedEvent<ApiType, [stash: AccountId32, amount: u128], {stash: AccountId32; amount: u128}>;
            /**
             * A validator has set their preferences.
             **/
            ValidatorPrefsSet: AugmentedEvent<
                ApiType,
                [stash: AccountId32, prefs: PalletStakingValidatorPrefs],
                {stash: AccountId32; prefs: PalletStakingValidatorPrefs}
            >;
            /**
             * An account has called `withdraw_unbonded` and removed unbonding chunks worth `Balance`
             * from the unlocking queue.
             **/
            Withdrawn: AugmentedEvent<ApiType, [stash: AccountId32, amount: u128], {stash: AccountId32; amount: u128}>;
        };
        sudo: {
            /**
             * The \[sudoer\] just switched identity; the old key is supplied if one existed.
             **/
            KeyChanged: AugmentedEvent<ApiType, [oldSudoer: Option<AccountId32>], {oldSudoer: Option<AccountId32>}>;
            /**
             * A sudo just took place. \[result\]
             **/
            Sudid: AugmentedEvent<
                ApiType,
                [sudoResult: Result<Null, SpRuntimeDispatchError>],
                {sudoResult: Result<Null, SpRuntimeDispatchError>}
            >;
            /**
             * A sudo just took place. \[result\]
             **/
            SudoAsDone: AugmentedEvent<
                ApiType,
                [sudoResult: Result<Null, SpRuntimeDispatchError>],
                {sudoResult: Result<Null, SpRuntimeDispatchError>}
            >;
        };
        system: {
            /**
             * `:code` was updated.
             **/
            CodeUpdated: AugmentedEvent<ApiType, []>;
            /**
             * An extrinsic failed.
             **/
            ExtrinsicFailed: AugmentedEvent<
                ApiType,
                [dispatchError: SpRuntimeDispatchError, dispatchInfo: FrameSupportDispatchDispatchInfo],
                {dispatchError: SpRuntimeDispatchError; dispatchInfo: FrameSupportDispatchDispatchInfo}
            >;
            /**
             * An extrinsic completed successfully.
             **/
            ExtrinsicSuccess: AugmentedEvent<
                ApiType,
                [dispatchInfo: FrameSupportDispatchDispatchInfo],
                {dispatchInfo: FrameSupportDispatchDispatchInfo}
            >;
            /**
             * An account was reaped.
             **/
            KilledAccount: AugmentedEvent<ApiType, [account: AccountId32], {account: AccountId32}>;
            /**
             * A new account was created.
             **/
            NewAccount: AugmentedEvent<ApiType, [account: AccountId32], {account: AccountId32}>;
            /**
             * On on-chain remark happened.
             **/
            Remarked: AugmentedEvent<ApiType, [sender: AccountId32, hash_: H256], {sender: AccountId32; hash_: H256}>;
        };
        technicalCommittee: {
            /**
             * A motion was approved by the required threshold.
             **/
            Approved: AugmentedEvent<ApiType, [proposalHash: H256], {proposalHash: H256}>;
            /**
             * A proposal was closed because its threshold was reached or after its duration was up.
             **/
            Closed: AugmentedEvent<
                ApiType,
                [proposalHash: H256, yes: u32, no: u32],
                {proposalHash: H256; yes: u32; no: u32}
            >;
            /**
             * A motion was not approved by the required threshold.
             **/
            Disapproved: AugmentedEvent<ApiType, [proposalHash: H256], {proposalHash: H256}>;
            /**
             * A motion was executed; result will be `Ok` if it returned without error.
             **/
            Executed: AugmentedEvent<
                ApiType,
                [proposalHash: H256, result: Result<Null, SpRuntimeDispatchError>],
                {proposalHash: H256; result: Result<Null, SpRuntimeDispatchError>}
            >;
            /**
             * A single member did some action; result will be `Ok` if it returned without error.
             **/
            MemberExecuted: AugmentedEvent<
                ApiType,
                [proposalHash: H256, result: Result<Null, SpRuntimeDispatchError>],
                {proposalHash: H256; result: Result<Null, SpRuntimeDispatchError>}
            >;
            /**
             * A motion (given hash) has been proposed (by given account) with a threshold (given
             * `MemberCount`).
             **/
            Proposed: AugmentedEvent<
                ApiType,
                [account: AccountId32, proposalIndex: u32, proposalHash: H256, threshold: u32],
                {account: AccountId32; proposalIndex: u32; proposalHash: H256; threshold: u32}
            >;
            /**
             * A motion (given hash) has been voted on by given account, leaving
             * a tally (yes votes and no votes given respectively as `MemberCount`).
             **/
            Voted: AugmentedEvent<
                ApiType,
                [account: AccountId32, proposalHash: H256, voted: bool, yes: u32, no: u32],
                {account: AccountId32; proposalHash: H256; voted: bool; yes: u32; no: u32}
            >;
        };
        technicalMembership: {
            /**
             * Phantom member, never used.
             **/
            Dummy: AugmentedEvent<ApiType, []>;
            /**
             * One of the members' keys changed.
             **/
            KeyChanged: AugmentedEvent<ApiType, []>;
            /**
             * The given member was added; see the transaction for who.
             **/
            MemberAdded: AugmentedEvent<ApiType, []>;
            /**
             * The given member was removed; see the transaction for who.
             **/
            MemberRemoved: AugmentedEvent<ApiType, []>;
            /**
             * The membership was reset; see the transaction for who the new set is.
             **/
            MembersReset: AugmentedEvent<ApiType, []>;
            /**
             * Two members were swapped; see the transaction for who.
             **/
            MembersSwapped: AugmentedEvent<ApiType, []>;
        };
        tips: {
            /**
             * A new tip suggestion has been opened.
             **/
            NewTip: AugmentedEvent<ApiType, [tipHash: H256], {tipHash: H256}>;
            /**
             * A tip suggestion has been closed.
             **/
            TipClosed: AugmentedEvent<
                ApiType,
                [tipHash: H256, who: AccountId32, payout: u128],
                {tipHash: H256; who: AccountId32; payout: u128}
            >;
            /**
             * A tip suggestion has reached threshold and is closing.
             **/
            TipClosing: AugmentedEvent<ApiType, [tipHash: H256], {tipHash: H256}>;
            /**
             * A tip suggestion has been retracted.
             **/
            TipRetracted: AugmentedEvent<ApiType, [tipHash: H256], {tipHash: H256}>;
            /**
             * A tip suggestion has been slashed.
             **/
            TipSlashed: AugmentedEvent<
                ApiType,
                [tipHash: H256, finder: AccountId32, deposit: u128],
                {tipHash: H256; finder: AccountId32; deposit: u128}
            >;
        };
        transactionPayment: {
            /**
             * A transaction fee `actual_fee`, of which `tip` was added to the minimum inclusion fee,
             * has been paid by `who`.
             **/
            TransactionFeePaid: AugmentedEvent<
                ApiType,
                [who: AccountId32, actualFee: u128, tip: u128],
                {who: AccountId32; actualFee: u128; tip: u128}
            >;
        };
        treasury: {
            /**
             * Some funds have been allocated.
             **/
            Awarded: AugmentedEvent<
                ApiType,
                [proposalIndex: u32, award: u128, account: AccountId32],
                {proposalIndex: u32; award: u128; account: AccountId32}
            >;
            /**
             * Some of our funds have been burnt.
             **/
            Burnt: AugmentedEvent<ApiType, [burntFunds: u128], {burntFunds: u128}>;
            /**
             * Some funds have been deposited.
             **/
            Deposit: AugmentedEvent<ApiType, [value: u128], {value: u128}>;
            /**
             * New proposal.
             **/
            Proposed: AugmentedEvent<ApiType, [proposalIndex: u32], {proposalIndex: u32}>;
            /**
             * A proposal was rejected; funds were slashed.
             **/
            Rejected: AugmentedEvent<ApiType, [proposalIndex: u32, slashed: u128], {proposalIndex: u32; slashed: u128}>;
            /**
             * Spending has finished; this is the amount that rolls over until next spend.
             **/
            Rollover: AugmentedEvent<ApiType, [rolloverBalance: u128], {rolloverBalance: u128}>;
            /**
             * A new spend proposal has been approved.
             **/
            SpendApproved: AugmentedEvent<
                ApiType,
                [proposalIndex: u32, amount: u128, beneficiary: AccountId32],
                {proposalIndex: u32; amount: u128; beneficiary: AccountId32}
            >;
            /**
             * We have ended a spend period and will now allocate funds.
             **/
            Spending: AugmentedEvent<ApiType, [budgetRemaining: u128], {budgetRemaining: u128}>;
        };
        utility: {
            /**
             * Batch of dispatches completed fully with no error.
             **/
            BatchCompleted: AugmentedEvent<ApiType, []>;
            /**
             * Batch of dispatches completed but has errors.
             **/
            BatchCompletedWithErrors: AugmentedEvent<ApiType, []>;
            /**
             * Batch of dispatches did not complete fully. Index of first failing dispatch given, as
             * well as the error.
             **/
            BatchInterrupted: AugmentedEvent<
                ApiType,
                [index: u32, error: SpRuntimeDispatchError],
                {index: u32; error: SpRuntimeDispatchError}
            >;
            /**
             * A call was dispatched.
             **/
            DispatchedAs: AugmentedEvent<
                ApiType,
                [result: Result<Null, SpRuntimeDispatchError>],
                {result: Result<Null, SpRuntimeDispatchError>}
            >;
            /**
             * A single item within a Batch of dispatches has completed with no error.
             **/
            ItemCompleted: AugmentedEvent<ApiType, []>;
            /**
             * A single item within a Batch of dispatches has completed with error.
             **/
            ItemFailed: AugmentedEvent<ApiType, [error: SpRuntimeDispatchError], {error: SpRuntimeDispatchError}>;
        };
        vesting: {
            /**
             * An \[account\] has become fully vested.
             **/
            VestingCompleted: AugmentedEvent<ApiType, [account: AccountId32], {account: AccountId32}>;
            /**
             * The amount vested has been updated. This could indicate a change in funds available.
             * The balance given is the amount which is left unvested (and thus locked).
             **/
            VestingUpdated: AugmentedEvent<
                ApiType,
                [account: AccountId32, unvested: u128],
                {account: AccountId32; unvested: u128}
            >;
        };
        voterList: {
            /**
             * Moved an account from one bag to another.
             **/
            Rebagged: AugmentedEvent<
                ApiType,
                [who: AccountId32, from: u64, to: u64],
                {who: AccountId32; from: u64; to: u64}
            >;
            /**
             * Updated the score of some account to the given amount.
             **/
            ScoreUpdated: AugmentedEvent<ApiType, [who: AccountId32, newScore: u64], {who: AccountId32; newScore: u64}>;
        };
    } // AugmentedEvents
} // declare module