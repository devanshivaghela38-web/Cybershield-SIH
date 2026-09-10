const hre = require("hardhat");

/**
 * Deployment script for ContractVault on Polygon Amoy testnet.
 *
 * Usage:
 *   npx hardhat run scripts/deploy.js --network polygonAmoy
 *   npx hardhat run scripts/deploy.js --network localhost
 */
async function main() {
  console.log("─────────────────────────────────────────────────");
  console.log("  ContractVault — Deployment Script");
  console.log("─────────────────────────────────────────────────\n");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log(`📡 Network      : ${hre.network.name}`);
  console.log(`🔑 Deployer     : ${deployer.address}`);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`💰 Balance      : ${hre.ethers.formatEther(balance)} MATIC\n`);

  // Deploy the contract
  console.log("⏳ Deploying ContractVault...");
  const ContractVault = await hre.ethers.getContractFactory("ContractVault");
  const vault = await ContractVault.deploy();
  await vault.waitForDeployment();

  const address = await vault.getAddress();
  const deployTx = vault.deploymentTransaction();

  console.log("\n✅ ContractVault deployed successfully!");
  console.log("─────────────────────────────────────────────────");
  console.log(`📋 Contract Address : ${address}`);
  console.log(`📦 Tx Hash          : ${deployTx?.hash}`);

  // Build explorer URL based on network
  let explorerBase = "";
  if (hre.network.name === "polygonAmoy") {
    explorerBase = "https://amoy.polygonscan.com";
  } else if (hre.network.name === "polygon") {
    explorerBase = "https://polygonscan.com";
  }

  if (explorerBase) {
    console.log(`🔍 Explorer         : ${explorerBase}/address/${address}`);
    console.log(`🔍 Deploy TX        : ${explorerBase}/tx/${deployTx?.hash}`);
  }

  console.log("\n─────────────────────────────────────────────────");
  console.log("📝 NEXT STEP: Copy the contract address above and");
  console.log("   add it to /web3/.env as CONTRACT_ADDRESS=<address>");
  console.log("─────────────────────────────────────────────────\n");

  // Verify contract on Polygonscan (if not local)
  if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
    console.log("⏳ Waiting 10 seconds before Polygonscan verification...");
    await new Promise((r) => setTimeout(r, 10000));

    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: [],
      });
      console.log("✅ Contract verified on Polygonscan!");
    } catch (err) {
      console.warn("⚠️  Verification failed (may already be verified):", err.message);
    }
  }
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
