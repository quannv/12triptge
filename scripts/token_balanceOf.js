const VNTripToken = artifacts.require("VNTripToken");

module.exports = function (done) {
  var vNTripToken;
  var accounts = web3.eth.accounts;

  return VNTripToken.deployed()
    .then((instance) => {
      vNTripToken = instance;
      return vNTripToken.balanceOf.call(accounts[0])
    }).then((balance) => {
      console.log(balance)
      done()
    }).catch(e => {
      console.log(e)
      done()
    })
};
