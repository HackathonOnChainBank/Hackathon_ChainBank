export const ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "dataId",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "proof",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "fileType",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "fileIndex",
        "type": "uint256"
      }
    ],
    "name": "FileStored",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getAllFiles",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "dataId",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "proof",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "fileType",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          }
        ],
        "internalType": "struct WalrusOnlineBankStorage.FileInfo[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
      }
    ],
    "name": "getFile",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "dataId",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "proof",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "fileType",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          }
        ],
        "internalType": "struct WalrusOnlineBankStorage.FileInfo",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getFileCount",
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
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getLatestFile",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "dataId",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "proof",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "fileType",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          }
        ],
        "internalType": "struct WalrusOnlineBankStorage.FileInfo",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "dataId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "proof",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "fileType",
        "type": "string"
      }
    ],
    "name": "storeFile",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "userFiles",
    "outputs": [
      {
        "internalType": "string",
        "name": "dataId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "proof",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "fileType",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]
