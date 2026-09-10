# Anti-Tamper Legal & Business Contract Vault

A hybrid decentralized application (dApp) that anchors SHA-256 document fingerprints on Polygon and stores raw files on IPFS — while presenting a completely traditional Web2 interface to end users.

---

## Architecture Overview

```
/SIH (workspace root)
├── .git/
├── .gitignore
├── /blockchain    — Hardhat + Solidity (Polygon)
├── /backend       — Node.js + Express (hashing API)
├── /web3          — ethers.js v6 + Pinata IPFS integration scripts
└── /web2          — React frontend (Vite)
```

**Data Flow:**
1. User uploads PDF → `/backend` computes SHA-256 hash in-memory
2. `/web3` pins raw PDF to IPFS via Pinata → returns IPFS CID
3. `/web3` calls `anchorDocument(hash)` on the deployed Polygon smart contract
4. Transaction receipt + PolygonScan link displayed to user
5. Verification: upload doc → `/backend` hashes → `/web3` calls `verifyDocument(hash)` → green/red alert

---

## Proposed Changes

### `/blockchain` — Hardhat Smart Contract

#### [NEW] `blockchain/contracts/ContractVault.sol`
- Struct `DocumentRecord { string hash; uint256 timestamp; address anchoredBy }`
- Mapping `string => DocumentRecord` keyed by SHA-256 hash
- `anchorDocument(string memory _hash)` — stores record, emits event
- `verifyDocument(string memory _hash)` — returns struct fields
- Guard against re-anchoring the same hash

#### [NEW] `blockchain/scripts/deploy.js`
- Hardhat deploy script targeting Polygon Mumbai / Amoy testnet
- Logs deployed contract address

#### [NEW] `blockchain/hardhat.config.js`
- Network config: `polygonAmoy` (RPC from Alchemy, private key from `.env`)
- Polygon Mumbai fallback

#### [NEW] `blockchain/package.json`, `blockchain/.env.example`

---

### `/backend` — Express Hashing Server

#### [NEW] `backend/server.js`
- Express app on port 4000
- CORS enabled (accepts requests from React frontend)
- `POST /api/hash` — multer memory storage, reads `req.file.buffer`, SHA-256 with `crypto`, returns `{ hash: "<hex>" }`

#### [NEW] `backend/package.json`

---

### `/web3` — Integration Scripts

#### [NEW] `web3/anchorDocument.js`
- ethers.js v6 `JsonRpcProvider` + `Wallet` from `.env`
- Calls `anchorDocument(hash)` on deployed contract
- Returns `{ txHash, blockExplorerUrl }`

#### [NEW] `web3/verifyDocument.js`
- Calls `verifyDocument(hash)` — returns `{ exists, timestamp, anchoredBy }`

#### [NEW] `web3/ipfsUpload.js`
- Pinata SDK to pin a file buffer to IPFS
- Returns `{ ipfsCid, ipfsUrl }`

#### [NEW] `web3/contractABI.js`
- Exports ABI array (kept in sync with Solidity)

#### [NEW] `web3/.env.example`
```
ALCHEMY_API_KEY=
POLYGON_PRIVATE_KEY=
PINATA_API_KEY=
PINATA_SECRET_KEY=
CONTRACT_ADDRESS=
```

---

### `/web2` — React Frontend (Vite)

#### [NEW] `web2/src/App.jsx`
- Two-tab layout: **Upload Portal** / **Verification Dashboard**
- Clean, professional UI — no wallet/gas UI visible

#### [NEW] `web2/src/components/UploadPortal.jsx`
- File input (PDF only) + drag-and-drop
- Progress steps: Hash → IPFS → Anchor
- Success state: shows IPFS link + PolygonScan TX link

#### [NEW] `web2/src/components/VerificationDashboard.jsx`
- Drag-and-drop verification zone
- **Green alert** — verified authentic
- **Red alert** — "Hash Mismatch - Document Tampered"

#### [NEW] `web2/src/services/api.js`
- `hashFile(file)` — POST to `/backend` API
- `anchorDocument(hash, file)` — calls `/web3` scripts via backend proxy
- `verifyDocument(hash)` — calls `/web3` scripts via backend proxy

#### [NEW] `web2/index.html`, `web2/package.json`, `web2/vite.config.js`

---

### Root — Git & Security

#### [NEW] `.gitignore` (root)
- Ignores: `.env`, `node_modules/`, `artifacts/`, `cache/`, `dist/`, `build/`, `.env.local`, coverage reports

---

## Verification Plan

### Automated Tests
- `cd blockchain && npx hardhat compile` — contract compiles without errors
- `cd backend && node server.js` — server starts on port 4000
- `cd web2 && npm run dev` — React app serves on port 5173

### Manual Verification
- Upload a PDF → verify hash returned from `/api/hash`
- Verify IPFS upload returns a valid CID
- Verify PolygonScan link formats correctly
- Upload same file to verification → green alert
- Modify file → red alert appears
