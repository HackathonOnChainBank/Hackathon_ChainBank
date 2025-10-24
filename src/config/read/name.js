import { ethers } from "ethers";
import dotenv from "dotenv";
import { ABI } from "../NTD_TOKEN_ABI.js";

dotenv.config();
const provider = new ethers.JsonRpcProvider(process.env.VITE_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contractAddress = process.env.VITE_NTD_TOKEN_CONTRACT_ADDRESS;
const contract = new ethers.Contract(contractAddress, ABI, wallet);

export async function name() {
  try {
    return await contract.name();
  } catch (err) {
    console.error("讀取名稱失敗:", err.message);
  }
}

async function main() {
  const result = await name();
  console.log("Token 名稱:", result);
}
main();
