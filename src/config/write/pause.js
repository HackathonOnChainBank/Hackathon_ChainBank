import { ethers } from "ethers";
import dotenv from "dotenv";
import { ABI } from "../NTD_TOKEN_ABI.js";
dotenv.config();
const provider = new ethers.JsonRpcProvider(process.env.VITE_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.VITE_NTD_TOKEN_CONTRACT_ADDRESS, ABI, wallet);
async function main() {
  try {
    const tx = await contract.pause();
    console.log("pause 交易送出, hash:", tx.hash);
    const receipt = await tx.wait();
    console.log("合約已暫停，區塊高度:", receipt.blockNumber);
  } catch (err) {
    console.error("pause 執行失敗:", err.message);
  }
}
main();
