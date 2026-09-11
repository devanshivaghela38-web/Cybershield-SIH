export const CONTRACT_ABI = 
[
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "DocumentAlreadyRevoked",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "DocumentNotFound",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "docHash",
        "type": "string"
      }
    ],
    "name": "HashAlreadyAnchored",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidHash",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "UnauthorizedRevocation",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "string",
        "name": "docHash",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "anchoredBy",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "parentHash",
        "type": "string"
      }
    ],
    "name": "DocumentAnchored",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "string",
        "name": "docHash",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "revokedBy",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "reason",
        "type": "string"
      }
    ],
    "name": "DocumentRevoked",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_docHash",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_ipfsHash",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_parentHash",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_validUntil",
        "type": "uint256"
      }
    ],
    "name": "anchorDocument",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_docHash",
        "type": "string"
      }
    ],
    "name": "getDocumentHistory",
    "outputs": [
      {
        "internalType": "bool",
        "name": "_isRevoked",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "_validUntil",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_revocationReason",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_parentHash",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_docHash",
        "type": "string"
      }
    ],
    "name": "getRecord",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "docHash",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "ipfsHash",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "anchoredBy",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "parentHash",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "validUntil",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "isRevoked",
            "type": "bool"
          },
          {
            "internalType": "string",
            "name": "revocationReason",
            "type": "string"
          },
          {
            "internalType": "bool",
            "name": "exists",
            "type": "bool"
          }
        ],
        "internalType": "struct ContractVault.DocumentRecord",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_docHash",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_reason",
        "type": "string"
      }
    ],
    "name": "revokeDocument",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalAnchored",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_docHash",
        "type": "string"
      }
    ],
    "name": "verifyDocument",
    "outputs": [
      {
        "internalType": "bool",
        "name": "_exists",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "_timestamp",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "_anchoredBy",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]
;
