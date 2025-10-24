import { ethers } from "ethers";
import readline from "readline";
import dotenv from "dotenv";
dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.VITE_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contractAddress = process.env.VITE_NTD_TOKEN_CONTRACT_ADDRESS;
const { ABI } = await import("./NTD_TOKEN_ABI.js");
const contract = new ethers.Contract(contractAddress, ABI, wallet);

// 建立命令行介面
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// 封裝 Promise 問答
function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function main() {
  const to = await ask("輸入接收者地址: ");
  const amountInput = await ask("輸入轉帳金額: ");
  rl.close();

  const amount = ethers.parseUnits(amountInput, 18);

  try {
    const tx = await contract.transfer(to, amount);
    console.log("交易送出，Hash:", tx.hash);

    const receipt = await tx.wait();
    console.log("交易完成，區塊高度:", receipt.blockNumber);
  } catch (err) {
    console.error("交易失敗:", err.message);
  }
}

main();
