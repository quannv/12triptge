var HDWalletProvider = require('truffle-hdwallet-provider');
var mnemonic = "act output engage farm obscure name rubber fuel under voice glove mandate";

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*"
    },
    tomo: {
      provider: function () {
        return new HDWalletProvider(mnemonic, 'https://core.tomocoin.io');
      },
      gas: 2900000,
      gasPrice: 120000000,
      network_id: 40686
    },
    rinkeby: {
      provider: function () {
        return new HDWalletProvider(mnemonic, 'https://www.rinkeby.io');
      },
      gas: 2900000,
      network_id: 4
    }
  }
};
