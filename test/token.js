const TwelveTripToken = artifacts.require('TwelveTripToken');
const utils = require('./helpers/Utils');

contract('TwelveTripToken', (accounts) => {
  let token;
  let owner = accounts[0];

  beforeEach(async () => {
    token = await TwelveTripToken.new();
  });

  describe('construction', async () => {
    it('should be ownable', async () => {
      assert.equal(await token.owner(), owner);
    });

    it('should return correct name after construction', async () => {
      assert.equal(await token.name(), "12TRIP");
    });

    it('should return correct symbol after construction', async () => {
      assert.equal(await token.symbol(), 'TTR');
    });

    it('should return correct decimal points after construction', async () => {
      assert.equal(await token.decimals(), 18);
    });

    it('should check total supply', async () => {
      let token = await TwelveTripToken.new();
      await token.mint(accounts[0], 1000);
      let totalSupply = await token.totalSupply.call();
      assert.equal(totalSupply, 1000);
    });
  });
});