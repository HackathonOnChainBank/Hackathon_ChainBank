// Minimal ABI for DisasterReliefFund contract
// TODO: Replace with your actual deployed contract ABI

const disasterAbi = [
  {
    "inputs": [
      { "internalType": "string", "name": "proof", "type": "string" },
      { "internalType": "address", "name": "recipient", "type": "address" }
    ],
    "name": "claimWithProof",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "setBountyAmount",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "configId", "type": "bytes32" }
    ],
    "name": "setVerificationConfigId",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "withdrawToken",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
]

export default disasterAbi
