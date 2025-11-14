require("@nomicfoundation/hardhat-toolbox");
require("hardhat-contract-sizer");
require("@nomicfoundation/hardhat-verify");
require("@nomiclabs/hardhat-solhint");


const fs = require('fs');

function getPrivateKey() {
  try {
    return fs.readFileSync(".secret", "utf8").trim();
  } catch (err) {
    console.error("Private key file not found or unreadable!");
    process.exit(1);
  }
}

require('dotenv').config({ path: '.env'});
const { INFURA, ETHSKAN } = process.env;

module.exports = {
  solidity: {
    version: "0.6.2",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      // viaIR: true
    }
  },
  networks: {
    mainnet: {
      url: `https://mainnet.infura.io/v3/${INFURA}`,
      accounts: [getPrivateKey()],
      chainId: 1
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA}`,
      accounts: [getPrivateKey()],
      chainId: 11155111
    }
  }, 
  etherscan: {
    apiKey: ETHSKAN,
  },
};