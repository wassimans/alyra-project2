/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */

const {BN, expectRevert, expectEvent} = require('@openzeppelin/test-helpers');
const {expect} = require('chai');
const Voting = artifacts.require("Voting");

contract("Voting", function (accounts) {

});
