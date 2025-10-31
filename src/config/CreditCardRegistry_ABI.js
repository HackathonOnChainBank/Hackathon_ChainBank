export const ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_ntdToken",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_admin",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
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
        "name": "userId",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "creditLimit",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "cardStyle",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "CardApplied",
    "type": "event"
  },
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
        "internalType": "uint256",
        "name": "applicationIndex",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "CardApproved",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "admin",
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
        "name": "userId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "cardStyle",
        "type": "string"
      }
    ],
    "name": "applyForCard",
    "outputs": [],
    "stateMutability": "nonpayable",
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
        "name": "applicationIndex",
        "type": "uint256"
      }
    ],
    "name": "approveCard",
    "outputs": [],
    "stateMutability": "nonpayable",
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
    "name": "calculateCreditLimit",
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
    "name": "getApplicationCount",
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
    "name": "getLatestApplication",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "userId",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "creditLimit",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "cardStyle",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "applicationTime",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "approved",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "approvedTime",
            "type": "uint256"
          }
        ],
        "internalType": "struct CreditCardRegistry.CardApplication",
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
    "name": "getUserApplications",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "userId",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "creditLimit",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "cardStyle",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "applicationTime",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "approved",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "approvedTime",
            "type": "uint256"
          }
        ],
        "internalType": "struct CreditCardRegistry.CardApplication[]",
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
        "name": "",
        "type": "address"
      }
    ],
    "name": "hasApprovedCard",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "ntdToken",
    "outputs": [
      {
        "internalType": "contract NTD_TOKEN",
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
        "internalType": "address",
        "name": "newAdmin",
        "type": "address"
      }
    ],
    "name": "updateAdmin",
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
    "name": "userApplications",
    "outputs": [
      {
        "internalType": "string",
        "name": "userId",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "creditLimit",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "cardStyle",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "applicationTime",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "approved",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "approvedTime",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]
