import { ethers } from "ethers";
import dotenv from "dotenv";
import { ABI } from "../CreditCardProduct_ABI.js";
dotenv.config();
const provider = new ethers.JsonRpcProvider(process.env.VITE_RPC_URL);
const contract = new ethers.Contract(process.env.VITE_CREDITCARD_CONTRACT_ADDRESS, ABI, provider);

async function main() {
  const admin = await contract.bankAdmin();
  console.log("CreditCardProduct bankAdmin:", admin);
}
main();
