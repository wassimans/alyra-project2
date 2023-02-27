# Voting.sol unit tests
The test suite is uses a mock contract (VotingMock.sol) to set testing state for the original contract (Voting.sol).

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
        ✔ Should get a voter (206ms)
        ✔ Check onlyVoters modifier (267ms)
#### Check workflow state changes
##### Start Proposals Registering
          ✔ Check startProposalsRegistering (91ms)
          ✔ Should emit "WorkflowStatusChange" event (89ms)
##### End Proposals Registering
          ✔ Check endProposalsRegistering (390ms)
          ✔ Should emit "WorkflowStatusChange" event (161ms)
##### Start Voting Session
          ✔ Check startVotingSession (199ms)
          ✔ Should emit "WorkflowStatusChange" event (153ms)
##### End Voting Session
          ✔ Check endVotingSession (262ms)
          ✔ Should emit "WorkflowStatusChange" event (105ms)
### REGISTRATION
      ✔ Should revert when registration is not open (155ms)
#### Registration is open
        ✔ workflowStatus should be RegisteringVoters
#### Adding new voters
          ✔ Should revert when voter is already registered (91ms)
          ✔ Should be OK when voter is not already registered (153ms)
          ✔ Should emit "VoterRegistered" event (85ms)
### PROPOSAL
      ✔ Should revert when proposal session is not open (123ms)
#### Proposal Registration is open
        ✔ workflowStatus should be ProposalsRegistrationStarted
##### Adding new proposals
          ✔ Should revert when description is empty
          ✔ Proposals array should have the GENESIS proposal
          ✔ Proposals array length should have been increased by 1 (99ms)
          ✔ Should emit "VoterRegistered" event (107ms)
### VOTE
      ✔ Should revert when voting session is not open (76ms)
#### Proposal Registration is open
        ✔ workflowStatus should be VotingSessionStarted
##### Casting votes
          ✔ Should revert when voter has already voted (144ms)
          ✔ Should revert when voting on a proposal that doesn't exist
          ✔ Should set the voters votedProposalId property (155ms)
          ✔ Should set the voters hasVoted property to true (269ms)
          ✔ Should increment the proposal's voting count in the proposals array (270ms)
          ✔ Should emit "Voted" event (156ms)
### TALLY VOTE
      ✔ Should revert when voting session is not ended (133ms)
#### Tallying votes started
        ✔ workflowStatus should be VotingSessionEnded (52ms)
        ✔ winningProposalID should be 0
##### Tallying votes