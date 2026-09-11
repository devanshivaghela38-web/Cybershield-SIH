/**
 * revokeDocument.js
 *
 * Calls the ContractVault.revokeDocument() function on Polygon using ethers.js v6.
 * Invoked by the backend server as a child process.
 *
 * Usage (via backend): node revokeDocument.js <sha256-hash> "<reason>"
 * Output: Prints a single JSON line to stdout.
 */

import { ethers } from "ethers";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import { CONTRACT_ABI } from "./contractABI.js";

// Load .env from the web3 directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

// ── Configuration ──────────────────────────────────────────────────────────

const ALCHEMY_API_KEY   = process.env.ALCHEMY_API_KEY;
const PRIVATE_KEY       = process.env.POLYGON_PRIVATE_KEY;
const CONTRACT_ADDRESS  = process.env.CONTRACT_ADDRESS;
const NETWORK           = process.env.NETWORK || "polygonAmoy";

// Network → RPC URL and explorer base
const NETWORK_CONFIG = {
  polygonAmoy: {
    rpcUrl:      `https://polygon-amoy.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    explorerBase: "https://amoy.polygonscan.com",
    chainId:     80002,
  },
  polygon: {
    rpcUrl:      `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    explorerBase: "https://polygonscan.com",
    chainId:     137,
  },
};

// ── Main ───────────────────────────────────────────────────────────────────

async function revokeDocument(hash, reason) {
  if (!ALCHEMY_API_KEY) throw new Error("Missing ALCHEMY_API_KEY in .env");
  if (!PRIVATE_KEY)     throw new Error("Missing POLYGON_PRIVATE_KEY in .env");
  if (!CONTRACT_ADDRESS) throw new Error("Missing CONTRACT_ADDRESS in .env");
  if (!hash)            throw new Error("No hash argument provided.");

  const config = NETWORK_CONFIG[NETWORK];
  if (!config) throw new Error(`Unknown network: ${NETWORK}`);

  const _reason = reason || "Revoked by admin";

  // Create provider and signer
  const provider = new ethers.JsonRpcProvider(config.rpcUrl);
  const wallet   = new ethers.Wallet(PRIVATE_KEY, provider);

  // Connect to the deployed contract
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

  // Estimate gas
  const gasEstimate = await contract.revokeDocument.estimateGas(hash, _reason);
  console.error(`[REVOKE] Gas estimate: ${gasEstimate.toString()}`);

  // Send the transaction
  const tx = await contract.revokeDocument(hash, _reason, {
    gasLimit: gasEstimate * 120n / 100n, // 20% buffer
  });

  console.error(`[REVOKE] Transaction submitted: ${tx.hash}`);

  // Wait for 2 confirmations
  const receipt = await tx.wait(2);

  const result = {
    success:     true,
    txHash:      receipt.hash,
    blockNumber: receipt.blockNumber,
    gasUsed:     receipt.gasUsed.toString(),
    explorerUrl: `${config.explorerBase}/tx/${receipt.hash}`,
    network:     NETWORK,
  };

  // Output JSON to stdout (captured by backend)
  console.log(JSON.stringify(result));
  return result;
}

// ── CLI Entry Point ────────────────────────────────────────────────────────

const [,, hashArg, reasonArg] = process.argv;

revokeDocument(hashArg, reasonArg).catch((err) => {
  console.error("[REVOKE FATAL]", err.message);
  console.log(JSON.stringify({ success: false, error: err.message }));
  process.exit(1);
});
