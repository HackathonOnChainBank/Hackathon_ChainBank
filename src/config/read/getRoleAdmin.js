import { ethers } from "ethers";
import readline from "readline";
import dotenv from "dotenv";
dotenv.config();
import { ABI } from "../NTD_TOKEN_ABI.js";
const provider = new ethers.JsonRpcProvider(process.env.VITE_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contractAddress = process.env.VITE_NTD_TOKEN_CONTRACT_ADDRESS;
const contract = new ethers.Contract(contractAddress, ABI, wallet);
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
function ask(q) { return new Promise(r => rl.question(q, r)); }

export async function getRoleAdmin(role) {
  try {
    return await contract.getRoleAdmin(role);
  } catch (err) {
    console.error("讀取 getRoleAdmin 失敗:", err.message);
  }
}

async function main() {
  const role = await ask("請輸入 role(bytes32 hex): ");
  const result = await getRoleAdmin(role);
  console.log(`Role Admin for ${role}:`, result);
  rl.close();
}
main();
