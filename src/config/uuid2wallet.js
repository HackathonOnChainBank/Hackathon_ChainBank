// UUID 到錢包的映射結構，包含 address 和 privateKey
const uuidToWallet = {
  // 示例映射：UUID 作為鍵，對象包含 address 和 privateKey
  shortuuid1: {
    address: "0x1234567890abcdef1234567890abcdef12345678",
    privateKey: import.meta.env.VITE_PRIVATE_KEY_1,
  },
  shortuuid2: {
    address: "0xabcdef1234567890abcdef1234567890abcdef12",
    privateKey: import.meta.env.VITE_PRIVATE_KEY_2,
  },
  shortuuid3: {
    address: "0x7890abcdef1234567890abcdef1234567890abcd",
    privateKey: import.meta.env.VITE_PRIVATE_KEY_3,
  },
  // 添加更多映射...
};

// 導出映射
export { uuidToWallet };
