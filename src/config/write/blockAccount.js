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
async function main() {
  const account = await ask("請輸入要封鎖的 address: ");
  rl.close();
  try {
    const tx = await contract.blockAccount(account);
    console.log("blockAccount 交易送出, hash:", tx.hash);
    const receipt = await tx.wait();
    console.log("封鎖完成，區塊高度:", receipt.blockNumber);
  } catch (err) {
    console.error("blockAccount 執行失敗:", err.message);
  }
}
main();
