import { ethers } from "ethers";
import dotenv from "dotenv";
import { ABI } from "../DepositProduct_ABI.js";
dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.VITE_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contractAddress = process.env.VITE_DEPOSIT_CONTRACT_ADDRESS;
const contract = new ethers.Contract(contractAddress, ABI, wallet);

(async () => {
    try {
        const [addresses, depositIds] = await contract.getAllExpiredDeposits();
        console.log("到期未領定存:", addresses, depositIds);
    } catch (err) {
        console.error("查詢失敗:", err.reason || err.message);
    }
})();
