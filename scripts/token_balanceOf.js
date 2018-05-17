const TwelveTripToken = artifacts.require("TwelveTripToken");

module.exports = function (done) {
  var twelveTripToken;
  var accounts = web3.eth.accounts;

  return TwelveTripToken.deployed()
    .then((instance) => {
      twelveTripToken = instance;
      return twelveTripToken.balanceOf.call(accounts[0])
    }).then((balance) => {
      console.log(balance)
      done()
    }).catch(e => {
      console.log(e)
      done()
    })
};
