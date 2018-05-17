const TwelveTripToken = artifacts.require("TwelveTripToken");

module.exports = function (done) {
  var twelveTripToken;
  return TwelveTripToken.deployed()
    .then((instance) => {
      twelveTripToken = instance;
      return twelveTripToken.mint(0, 100)
    }).then(res => {
      return twelveTripToken.totalSupply.call()
    }).then((totalSupply) => {
      console.log(totalSupply)
      done()
    }).catch(e => {
      console.log(e)
      done()
    })
};
