/**
 * ContractVault ABI
 *
 * This file exports the ABI for the ContractVault smart contract.
 * Keep this in sync with /blockchain/contracts/ContractVault.sol.
 *
 * Auto-generated from the Solidity source. Update after recompilation.
 */

export const CONTRACT_ABI = [
  // ── Events ──────────────────────────────────────────────────────────
  {
    type: "event",
    name: "DocumentAnchored",
    inputs: [
      { name: "hash",       type: "string",  indexed: true  },
      { name: "anchoredBy", type: "address", indexed: true  },
      { name: "timestamp",  type: "uint256", indexed: false },
    ],
    anonymous: false,
  },

  // ── Write Functions ──────────────────────────────────────────────────
  {
    type: "function",
    name: "anchorDocument",
    stateMutability: "nonpayable",
    inputs:  [{ name: "_hash", type: "string" }],
    outputs: [],
  },

  // ── Read Functions ───────────────────────────────────────────────────
  {
    type: "function",
    name: "verifyDocument",
    stateMutability: "view",
    inputs:  [{ name: "_hash", type: "string" }],
    outputs: [
      { name: "_exists",     type: "bool"    },
      { name: "_timestamp",  type: "uint256" },
      { name: "_anchoredBy", type: "address" },
    ],
  },
  {
    type: "function",
    name: "getRecord",
    stateMutability: "view",
    inputs:  [{ name: "_hash", type: "string" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "hash",       type: "string"  },
          { name: "timestamp",  type: "uint256" },
          { name: "anchoredBy", type: "address" },
          { name: "exists",     type: "bool"    },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "totalAnchored",
    stateMutability: "view",
    inputs:  [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "owner",
    stateMutability: "view",
    inputs:  [],
    outputs: [{ name: "", type: "address" }],
  },

  // ── Constructor ──────────────────────────────────────────────────────
  {
    type: "constructor",
    inputs: [],
    stateMutability: "nonpayable",
  },
];

export default CONTRACT_ABI;
