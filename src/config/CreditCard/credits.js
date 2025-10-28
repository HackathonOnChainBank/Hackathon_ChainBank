import { ethers } from "ethers";
import readline from "readline";
import dotenv from "dotenv";
import { ABI } from "../CreditCardProduct_ABI.js";
dotenv.config();
const provider = new ethers.JsonRpcProvider(process.env.VITE_RPC_URL);
const contract = new ethers.Contract(process.env.VITE_CREDITCARD_CONTRACT_ADDRESS, ABI, provider);
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
function ask(q) { return new Promise(res=>rl.question(q, res)); }
async function main() {
  const user = await ask("輸入用戶地址: ");
  rl.close();
  const info = await contract.credits(user);
  console.log(info);
}
main();
