import { ethers } from "ethers";
import readline from "readline";
import dotenv from "dotenv";
import { ABI } from "../DepositProduct_ABI.js";
dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.VITE_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contractAddress = process.env.VITE_DEPOSIT_CONTRACT_ADDRESS;
const contract = new ethers.Contract(contractAddress, ABI, wallet);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
function ask(q) { return new Promise(res=>rl.question(q, res)); }

async function main() {
  const user = await ask("輸入用戶地址: ");
  const depositId = await ask("輸入定存紀錄ID: ");
  rl.close();

  try {
    const tx = await contract.withdrawDeposit(user, depositId);
    await tx.wait();
    console.log(`Tx sent: ${tx.hash}`);
  } catch (err) {
    console.error("提領失敗:", err.reason || err.message);
  }
}
main();
