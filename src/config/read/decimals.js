import { ethers } from "ethers";
import dotenv from "dotenv";
import { ABI } from "../NTD_TOKEN_ABI.js";

dotenv.config();
const provider = new ethers.JsonRpcProvider(process.env.VITE_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.VITE_NTD_TOKEN_CONTRACT_ADDRESS, ABI, wallet);

export async function decimals() {
  try {
    return await contract.decimals();
  } catch (err) {
    console.error("讀取小數位失敗:", err.message);
  }
}

async function main() {
  console.log("Token 小數位:", await decimals());
}
main();
