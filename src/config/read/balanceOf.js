import { ethers } from "ethers";
import readline from "readline";
import dotenv from "dotenv";
import { ABI } from "../NTD_TOKEN_ABI.js";

dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.VITE_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contractAddress = process.env.VITE_NTD_TOKEN_CONTRACT_ADDRESS;
const contract = new ethers.Contract(contractAddress, ABI, wallet);

// 建立命令列介面
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

export async function balanceOf(account) {
  try {
    const balance = await contract.balanceOf(account);
    return ethers.formatUnits(balance, 18);
  } catch (err) {
    console.error("讀取餘額失敗:", err.message);
  }
}

// 主程式
async function main() {
  const address = await ask("輸入要查詢的地址: ");
  rl.close();

  const result = await balanceOf(address);
  console.log(`Account ${address} 的餘額為: ${result}`);
}

main();
