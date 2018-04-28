const VNTripCrowdSale = artifacts.require("VNTripCrowdSale");
const VNTripToken = artifacts.require("VNTripToken");

module.exports = function (done) {
  var vNTripCrowdSale

  var accounts = web3.eth.accounts;
  return VNTripCrowdSale.deployed()
    .then((instance) => {
      vNTripCrowdSale = instance;
      return vNTripCrowdSale.rate()
    }).then((rate) => {
      console.log(`rate is ${rate}`)
      done()
    }).catch(e => {
      console.log(e)
      done()
    })
};
