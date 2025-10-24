// Node ESM script — 在執行前會載入 .env，再動態 import 專案模組
import dotenv from "dotenv";
dotenv.config();

const { default: NTD_TOKEN_ABI } = await import(
  "../src/config/NTD_TOKEN_ABI.js"
);
const transferMod = await import("../src/config/transfer.js");
const { callReadFunction } = transferMod;

const holderArg = process.argv[2]; // 可選：傳入要查詢的地址

async function main() {
  try {
    console.log("測試合約位址與 RPC（來源：.env）...");
    // 若需要也可印出預設位址 (transfer.js 在匯入時已用 process.env 讀取)
    // callReadFunction 會使用 transfer.js 的 DEFAULT_CONTRACT_ADDRESS（若有在 .env 設定）
    const name = await callReadFunction("name", [], undefined, NTD_TOKEN_ABI);
    console.log("name:", name);

    const symbol = await callReadFunction(
      "symbol",
      [],
      undefined,
      NTD_TOKEN_ABI
    );
    console.log("symbol:", symbol);

    const decimals = await callReadFunction(
      "decimals",
      [],
      undefined,
      NTD_TOKEN_ABI
    );
    console.log(
      "decimals:",
      decimals.toString ? decimals.toString() : decimals
    );

    const total = await callReadFunction(
      "totalSupply",
      [],
      undefined,
      NTD_TOKEN_ABI
    );
    console.log("totalSupply:", total.toString ? total.toString() : total);

    if (holderArg) {
      const bal = await callReadFunction(
        "balanceOf",
        [holderArg],
        undefined,
        NTD_TOKEN_ABI
      );
      console.log(
        `balanceOf ${holderArg}:`,
        bal.toString ? bal.toString() : bal
      );
    } else {
      console.log(
        "未提供 holder address。若要查 balanceOf，請執行：node scripts/test-transfer.js 0xYourAddress"
      );
    }

    process.exit(0);
  } catch (err) {
    console.error("測試失敗：", err);
    process.exit(1);
  }
}

await main();
