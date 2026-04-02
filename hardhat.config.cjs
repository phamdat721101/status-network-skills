require('dotenv').config();
require('@nomicfoundation/hardhat-toolbox');

module.exports = {
  solidity: '0.8.26',
  networks: {
    statusTestnet: {
      url: 'https://rpc.testnet.status.network',
      chainId: 49986,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  paths: {
    sources: './src/contracts',
  },
};
