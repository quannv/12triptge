const TwelveTripCrowdSale = artifacts.require("TwelveTripCrowdSale");
const TwelveTripToken = artifacts.require("TwelveTripToken");

module.exports = function (done) {
  var twelveTripCrowdSale

  var accounts = web3.eth.accounts;
  return TwelveTripCrowdSale.deployed()
    .then((instance) => {
      twelveTripCrowdSale = instance;
      return twelveTripCrowdSale.rate()
    }).then((rate) => {
      console.log(`rate is ${rate}`)
      done()
    }).catch(e => {
      console.log(e)
      done()
    })
};
