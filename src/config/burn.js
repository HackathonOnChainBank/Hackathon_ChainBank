import { ethers } from "ethers";
import readline from "readline";
import dotenv from "dotenv";
dotenv.config();

// 1️⃣ 初始化 provider 與 signer
const provider = new ethers.JsonRpcProvider(process.env.VITE_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contractAddress = process.env.VITE_NTD_TOKEN_CONTRACT_ADDRESS;

// 2️⃣ 匯入 ABI（確認裡面包含 "function burn(uint256 amount)"）
const { ABI } = await import("./NTD_TOKEN_ABI.js");
const contract = new ethers.Contract(contractAddress, ABI, wallet);

// 3️⃣ CLI 輸入設定
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

// 4️⃣ 主程式（burn 自身代幣）
async function main() {
  const amountInput = await ask("輸入要銷毀的 Token 數量: ");
  rl.close();

  const amount = ethers.parseUnits(amountInput, 18);
  try {
    const tx = await contract.burn(amount);
    console.log("燒毀交易送出，Hash:", tx.hash);

    const receipt = await tx.wait();
    console.log("🔥 銷毀成功，區塊高度:", receipt.blockNumber);
  } catch (err) {
    console.error("銷毀失敗:", err.message);
  }
}

main();
