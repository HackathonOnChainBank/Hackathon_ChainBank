import { ethers } from "ethers";
import readline from "readline";
import dotenv from "dotenv";
import { ABI } from "../DepositProduct_ABI.js";
dotenv.config();
const provider = new ethers.JsonRpcProvider(process.env.VITE_RPC_URL);
const contract = new ethers.Contract(process.env.VITE_DEPOSIT_CONTRACT_ADDRESS, ABI, provider);
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
function ask(q) { return new Promise(res=>rl.question(q, res)); }
async function main() {
  const user = await ask("輸入要查詢的用戶地址: ");
  rl.close();
  const all = await contract.deposits(user);
  console.log(all);
}
main();
