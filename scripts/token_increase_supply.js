const VNTripToken = artifacts.require("VNTripToken");

module.exports = function (done) {
  var vNTripToken;
  return VNTripToken.deployed()
    .then((instance) => {
      vNTripToken = instance;
      return vNTripToken.mint(0, 100)
    }).then(res => {
      return vNTripToken.totalSupply.call()
    }).then((totalSupply) => {
      console.log(totalSupply)
      done()
    }).catch(e => {
      console.log(e)
      done()
    })
};
