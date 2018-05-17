const TwelveTripCrowdSale = artifacts.require("TwelveTripCrowdSale");
const TwelveTripToken = artifacts.require("TwelveTripToken");

module.exports = function (done) {
  var twelveTripCrowdSale

  var accounts = web3.eth.accounts;
  return TwelveTripCrowdSale.deployed()
    .then((instance) => {
      twelveTripCrowdSale = instance;
      return twelveTripCrowdSale.buyTokens(accounts[0], { from: accounts[0], value: 100000000 })
    }).then(res => {
      return TwelveTripToken.deployed()
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
