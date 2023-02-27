// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;
import "./Voting.sol";


contract VotingMock is Voting {
    constructor() {
        // Initialize voters mapping
        // Add accounts 1 to 5 from Ganache test accounts
        voters[0x8858db2541A6127277494b1B402115567e942d52] = Voter(false, false, 0);
        voters[0xa5e7bcc085F059ba3F6EC2A62Aec0521D9b3015d] = Voter(false, false, 0);
        voters[0x56F4E98e0335f169C5B318197E1ED5d9165D14cc] = Voter(false, false, 0);
        voters[0x5bA9D25e32e165c67c60Fd3C8eDcbFA7f8Cd9130] = Voter(false, false, 0);
        voters[0xBC784BFBD5b43Ad5030a6367dE49CA5B6E312d93] = Voter(false, false, 0);
    }

    function setWorkflowStatus(WorkflowStatus _status) external onlyOwner {
        workflowStatus = _status;
    }

    function getProposalArray() external view onlyOwner returns (Proposal[] memory) {
        return proposalsArray;
    }

    function setSampleProposals() external onlyOwner {
        proposalsArray.push(Proposal("This a first description", 0));
        proposalsArray.push(Proposal("This a second description", 0));
        proposalsArray.push(Proposal("This a third description", 0));
        proposalsArray.push(Proposal("This a fourth description", 0));
        proposalsArray.push(Proposal("This a fifth description", 0));
    }

    function setSampleProposalsForTallyingVotes() external onlyOwner {
        delete proposalsArray;
        proposalsArray.push(Proposal("GENESIS", 0));
        proposalsArray.push(Proposal("This a first description", 1));
        proposalsArray.push(Proposal("This a second description", 4));
        proposalsArray.push(Proposal("This a third description", 3));
        proposalsArray.push(Proposal("This a fourth description", 7));
        proposalsArray.push(Proposal("This a fifth description", 0));
    }
}