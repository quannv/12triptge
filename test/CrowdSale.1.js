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

const VNTripCrowdSale = artifacts.require('VNTripCrowdSale');
const VNTripToken = artifacts.require('VNTripToken')



contract('VNTripCrowdSale', function (accounts) {
  const investor = accounts[accounts.length - 1]
  const investor1 = accounts[accounts.length - 2]

  const purchaser = accounts[accounts.length - 3]
  const purchaser1 = accounts[accounts.length - 4]

  const owner = accounts[0]

  const rate = new BigNumber(config.rate)
  const value = ether(2);

  const expectedTokenAmount = rate.mul(value);

  before(async function () {
    //Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock();
  });

  beforeEach(async function () {
    config.startTime = latestTime() + duration.weeks(1);
    config.endTime = config.startTime + duration.weeks(1);
    config.afterEndTime = config.endTime + duration.seconds(1);

    this.token = await VNTripToken.new();
    this.crowdsale = await VNTripCrowdSale.new(
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

  it('should be ended only after end', async function () {
    let ended = await this.crowdsale.hasClosed();
    ended.should.equal(false);
    await increaseTimeTo(config.afterEndTime);
    ended = await this.crowdsale.hasClosed();
    ended.should.equal(true);
  });

  describe('accepting payments', function () {
    it('should reject payments before start', async function () {
      await this.crowdsale.sendTransaction({
        from: investor,
        value: value
      }).should.be.rejectedWith(EVMThrow);
      await this.crowdsale.buyTokens(investor, {
        from: purchaser,
        value: value
      }).should.be.rejectedWith(EVMThrow);
    });

    it('should accept payments after start', async function () {
      await increaseTimeTo(config.startTime);
      await this.crowdsale.sendTransaction({
        from: investor,
        value: value
      }).should.be.fulfilled;
      await this.crowdsale.buyTokens(investor, {
        value: value,
        from: purchaser
      }).should.be.fulfilled;
    });

    it('should reject payments after end', async function () {
      await increaseTimeTo(config.afterEndTime);
      await this.crowdsale.sendTransaction({
        from: investor,
        value: value
      }).should.be.rejectedWith(EVMThrow);
      await this.crowdsale.buyTokens(investor, {
        value: value,
        from: purchaser
      }).should.be.rejectedWith(EVMThrow);
    });
  });

  describe('high-level purchase', function () {
    beforeEach(async function () {
      await increaseTimeTo(config.startTime)
    });

    it('should log purchase', async function () {
      const {
        logs
      } = await this.crowdsale.sendTransaction({
        value: value,
        from: investor
      });

      const event = logs.find(e => e.event === 'TokenPurchase');

      should.exist(event);
      event.args.purchaser.should.equal(investor);
      event.args.beneficiary.should.equal(investor);
      event.args.value.should.be.bignumber.equal(value);
      event.args.amount.should.be.bignumber.equal(expectedTokenAmount);
    });

    it('should increase totalSupply', async function () {
      await this.crowdsale.sendTransaction({
        value: value,
        from: investor
      });
      const totalSupply = await this.token.totalSupply();
      totalSupply.should.be.bignumber.equal(expectedTokenAmount);
    });

    it('should assign tokens to sender', async function () {
      await this.crowdsale.sendTransaction({
        value: value,
        from: investor
      });
      let balance = await this.token.balanceOf(investor);
      balance.should.be.bignumber.equal(expectedTokenAmount);
    })

    it('should forward funds to wallet', async function () {
      const pre = web3.eth.getBalance(config.wallet);
      await this.crowdsale.sendTransaction({
        value,
        from: investor
      });
      const post = web3.eth.getBalance(config.wallet);
      post.minus(pre).should.be.bignumber.equal(value);
    });

    //TODO
    it('do not permit buy number of tokens out of range', async function () {
    });
  });

  describe('low-level purchase', function () {
    beforeEach(async function () {
      await increaseTimeTo(config.startTime);
    });

    it('should log purchase', async function () {
      const {
        logs
      } = await this.crowdsale.buyTokens(investor, {
        value: value,
        from: purchaser1
      });

      const event = logs.find(e => e.event === 'TokenPurchase');

      should.exist(event);
      event.args.purchaser.should.equal(purchaser1);
      event.args.beneficiary.should.equal(investor);
      event.args.value.should.be.bignumber.equal(value);
      event.args.amount.should.be.bignumber.equal(expectedTokenAmount);
    });

    it('should increase totalSupply', async function () {
      await this.crowdsale.buyTokens(investor, {
        value,
        from: purchaser
      });

      const totalSupply = await this.token.totalSupply();
      totalSupply.should.be.bignumber.equal(expectedTokenAmount);
    });

    it('should assign tokens to beneficiary', async function () {
      await this.crowdsale.buyTokens(investor, {
        value,
        from: purchaser
      });
      const balance = await this.token.balanceOf(investor);
      balance.should.be.bignumber.equal(expectedTokenAmount);
    });

    it('should forward funds to wallet', async function () {
      const pre = web3.eth.getBalance(config.wallet);
      await this.crowdsale.buyTokens(investor, {
        value,
        from: investor1
      });
      const post = web3.eth.getBalance(config.wallet);
      post.minus(pre).should.be.bignumber.equal(value);
    });
    //TODO
    it('do not permit buy number of tokens out of range', async function () {
    });
  });
  //TODO
  //finalize
  //cannot finalize

  //TODO
  describe('finalize crowd sale', function () {
    it('should mint tokens', async function () {
      //mint tokens
      //send tokens to owner
      //return owner
      //should not mint
    })
  });
});
