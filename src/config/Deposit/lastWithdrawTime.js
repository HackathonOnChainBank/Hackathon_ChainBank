import { ethers } from "ethers";
import readline from "readline";
import dotenv from "dotenv";
import { ABI } from "../DepositProduct_ABI.js";
dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.VITE_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contractAddress = process.env.VITE_DEPOSIT_CONTRACT_ADDRESS;
const contract = new ethers.Contract(contractAddress, ABI, wallet);

const rl = readline.createInterface({input: process.stdin, output: process.stdout});
const ask = q => new Promise(res=>rl.question(q, res));
async function main() {
    const user = await ask("用戶地址: ");
    rl.close();
    try {
        const t = await contract.lastWithdrawTime(user);
        console.log("lastWithdrawTime:", t.toString());
    } catch (err) {
        console.error("查詢失敗:", err.reason || err.message);
    }
}
main();
