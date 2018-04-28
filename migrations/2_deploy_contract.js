const VNTripToken = artifacts.require("VNTripToken");
const VNTripCrowdSale = artifacts.require("VNTripCrowdSale");
const MultiSigWallet = artifacts.require("./multisig/MultiSigWallet.sol");

module.exports = async function (deployer) {
  var accounts = web3.eth.accounts;
  // in web front-end, use an onload listener and similar to this manual flow ... 

  deployer.deploy(MultiSigWallet, [accounts[0], accounts[1]], 1)
  deployer.deploy(VNTripToken)
}
