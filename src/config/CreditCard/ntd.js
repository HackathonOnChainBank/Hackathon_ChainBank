import { ethers } from "ethers";
import dotenv from "dotenv";
import { ABI } from "../CreditCardProduct_ABI.js";
dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.VITE_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contractAddress = process.env.VITE_CREDITCARD_CONTRACT_ADDRESS;
const contract = new ethers.Contract(contractAddress, ABI, wallet);

(async () => {
    const ntdAddr = await contract.ntd();
    console.log("NTD Token address:", ntdAddr);
})();
