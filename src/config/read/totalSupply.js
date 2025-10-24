import { ethers } from "ethers";
import dotenv from "dotenv";
import { ABI } from "../NTD_TOKEN_ABI.js";

dotenv.config();
const provider = new ethers.JsonRpcProvider(process.env.VITE_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.VITE_NTD_TOKEN_CONTRACT_ADDRESS, ABI, wallet);

export async function totalSupply() {
  try {
    const total = await contract.totalSupply();
    return ethers.formatUnits(total, 18);
  } catch (err) {
    console.error("讀取總供應失敗:", err.message);
  }
}

async function main() {
  const total = await totalSupply();
  console.log("Token 總供應量:", total);
}
main();
