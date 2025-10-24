import { ethers } from "ethers";
import readline from "readline";
import dotenv from "dotenv";
import { ABI } from "../NTD_TOKEN_ABI.js";

dotenv.config();
const provider = new ethers.JsonRpcProvider(process.env.VITE_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.VITE_NTD_TOKEN_CONTRACT_ADDRESS, ABI, wallet);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
function ask(q) { return new Promise(r => rl.question(q, r)); }

export async function allowance(owner, spender) {
  try {
    const amount = await contract.allowance(owner, spender);
    return ethers.formatUnits(amount, 18);
  } catch (err) {
    console.error("讀取允許額失敗:", err.message);
  }
}

async function main() {
  const owner = await ask("輸入 owner 地址: ");
  const spender = await ask("輸入 spender 地址: ");
  rl.close();
  const result = await allowance(owner, spender);
  console.log(`允許額: ${result}`);
}
main();
