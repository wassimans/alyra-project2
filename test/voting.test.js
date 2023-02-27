
const {BN, expectRevert, expectEvent} = require('@openzeppelin/test-helpers');
const {expect} = require('chai');
const VotingMock = artifacts.require("VotingMock");
const Chance = require('chance');

const REGISTERING_VOTERS = new BN(0);
const PROPOSALS_REGISTRATION_STARTED = new BN(1);
const PROPOSALS_REGISTRATION_ENDED = new BN(2);
const VOTING_SESSION_STARTED = new BN(3);
const VOTING_SESSION_ENDED = new BN(4);
const VOTES_TALLIED = new BN(5);

// Initialize a sample list of five addresses
// Add accounts 1 to 5 from Ganache test accounts
const VOTERS = [
    "0x8858db2541A6127277494b1B402115567e942d52",
    "0xa5e7bcc085F059ba3F6EC2A62Aec0521D9b3015d",
    "0x56F4E98e0335f169C5B318197E1ED5d9165D14cc",
    "0x5bA9D25e32e165c67c60Fd3C8eDcbFA7f8Cd9130",
    "0xBC784BFBD5b43Ad5030a6367dE49CA5B6E312d93"
];

const DESCRIPTION = "This is a proposal description";

// Voters mapping
let proposalsArray = [];

// Voting contract instance
let voting;

