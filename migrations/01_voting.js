const Voting = artifacts.require('Voting.sol');

module.exports = function(_deployer) {
  _deployer.deploy(Voting);
};