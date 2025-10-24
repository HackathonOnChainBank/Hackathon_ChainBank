import { ethers } from "ethers";
import readline from "readline";
import dotenv from "dotenv";
dotenv.config();

// 1️⃣ 初始化 provider 與 signer
const provider = new ethers.JsonRpcProvider(process.env.VITE_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contractAddress = process.env.VITE_NTD_TOKEN_CONTRACT_ADDRESS;

// 2️⃣ 匯入 ABI（確保 ABI 內真的有 mint 函式）
const { ABI } = await import("./NTD_TOKEN_ABI.js");
const contract = new ethers.Contract(contractAddress, ABI, wallet);

// 3️⃣ 使用 readline 互動式輸入
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

// 4️⃣ 主程式
async function main() {
  const to = await ask("輸入要鑄幣給誰的地址: ");
  const amountInput = await ask("輸入要鑄造幾顆 Token: ");
  rl.close();

  // ERC20 預設 18 位數，轉成 Wei 單位
  const amount = ethers.parseUnits(amountInput, 18);

  try {
    // 呼叫 mint 函式
    const tx = await contract.mint(to, amount);
    console.log("交易送出，Hash:", tx.hash);

    const receipt = await tx.wait();
    console.log("鑄幣成功，區塊高度:", receipt.blockNumber);
  } catch (err) {
    console.error("鑄幣失敗:", err.message);
  }
}

main();
