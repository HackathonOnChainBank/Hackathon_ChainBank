import { ethers } from "ethers";
import dotenv from "dotenv";
import { ABI } from "../DepositProduct_ABI.js";
dotenv.config();
const provider = new ethers.JsonRpcProvider(process.env.VITE_RPC_URL);
const contract = new ethers.Contract(process.env.VITE_DEPOSIT_CONTRACT_ADDRESS, ABI, provider);
async function main() {
  const ntd = await contract.ntd();
  console.log("NTD_TOKEN 地址是:", ntd);
}
main();