contract("Voting", function (accounts) {
    const OWNER = accounts[0];

    describe('Check workflow initial state', function () {
        beforeEach(async function () {
            voting = await VotingMock.new();
        });
    
        it('workflowStatus should be RegisteringVoters', async function () {
            expect(await voting.workflowStatus()).to.be.bignumber.equal(REGISTERING_VOTERS);
        });
    });

    describe('Check getters and modifiers', function () {
        beforeEach(async function () {
            voting = await VotingMock.new();
        });

        it('Should get a voter', async function () {
            const voter1 = VOTERS[0];
            const voter2 = VOTERS[1];
            // Register voter1
            await voting.addVoter(voter1, {from: OWNER});
            // Get voter2 data
            const voter2_data = await voting.getVoter(voter2, {from: voter1});
            // Verify data
            await expect(voter2_data['isRegistered']).to.equal(false);
            await expect(voter2_data['hasVoted']).to.equal(false);
            await expect(voter2_data['votedProposalId']).to.be.bignumber.equal(new BN(0));
        });
    
        it('Check onlyVoters modifier', async function () {
            const voter1 = VOTERS[0];
            const voter2 = VOTERS[1];
            const error_msg = "You're not a voter";
            await expectRevert(voting.getVoter(voter2, {from: voter1}), error_msg);
            // Register voter1
            await voting.addVoter(voter1, {from: OWNER});
            // Get voter2 data
            const voter2_data = await voting.getVoter(voter2, {from: voter1});
            // Verify data
            await expect(voter2_data['isRegistered']).to.equal(false);
            await expect(voter2_data['hasVoted']).to.equal(false);
            await expect(voter2_data['votedProposalId']).to.be.bignumber.equal(new BN(0));
        });
    });

    describe('REGISTRATION', function () {

        beforeEach(async function () {
            voting = await VotingMock.new();
        });

        it('Should revert when registration is not open', async function () {
            // Change 'workflowStatus' to any status other than REGISTERING_VOTERS
            await voting.startProposalsRegistering({from: OWNER});
            const voter1 = VOTERS[0];
            const error_msg = "Voters registration is not open yet";
            // Register voter1
            await expectRevert(voting.addVoter(voter1, {from: OWNER}), error_msg);
        });

        describe('Registration is open', function () {

            it('workflowStatus should be RegisteringVoters', async function () {
                expect(await voting.workflowStatus()).to.be.bignumber.equal(REGISTERING_VOTERS);
            }); 

            describe('Adding new voters', function () {

                it('Should revert when voter is already registered', async function () {
                    const voter1 = VOTERS[0];
                    const error_msg = "Already registered";
                    // Register voter1
                    await voting.addVoter(voter1, {from: OWNER});
                    await expectRevert(voting.addVoter(voter1, {from: OWNER}), error_msg);
                });

                it('Should be OK when voter is not already registered', async function () {
                    const voter1 = VOTERS[0];
                    const voter2 = VOTERS[1];
                    await voting.addVoter(voter1, {from: OWNER});
                    await voting.addVoter(voter2, {from: OWNER});
                    // Get voter2 data
                    const voter2_data = await voting.getVoter(voter2, {from: voter1});
                    // Verify data
                    await expect(voter2_data['isRegistered']).to.equal(true);
                });

                it('Should emit "VoterRegistered" event', async function () {
                    const voter1 = VOTERS[0];
                    expectEvent(
                        await voting.addVoter(voter1, {from: OWNER}),
                        'VoterRegistered',
                        { voterAddress: voter1 },
                    );
                });
            });
        });
    });

    describe('PROPOSAL', function () {
        let voter1;
        let proposalArray;

        beforeEach(async function () {
            voting = await VotingMock.new();
            voter1 = VOTERS[0];
            await voting.addVoter(voter1, {from: OWNER});
            await voting.startProposalsRegistering({from: OWNER});
        });

        it('Should revert when proposal session is not open', async function () {
            // Change 'workflowStatus' to any status other than PROPOSALS_REGISTRATION_STARTED
            await voting.setWorkflowStatus(REGISTERING_VOTERS, {from: OWNER});
            const error_msg = "Proposals are not allowed yet";
            await expectRevert(voting.addProposal(DESCRIPTION, {from: voter1}), error_msg);
        });

        describe('Proposal Registration is open', function () {

            it('workflowStatus should be ProposalsRegistrationStarted', async function () {
                expect(await voting.workflowStatus()).to.be.bignumber.equal(PROPOSALS_REGISTRATION_STARTED);
            });

            describe('Adding new proposals', function () {

                it('Should revert when description is empty', async function () {
                    const error_msg = "Vous ne pouvez pas ne rien proposer";
                    await expectRevert(voting.addProposal('', {from: voter1}), error_msg);
                });

                it('Proposals array should have the GENESIS proposal', async function () {
                    proposalArray = await voting.getProposalArray({from: OWNER});
                    expect(proposalArray[0].description).to.equal('GENESIS');
                });

                it('Proposals array length should have been increased by 1', async function () {
                    const lengthBeforeAddition = proposalArray.length;
                    await voting.addProposal(DESCRIPTION, {from: voter1});
                    proposalArray = await voting.getProposalArray({from: OWNER});
                    const lengthAfterAddition = proposalArray.length;
                    expect(lengthAfterAddition).to.equal(lengthBeforeAddition + 1);
                });

                it('Should emit "VoterRegistered" event', async function () {
                    proposalArray = await voting.getProposalArray({from: OWNER});
                    expectEvent(
                        await voting.addProposal(DESCRIPTION, {from: voter1}),
                        'ProposalRegistered',
                        { proposalId: new BN(proposalArray.length)},
                    );
                });
            })
        });
    });

    describe('VOTE', function () {
        let voter1;
        let voter2;
        let proposalArray;

        beforeEach(async function () {
            voting = await VotingMock.new();
            voter1 = VOTERS[0];
            voter2 = VOTERS[1];
            await voting.addVoter(voter1, {from: OWNER});
            await voting.addVoter(voter2, {from: OWNER});
            await voting.setWorkflowStatus(VOTING_SESSION_STARTED, {from: OWNER});
            await voting.setSampleProposals({from: OWNER});
        });

        it('Should revert when voting session is not open', async function () {
            // Change 'workflowStatus' to any status other than VOTING_SESSION_STARTED
            await voting.setWorkflowStatus(REGISTERING_VOTERS, {from: OWNER});
            const error_msg = "Voting session havent started yet";
            await expectRevert(voting.setVote(new BN(1), {from: voter1}), error_msg);
        });

        describe('Proposal Registration is open', function () {

            it('workflowStatus should be VotingSessionStarted', async function () {
                expect(await voting.workflowStatus()).to.be.bignumber.equal(VOTING_SESSION_STARTED);
            });

            describe('Casting votes', function () {

                it('Should revert when voter has already voted', async function () {
                    const error_msg = "You have already voted";
                    await voting.setVote(new BN(1), {from: voter1});
                    await expectRevert(voting.setVote(new BN(1), {from: voter1}), error_msg);
                });

                it('Should revert when voting on a proposal that doesn\'t exist', async function () {
                    const error_msg = "Proposal not found";
                    await expectRevert(voting.setVote(new BN(999), {from: voter1}), error_msg);
                });

                it('Should set the voter\s votedProposalId property', async function () {
                    let voter2_data = await voting.getVoter(voter2, {from: voter1});
                    const initialId = voter2_data.votedProposalId;
                    await voting.setVote(new BN(1), {from: voter2});
                    voter2_data = await voting.getVoter(voter2, {from: voter1});
                    const newId = voter2_data.votedProposalId;
                    expect(initialId).to.not.equal(newId);
                });

                it('Should set the voter\s hasVoted property to true', async function () {
                    let voter2_data = await voting.getVoter(voter2, {from: voter1});
                    const initialId = voter2_data.hasVoted;
                    expect(voter2_data.hasVoted).to.equal(false);
                    await voting.setVote(new BN(1), {from: voter2});
                    voter2_data = await voting.getVoter(voter2, {from: voter1});
                    expect(voter2_data.hasVoted).to.equal(true);
                });

                it('Should increment the proposal\'s voting count in the proposals array', async function () {
                    proposalIdToBeVoted = new BN(1);
                    proposalArray = await voting.getProposalArray({from: OWNER});
                    initialProposalVotingCount = proposalArray[proposalIdToBeVoted].voteCount;
                    // Vote two times for the proposal
                    await voting.setVote(proposalIdToBeVoted, {from: voter1});
                    await voting.setVote(proposalIdToBeVoted, {from: voter2});
                    // Get the updated proposals array data
                    proposalArray = await voting.getProposalArray({from: OWNER});
                    newProposalVotingCount = proposalArray[proposalIdToBeVoted].voteCount;
                    expect(parseInt(newProposalVotingCount)).to.equal(parseInt(initialProposalVotingCount) + 2);
                });

                it('Should emit "Voted" event', async function () {
                    proposalIdToBeVoted = new BN(1);
                    expectEvent(
                        await voting.setVote(proposalIdToBeVoted, {from: voter1}),
                        'Voted',
                        { voter: voter1, proposalId: proposalIdToBeVoted},
                    );
                });
            })
        });
    });

    describe('TALLY VOTE', function () {
        let proposalArray;

        beforeEach(async function () {
            voting = await VotingMock.new();
            await voting.setWorkflowStatus(VOTING_SESSION_ENDED, {from: OWNER});
            // await voting.setSampleProposalsForTallyingVotes({from: OWNER});
        });

        it('Should revert when voting session is not ended', async function () {
            // Change 'workflowStatus' to any status other than VOTING_SESSION_ENDED
            await voting.setWorkflowStatus(REGISTERING_VOTERS, {from: OWNER});
            const error_msg = "Current status is not voting session ended";
            await expectRevert(voting.tallyVotes({from: OWNER}), error_msg);
        });

        describe('Tallying votes started', function () {

            it('workflowStatus should be VotingSessionEnded', async function () {
                expect(await voting.workflowStatus()).to.be.bignumber.equal(VOTING_SESSION_ENDED);
            });

            it('winningProposalID should be 0', async function () {
                expect(await voting.winningProposalID()).to.be.bignumber.equal(new BN(0));
            });

            describe('Tallying votes', function () {

                it('Should revert when voter has already voted', async function () {
                    proposalArray = await voting.getProposalArray({from: OWNER});
                    let winningProposalId = 0;
                    for (let p = 0; p < proposalArray.length; p++) {
                         if (proposalArray[p].voteCount > proposalArray[winningProposalId].voteCount) {
                            winningProposalId = p;
                        }
                     }
                     await voting.tallyVotes({from: OWNER});
                     expect(winningProposalId).to.be.bignumber.equal(voting.winningProposalID());
                });
            });
        });
    });
});

