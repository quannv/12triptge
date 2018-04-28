const VNTripCrowdSale = artifacts.require("VNTripCrowdSale");
const VNTripToken = artifacts.require("VNTripToken");

module.exports = function (done) {
  var vNTripCrowdSale

  var accounts = web3.eth.accounts;
  return VNTripCrowdSale.deployed()
    .then((instance) => {
      vNTripCrowdSale = instance;
      return vNTripCrowdSale.sendTransaction({ from: accounts[0], value: 100000000 })
    }).then(res => {
      return VNTripToken.deployed()
    }).then((ins) => {
      return ins.balanceOf(accounts[0]);
    }).then((balance) => {
      console.log(`balance of ${accounts[0]} is ${balance}`)
      done()
    }).catch(e => {
      console.log(e)
      done()
    })
};
