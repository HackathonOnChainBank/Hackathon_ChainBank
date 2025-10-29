import { ethers } from "ethers";
import readline from "readline";
import dotenv from "dotenv";
import { ABI } from "../CreditCardProduct_ABI.js";
dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.VITE_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contractAddress = process.env.VITE_CREDITCARD_CONTRACT_ADDRESS;
const contract = new ethers.Contract(contractAddress, ABI, wallet);

const rl = readline.createInterface({input: process.stdin, output: process.stdout});
const ask = q => new Promise(res=>rl.question(q, res));

async function main() {
    const user = await ask("輸入用戶地址: ");
    const idxRaw = await ask("輸入查詢的消費紀錄index（如0、1、2）: ");
    rl.close();
    const idx = parseInt(idxRaw);
    try {
        const record = await contract.spendRecords(user, idx);
        console.log(`第${idx}筆消費紀錄:`, record);
    } catch (err) {
        console.error("查詢失敗:", err.reason || err.message);
    }
}
main();
