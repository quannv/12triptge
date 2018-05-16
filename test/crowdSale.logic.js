const ether = require('./helpers/ether')
const { advanceBlock } = require('./helpers/advanceToBlock')
const { increaseTimeTo, duration } = require('./helpers/increaseTime')
const { latestTime } = require('./helpers/latestTime')
const { EVMThrow } = require('./helpers/EVMThrow')
const config = require('./helpers/config.js');

const BigNumber = web3.BigNumber;
const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const TwelveTripCrowdSale = artifacts.require('TwelveTripCrowdSale');
const TwelveTripToken = artifacts.require('TwelveTripToken')


contract('TwelveTripCrowdSale', function (accounts) {
  const investor = accounts[accounts.length - 1]
  const investor1 = accounts[accounts.length - 2]
  const investor2 = accounts[accounts.length - 3]

  const purchaser = accounts[accounts.length - 4]
  const purchaser1 = accounts[accounts.length - 5]
  const purchaser2 = accounts[accounts.length - 6]

  const owner = accounts[0]

  //override rate
  const rate = new BigNumber(480)
  const value = ether(2);

  const expectedTokenAmount = rate.mul(value);

  before(async function () {
    //Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock();
  });

  //TODO: min/max buy
  beforeEach(async function () {
    config.startTime = latestTime() + duration.weeks(1);
    config.endTime = config.startTime + duration.weeks(1);
    config.afterEndTime = config.endTime + duration.seconds(1);
    config.teamTimeBlock = config.endTime + duration.weeks(26);
    config.reserveTimeBlock = config.endTime + duration.weeks(52);

    this.token = await TwelveTripToken.new();
    this.crowdsale = await TwelveTripCrowdSale.new(
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
      this.token.address,
      config.teamTimeBlock,
      config.reserveTimeBlock
    );

    await this.token.transferOwnership(this.crowdsale.address);
  });

  it('should be token owner', async function () {
    const owner = await this.token.owner();
    owner.should.equal(this.crowdsale.address);
  });

  it('token only mint by crowdsale contract', async function () {
    this.token.mint(0, 1000).should.be.rejectedWith(EVMThrow);
  });

  it('time to unlock tokens correct', async function () {
    let time = await this.crowdsale.timeUnlockTeamAdvisorTokens();
    time.should.bignumber.equal(config.teamTimeBlock);

    time = await this.crowdsale.timeUnlockReserveTokens();
    time.should.bignumber.equal(config.reserveTimeBlock);
  });

  it('number of tokens (before finalize) should be correct', async function () {
    let balance = await this.token.balanceOf(config.walletTeam);
    balance.should.be.bignumber.equal(0);

    balance = await this.token.balanceOf(config.walletIncentive);
    balance.should.be.bignumber.equal(0);

    balance = await this.token.balanceOf(config.walletBounties);
    balance.should.be.bignumber.equal(0);

    balance = await this.token.balanceOf(config.walletReserve);
    balance.should.be.bignumber.equal(0);
  });

  describe('finalize', function () {
    beforeEach(async function () {
      await increaseTimeTo(config.startTime);

      await this.crowdsale.buyTokens(investor, {
        value: value,
        from: investor1
      }).should.be.fulfilled;

      await increaseTimeTo(config.afterEndTime);
      await this.crowdsale.finalize();
    });

    it('should be taken owner', async function () {
      const owner = await this.token.owner();
      owner.should.equal(accounts[0]);
    });

    it('number of tokens (after finalize) should be correct', async function () {
      let totalSupply = expectedTokenAmount / 48 * 100;

      let balance = await this.token.balanceOf(config.walletTeam);
      balance.should.be.bignumber.equal(0);

      balance = await this.token.balanceOf(config.walletIncentive);
      balance.should.be.bignumber.equal(totalSupply / 1000 * 20);

      balance = await this.token.balanceOf(config.walletBounties);
      balance.should.be.bignumber.equal(totalSupply / 1000 * 122);

      balance = await this.token.balanceOf(config.walletReserve);
      balance.should.be.bignumber.equal(0);
    });

    it('cannot withdraw before time', async function () {
      await this.crowdsale.unlockTeamAdvisorToken().should.be.rejectedWith(EVMThrow);
      await this.crowdsale.unlockReserveToken().should.be.rejectedWith(EVMThrow);
    });

    it('team can withdraw after lock time', async function () {
      await increaseTimeTo(config.teamTimeBlock + 1);
      await this.crowdsale.unlockTeamAdvisorToken().should.be.fulfilled;

      let totalSupply = expectedTokenAmount / 48 * 100;
      let balance = await this.token.balanceOf(config.walletTeam);
      balance.should.be.bignumber.equal(totalSupply / 1000 * 178);
    });

    it('reserve tokens can withdraw after lock time', async function () {
      await increaseTimeTo(config.reserveTimeBlock + 1);
      await this.crowdsale.unlockReserveToken().should.be.fulfilled;

      let totalSupply = expectedTokenAmount / 48 * 100;
      let balance = await this.token.balanceOf(config.walletReserve);
      balance.should.be.bignumber.equal(totalSupply / 1000 * 200);
    });
  });
});
