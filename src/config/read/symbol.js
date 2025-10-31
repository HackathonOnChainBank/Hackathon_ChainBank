import { ethers } from "ethers";
import dotenv from "dotenv";
import { ABI } from "../NTD_TOKEN_ABI.js";

dotenv.config();
const provider = new ethers.JsonRpcProvider(process.env.VITE_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.VITE_NTD_TOKEN_CONTRACT_ADDRESS, ABI, wallet);

export async function symbol() {
  try {
    return await contract.symbol();
  } catch (err) {
    console.error("讀取符號失敗:", err.message);
  }
}

async function main() {
  const result = await symbol();
  console.log("Token 符號:", result);
}
main();
