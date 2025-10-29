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
    const amount = await ask("輸入還款金額（wei）: ");
    rl.close();
    try {
        const tx = await contract.repay(user, amount);
        await tx.wait();
        console.log("Repay success! Tx:", tx.hash);
    } catch (err) {
        console.error("還款失敗:", err.reason || err.message);
    }
}
main();
