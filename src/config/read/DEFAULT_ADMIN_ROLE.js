import { ethers } from "ethers";
import readline from "readline";
import dotenv from "dotenv";
import { ABI } from "../NTD_TOKEN_ABI.js";
dotenv.config();
const provider = new ethers.JsonRpcProvider(process.env.VITE_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contractAddress = process.env.VITE_NTD_TOKEN_CONTRACT_ADDRESS;
const contract = new ethers.Contract(contractAddress, ABI, wallet);
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(q) { return new Promise(r => rl.question(q, r)); }

export async function DEFAULT_ADMIN_ROLE() {
  try {
    return await contract.DEFAULT_ADMIN_ROLE();
  } catch (err) {
    console.error("讀取 DEFAULT_ADMIN_ROLE 失敗:", err.message);
  }
}

async function main() {
  const result = await DEFAULT_ADMIN_ROLE();
  console.log("DEFAULT_ADMIN_ROLE(bytes32):", result);
  rl.close();
}
main();
