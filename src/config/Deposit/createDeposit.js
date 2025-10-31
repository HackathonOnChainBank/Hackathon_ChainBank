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
function ask(q) { return new Promise(res => rl.question(q, res)); }

async function main() {
    const user = await ask("輸入用戶地址: ");
    const amount = await ask("輸入存款金額（wei）: ");
    const period = await ask("輸入定存期數（秒）: ");
    const interestRate = await ask("輸入利率（萬分比）: ");
    rl.close();
    try {
        const tx = await contract.createDeposit(user, amount, period, interestRate);
        await tx.wait();
        console.log("定存建立成功，Tx:", tx.hash);
    } catch (err) {
        console.error("定存建立失敗:", err.reason || err.message);
    }
}
main();
