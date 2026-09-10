/**
 * ipfsUpload.js
 *
 * Pins a document to IPFS via the Pinata SDK.
 * Invoked by the backend server as a child process.
 *
 * Usage: node ipfsUpload.js <sha256-hash> <filename> <base64-file-content>
 * Output: Prints a single JSON line to stdout.
 */

import PinataClient from "@pinata/sdk";
import { Readable } from "stream";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

// ── Configuration ──────────────────────────────────────────────────────────

const PINATA_API_KEY    = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;

// ── Main ───────────────────────────────────────────────────────────────────

async function uploadToIPFS(hash, filename, base64Content) {
  if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
    throw new Error("Missing PINATA_API_KEY or PINATA_SECRET_KEY in .env");
  }

  // Initialise Pinata client
  const pinata = new PinataClient({
    pinataApiKey:    PINATA_API_KEY,
    pinataSecretApiKey: PINATA_SECRET_KEY,
  });

  // Test authentication
  await pinata.testAuthentication();

  // Convert base64 back to a Buffer, then to a Readable stream
  const fileBuffer = Buffer.from(base64Content, "base64");
  const stream = Readable.from(fileBuffer);
  // Pinata requires a `path` property on the stream
  stream.path = filename || "document.pdf";

  // Pin metadata
  const options = {
    pinataMetadata: {
      name: filename || "contract-vault-document",
      keyvalues: {
        sha256Hash: hash,
        uploadedAt: new Date().toISOString(),
        source: "ContractVaultDApp",
      },
    },
    pinataOptions: {
      cidVersion: 1,
    },
  };

  const response = await pinata.pinFileToIPFS(stream, options);
  const ipfsCid  = response.IpfsHash;
  const ipfsUrl  = `https://gateway.pinata.cloud/ipfs/${ipfsCid}`;

  const result = {
    success:  true,
    ipfsCid,
    ipfsUrl,
    pinSize:  response.PinSize,
    timestamp: response.Timestamp,
  };

  console.log(JSON.stringify(result));
  return result;
}

// ── CLI Entry Point ────────────────────────────────────────────────────────

const [,, hashArg, filenameArg, base64Arg] = process.argv;

uploadToIPFS(hashArg, filenameArg, base64Arg).catch((err) => {
  console.error("[IPFS FATAL]", err.message);
  console.log(JSON.stringify({ success: false, ipfsCid: null, error: err.message }));
  process.exit(1);
});
