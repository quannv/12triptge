const TwelveTripToken = artifacts.require("TwelveTripToken");
const TwelveCrowdSale = artifacts.require("TwelveTripCrowdSale");
const MultiSigWallet = artifacts.require("./multisig/MultiSigWallet.sol");
const BigNumber = web3.BigNumber;

module.exports = function (deployer) {
  var accounts = web3.eth.accounts;

  const MIN = 60;
  const HOUR = 60 * MIN;
  const DAY = 24 * HOUR;

  var config = {}
  //crowd sale start/end date
  config.startTime = web3.eth.getBlock(web3.eth.blockNumber).timestamp + 5;
  config.endTime = config.startTime + DAY * 200;

  //owner of multisign fund wallet
  config.owner1 = accounts[0];
  config.owner2 = accounts[1];

  config.wallet = accounts[6];
  //account so we distribute later
  config.walletTeam = accounts[2];
  config.walletIncentive = accounts[3];
  config.walletBounties = accounts[4];
  config.walletReserve = accounts[5];

  //token holder that is a Time lock contract 
  config.teamHolder = accounts[2];
  config.incentiveHolder = accounts[3];
  config.bountiesHolder = accounts[4];
  config.reserveHolder = accounts[5];
  //time lock
  config.teamTimeBlock = 6 * 30 * 86400 * 1000;//6 months
  config.reserveTimeBlock = 365 * 86400 * 1000;//12 months
  config.incentiveTimeLock = config.endTime;  //after ICO
  config.bountiesTimeLock = config.endTime;  //after ICO

  //min/max buy
  config.minBuy = 1;
  config.maxBuy = 12000000 * 10 ** 18;

  //address of token
  var tokenAddress = 0;

  //exchange rate
  //TODO: need source
  config.rate = 480;

  var twelveTripToken;
  deployer
    .then(function () {
      return TwelveTripToken.deployed()
    })
    .then((instance) => {
      twelveTripToken = instance;
      return deployer.deploy(TwelveCrowdSale,
        config.startTime,
        config.endTime,
        config.wallet,
        config.walletTeam,
        config.walletIncentive,
        config.walletBounties,
        config.walletReserve,
        config.minBuy,
        config.maxBuy,
        config.rate,
        twelveTripToken.address,
        config.teamTimeBlock,
        config.reserveTimeBlock)
    }).then((res) => {
      console.log("deploy success")
    })
    .catch(e => console.log(e))
}