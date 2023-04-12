# Voting.sol unit tests

The test suite uses a mock contract (VotingMock.sol) to set testing state for the original contract (Voting.sol).

- it initializes a voters mapping with sample accounts from Ganache ten testing accounts.
- it sets two sample proposals list: one before the voting session and one for tallying votes.
- has helper functions to set workflowStatus and to get the sample proposals list.

The test suite starts by testing the setup functions (getters, modifiers and state change functions), then follows the logic of the workflow.

Here is a complete hierarchy of the test suite execution path:

## Contract: Voting

### SETUP

#### Check workflow initial state

        ✔ workflowStatus should be RegisteringVoters

#### Check getters and modifiers

        ✔ Should get a voter
        ✔ Check onlyVoters modifier

#### Check workflow state changes

##### Start Proposals Registering

          ✔ Check startProposalsRegistering
          ✔ Should emit "WorkflowStatusChange" event

##### End Proposals Registering

          ✔ Check endProposalsRegistering
          ✔ Should emit "WorkflowStatusChange" event

##### Start Voting Session

          ✔ Check startVotingSession
          ✔ Should emit "WorkflowStatusChange" event

##### End Voting Session

          ✔ Check endVotingSession
          ✔ Should emit "WorkflowStatusChange" event

### REGISTRATION

      ✔ Should revert when registration is not open

#### Registration is open

        ✔ workflowStatus should be RegisteringVoters

#### Adding new voters

          ✔ Should revert when voter is already registered
          ✔ Should be OK when voter is not already registered
          ✔ Should emit "VoterRegistered" event

### PROPOSAL

      ✔ Should revert when proposal session is not open

#### Proposal Registration is open

        ✔ workflowStatus should be ProposalsRegistrationStarted

##### Adding new proposals

          ✔ Should revert when description is empty
          ✔ Proposals array should have the GENESIS proposal
          ✔ Proposals array length should have been increased by 1
          ✔ Should emit "VoterRegistered" event

### VOTE

      ✔ Should revert when voting session is not open

#### Proposal Registration is open

        ✔ workflowStatus should be VotingSessionStarted

##### Casting votes

          ✔ Should revert when voter has already voted
          ✔ Should revert when voting on a proposal that doesn't exist
          ✔ Should set the voters votedProposalId property
          ✔ Should set the voters hasVoted property to true
          ✔ Should increment the proposal's voting count in the proposals array
          ✔ Should emit "Voted" event

### TALLY VOTE

      ✔ Should revert when voting session is not ended

#### Tallying votes started

        ✔ workflowStatus should be VotingSessionEnded
        ✔ winningProposalID should be 0

##### Tallying votes

        ✔ Should set winningProposalId to the winning proposal
