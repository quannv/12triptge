const TwelveTripToken = artifacts.require("TwelveTripToken");
const TwelveCrowdSale = artifacts.require("TwelveTripCrowdSale");
const MultiSigWallet = artifacts.require("./multisig/MultiSigWallet.sol");

module.exports = async function (deployer) {
  var accounts = web3.eth.accounts;

  deployer.deploy(MultiSigWallet, [accounts[0], accounts[1]], 1)
  deployer.deploy(TwelveTripToken)
}
