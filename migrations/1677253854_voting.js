const Voting = artifacts.require('Voting.sol');
const VotingMock = artifacts.require('VotingMock.sol');

module.exports = function(_deployer) {
  _deployer.deploy(Voting);
  _deployer.deploy(VotingMock);
};