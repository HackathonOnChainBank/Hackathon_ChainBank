/**
 * Short UUID 到錢包的映射
 * 
 * 安全說明：
 * - 用戶只會知道 shortUuid（帳號 ID）
 * - privateKey 僅存儲在此檔案中，不對用戶顯示
 * - 用戶使用 shortUuid + 密碼登入
 * - 系統內部透過此映射取得對應的 privateKey 進行簽名
 * 
 * 格式：
 * "shortUuid": {
 *   address: "錢包地址",
 *   privateKey: "私鑰"
 * }
 * 
 * 注意：這只是一個示例映射，實際應用中請確保私鑰的安全存儲和管理。(因系統無串接後端故會先放在此檔案)
 */

const uuidToWallet = {
  // 示例 1
  "A1B2C3D4": {
    address: "0x1234567890abcdef1234567890abcdef12345678",
    privateKey: import.meta.env.VITE_PRIVATE_KEY_1 || "0x..."
  },
  
  // 示例 2
  "E5F6G7H8": {
    address: "0xabcdef1234567890abcdef1234567890abcdef12",
    privateKey: import.meta.env.VITE_PRIVATE_KEY_2 || "0x..."
  },
  
  // 示例 3
  "I9J0K1L2": {
    address: "0x7890abcdef1234567890abcdef1234567890abcd",
    privateKey: import.meta.env.VITE_PRIVATE_KEY_3 || "0x..."
  },

  "3LLhLwphR7iVbUvQLkfRxm":{
    address: "0x3D97376CB45a3Dd065E2Bee86B38181D1880C1c9",
    privateKey: import.meta.env.VITE_PRIVATE_KEY_4 || "0x..."
  },
  "2Kt3LuZSVbSEDwUg3la33D":{
    address: "0x3FA42BA424cd1DBB48ad1E3e2a1C0eB6362b2669",
    privateKey: import.meta.env.VITE_PRIVATE_KEY_5 || "0x..."
  }
  
  // 新用戶註冊時，需要手動添加到這裡
  // 註冊時 console 會輸出需要添加的格式
};

// 獲取指定 shortUuid 的錢包資訊
export const getWalletByShortUuid = (shortUuid) => {
  return uuidToWallet[shortUuid] || null;
};

// 導出完整映射（謹慎使用）
export { uuidToWallet };
