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
  const from = await ask("請輸入 from 地址: ");
  const to = await ask("請輸入 to 地址: ");
  const amountRaw = await ask("請輸入金額（Ether）: ");
  rl.close();
  const amount = ethers.parseUnits(amountRaw, 18);
  try {
    const tx = await contract.transferFrom(from, to, amount);
    console.log("transferFrom 交易送出, hash:", tx.hash);
    const receipt = await tx.wait();
    console.log("轉帳完成，區塊高度:", receipt.blockNumber);
  } catch (err) {
    console.error("transferFrom 執行失敗:", err.message);
  }
}
main();
