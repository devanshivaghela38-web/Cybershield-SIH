/**
 * verifyDocument.js
 *
 * Calls the ContractVault.verifyDocument() view function on Polygon using ethers.js v6.
 * Invoked by the backend server as a child process.
 *
 * Usage (via backend): node verifyDocument.js <sha256-hash>
 * Output: Prints a single JSON line to stdout.
 */

import { ethers } from "ethers";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import { CONTRACT_ABI } from "./contractABI.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

// ── Configuration ──────────────────────────────────────────────────────────

const ALCHEMY_API_KEY  = process.env.ALCHEMY_API_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const NETWORK          = process.env.NETWORK || "polygonAmoy";

const NETWORK_CONFIG = {
  polygonAmoy: {
    rpcUrl:       `https://polygon-amoy.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    explorerBase: "https://amoy.polygonscan.com",
  },
  polygon: {
    rpcUrl:       `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    explorerBase: "https://polygonscan.com",
  },
};

// ── Main ───────────────────────────────────────────────────────────────────

async function verifyDocument(hash) {
  if (!ALCHEMY_API_KEY)  throw new Error("Missing ALCHEMY_API_KEY in .env");
  if (!CONTRACT_ADDRESS) throw new Error("Missing CONTRACT_ADDRESS in .env");
  if (!hash)             throw new Error("No hash argument provided.");

  const config = NETWORK_CONFIG[NETWORK];
  if (!config) throw new Error(`Unknown network: ${NETWORK}`);

  // Read-only provider — no private key needed for view functions
  const provider = new ethers.JsonRpcProvider(config.rpcUrl);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

  // Call verifyDocument (view function — no gas, no transaction)
  const [exists, timestamp, anchoredBy] = await contract.verifyDocument(hash);

  const result = {
    success:     true,
    hash,
    exists,
    timestamp:   exists ? timestamp.toString() : null,
    anchoredBy:  exists ? anchoredBy : null,
    anchoredDate: exists
      ? new Date(Number(timestamp) * 1000).toISOString()
      : null,
    explorerUrl: exists
      ? `${config.explorerBase}/address/${CONTRACT_ADDRESS}`
      : null,
    network:     NETWORK,
  };

  console.log(JSON.stringify(result));
  return result;
}

// ── CLI Entry Point ────────────────────────────────────────────────────────

const [,, hashArg] = process.argv;

verifyDocument(hashArg).catch((err) => {
  console.error("[VERIFY FATAL]", err.message);
  console.log(JSON.stringify({ success: false, exists: false, error: err.message }));
  process.exit(1);
});
