require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },

  networks: {
    // ── Local Development ──────────────────────────────────────────
    localhost: {
      url: "http://127.0.0.1:8545",
    },

    // ── Polygon Amoy Testnet (replaces deprecated Mumbai) ──────────
    polygonAmoy: {
      url: `https://polygon-amoy.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: process.env.POLYGON_PRIVATE_KEY
        ? [process.env.POLYGON_PRIVATE_KEY]
        : [],
      chainId: 80002,
      gasPrice: "auto",
    },

    // ── Polygon Mainnet (production) ───────────────────────────────
    polygon: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: process.env.POLYGON_PRIVATE_KEY
        ? [process.env.POLYGON_PRIVATE_KEY]
        : [],
      chainId: 137,
    },
  },

  // ── Etherscan / Polygonscan Verification ─────────────────────────
  etherscan: {
    apiKey: {
      polygon: process.env.POLYGONSCAN_API_KEY || "",
      polygonAmoy: process.env.POLYGONSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "polygonAmoy",
        chainId: 80002,
        urls: {
          apiURL: "https://api-amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com",
        },
      },
    ],
  },

  // ── Gas Reporter ─────────────────────────────────────────────────
  gasReporter: {
    enabled: true,
    currency: "USD",
    token: "MATIC",
  },
};
