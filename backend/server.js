/**
 * Contract Vault — Express Backend Server
 *
 * Responsibilities:
 *  1. POST /api/hash   — Receive a PDF, compute SHA-256 in-memory, return hex hash
 *  2. POST /api/anchor — Proxy: pin to IPFS + anchor hash on Polygon via /web3 scripts
 *  3. POST /api/verify — Proxy: hash the document then query Polygon blockchain
 *
 * The private key and all blockchain logic lives in /web3 scripts, invoked here
 * via child_process so secrets never reach the browser.
 */

const express    = require("express");
const cors       = require("cors");
const multer     = require("multer");
const crypto     = require("crypto");
const path       = require("path");
const { execFile } = require("child_process");
require("dotenv").config();

const app  = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(cors({
  origin: [
    "http://localhost:5173",  // Vite dev server
    "http://localhost:3000",  // CRA fallback
    process.env.FRONTEND_URL || "",
  ].filter(Boolean),
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
}));

app.use(express.json());

// Multer — memory storage (no disk writes, purely in-memory processing)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB max
  fileFilter: (_req, file, cb) => {
    const allowed = ["application/pdf", "application/octet-stream"];
    // Also allow generic binary for compatibility
    if (allowed.includes(file.mimetype) || file.originalname.endsWith(".pdf")) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are accepted."));
    }
  },
});

// ── Helper ────────────────────────────────────────────────────────────────────

/**
 * Computes the SHA-256 hash of a Buffer and returns the hex digest.
 * @param {Buffer} buffer
 * @returns {string} 64-character hex string
 */
function sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

// ── Routes ────────────────────────────────────────────────────────────────────

/**
 * GET /api/health
 * Quick health-check for the frontend to confirm the server is up.
 */
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "Contract Vault Backend",
    timestamp: new Date().toISOString(),
  });
});

/**
 * POST /api/hash
 * Body: multipart/form-data with a 'document' file field.
 * Returns: { hash: "<64-char-hex>" }
 *
 * The SHA-256 computation happens entirely in memory — no temp files created.
 */
app.post("/api/hash", upload.single("document"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded. Use field name 'document'." });
    }

    const hash = sha256(req.file.buffer);
    const fileSizeKB = (req.file.size / 1024).toFixed(2);

    console.log(`[HASH] ${req.file.originalname} → ${hash} (${fileSizeKB} KB)`);

    return res.json({
      hash,
      filename: req.file.originalname,
      fileSizeBytes: req.file.size,
      algorithm: "SHA-256",
    });
  } catch (err) {
    console.error("[HASH ERROR]", err);
    return res.status(500).json({ error: "Failed to compute hash.", details: err.message });
  }
});

/**
 * POST /api/anchor
 * Body: multipart/form-data with a 'document' file field.
 * Steps:
 *  1. Compute SHA-256 of the uploaded file
 *  2. Call web3/ipfsUpload.js  → pin to IPFS (returns CID)
 *  3. Call web3/anchorDocument.js → anchor hash on Polygon (returns txHash)
 * Returns: { hash, ipfsCid, ipfsUrl, txHash, explorerUrl }
 */
app.post("/api/anchor", upload.single("document"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    // Step 1: Compute hash
    const hash = sha256(req.file.buffer);
    console.log(`[ANCHOR] Hash computed: ${hash}`);

    // Step 2 & 3: Delegate to web3 scripts via helper
    const web3Dir = path.resolve(__dirname, "../web3");

    // IPFS upload
    let ipfsResult = { ipfsCid: null, ipfsUrl: null };
    try {
      const ipfsRaw = await runScript(web3Dir, "ipfsUpload.js", [
        hash,
        req.file.originalname,
        req.file.buffer.toString("base64"),
      ]);
      ipfsResult = JSON.parse(ipfsRaw);
      console.log(`[ANCHOR] IPFS CID: ${ipfsResult.ipfsCid}`);
    } catch (ipfsErr) {
      console.warn("[ANCHOR] IPFS upload failed (continuing):", ipfsErr.message);
    }

    // Blockchain anchoring
    const anchorRaw = await runScript(web3Dir, "anchorDocument.js", [hash]);
    const anchorResult = JSON.parse(anchorRaw);
    console.log(`[ANCHOR] TX Hash: ${anchorResult.txHash}`);

    return res.json({
      success: true,
      hash,
      filename: req.file.originalname,
      ipfsCid: ipfsResult.ipfsCid,
      ipfsUrl: ipfsResult.ipfsUrl,
      txHash: anchorResult.txHash,
      explorerUrl: anchorResult.explorerUrl,
      blockNumber: anchorResult.blockNumber,
    });
  } catch (err) {
    console.error("[ANCHOR ERROR]", err);
    return res.status(500).json({ error: "Anchoring failed.", details: err.message });
  }
});

/**
 * POST /api/verify
 * Body: multipart/form-data with a 'document' file field.
 * Steps:
 *  1. Compute SHA-256 of the uploaded file
 *  2. Call web3/verifyDocument.js → query Polygon
 * Returns: { hash, exists, timestamp, anchoredBy, verified }
 */
app.post("/api/verify", upload.single("document"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    // Step 1: Compute hash
    const hash = sha256(req.file.buffer);
    console.log(`[VERIFY] Hash computed: ${hash}`);

    // Step 2: Query blockchain
    const web3Dir = path.resolve(__dirname, "../web3");
    const verifyRaw = await runScript(web3Dir, "verifyDocument.js", [hash]);
    const verifyResult = JSON.parse(verifyRaw);

    return res.json({
      hash,
      filename: req.file.originalname,
      exists: verifyResult.exists,
      verified: verifyResult.exists,
      timestamp: verifyResult.timestamp,
      anchoredBy: verifyResult.anchoredBy,
      anchoredDate: verifyResult.timestamp
        ? new Date(Number(verifyResult.timestamp) * 1000).toISOString()
        : null,
    });
  } catch (err) {
    console.error("[VERIFY ERROR]", err);
    return res.status(500).json({ error: "Verification failed.", details: err.message });
  }
});

// ── Utility ───────────────────────────────────────────────────────────────────

/**
 * Runs a Node.js script as a child process and captures its stdout.
 * The script must print a JSON result to stdout on the last line.
 * @param {string} cwd   Working directory (web3 folder)
 * @param {string} script  Script filename
 * @param {string[]} args  Arguments passed to the script
 * @returns {Promise<string>} stdout content
 */
function runScript(cwd, script, args = []) {
  return new Promise((resolve, reject) => {
    execFile(
      "node",
      [path.join(cwd, script), ...args],
      { cwd, timeout: 60000, maxBuffer: 1024 * 1024 },
      (err, stdout, stderr) => {
        if (err) {
          reject(new Error(stderr || err.message));
        } else {
          // Extract last non-empty line (the JSON output)
          const lines = stdout.trim().split("\n").filter(Boolean);
          resolve(lines[lines.length - 1] || "{}");
        }
      }
    );
  });
}

// ── Error Handler ─────────────────────────────────────────────────────────────

app.use((err, _req, res, _next) => {
  console.error("[UNHANDLED ERROR]", err);
  res.status(500).json({ error: err.message || "Internal server error." });
});

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log("─────────────────────────────────────────────────");
  console.log("  Contract Vault Backend Server");
  console.log(`  Listening on http://localhost:${PORT}`);
  console.log("─────────────────────────────────────────────────");
});

module.exports = app;
