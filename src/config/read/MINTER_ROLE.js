import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();
import { ABI } from "../NTD_TOKEN_ABI.js";
const provider = new ethers.JsonRpcProvider(process.env.VITE_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contractAddress = process.env.VITE_NTD_TOKEN_CONTRACT_ADDRESS;
const contract = new ethers.Contract(contractAddress, ABI, wallet);

export async function MINTER_ROLE() {
  try {
    return await contract.MINTER_ROLE();
  } catch (err) {
    console.error("讀取 MINTER_ROLE 失敗:", err.message);
  }
}

async function main() {
  const result = await MINTER_ROLE();
  console.log("MINTER_ROLE(bytes32):", result);
}
main();
