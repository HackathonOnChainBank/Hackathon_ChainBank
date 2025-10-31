# WalrusOnlineBankStorage 智能合約說明

## 🎯 概述

`WalrusOnlineBankStorage.sol` 是 ChainBank 與 **Walrus 去中心化存儲網路**整合的智能合約，用於在區塊鏈上記錄和管理存儲在 Walrus 上的文件索引。

---

## 🌊 什麼是 Walrus？

**Walrus** 是一個去中心化的存儲網路，類似於 IPFS 或 Arweave，但針對大型文件和數據進行了優化。

### Walrus 的特點
- 🔐 **去中心化**：數據分散存儲在多個節點
- 💾 **持久化**：數據永久保存，不會丟失
- 🚀 **高效**：針對大文件優化，上傳和下載速度快
- 💰 **經濟**：存儲成本遠低於傳統雲存儲

### Walrus 的工作流程

```
┌─────────────────────────────────────────────────────┐
│              ChainBank + Walrus 架構                 │
└─────────────────────────────────────────────────────┘

1. 用戶上傳文件
    ↓
┌─────────────────┐
│   前端 (React)   │
│  選擇文件並上傳  │
└─────────────────┘
    ↓
2. 文件發送到 Walrus
    ↓
┌─────────────────┐
│ Walrus Network  │
│  存儲文件數據    │
│  返回 dataId    │
│  返回 proof     │
└─────────────────┘
    ↓
3. 記錄到區塊鏈
    ↓
┌──────────────────────────┐
│ WalrusOnlineBankStorage  │
│  記錄 dataId 和 proof    │
│  與用戶地址綁定          │
└──────────────────────────┘
    ↓
4. 隨時可以讀取
    ↓
通過 dataId 從 Walrus 取回文件
```

---

## 📋 合約功能

### 資料結構：FileInfo

```solidity
struct FileInfo {
    string dataId;      // Walrus 回傳的數據 ID（文件唯一標識符）
    string proof;       // Walrus 回傳的證明（驗證文件完整性）
    string fileType;    // 文件類型（image/pdf/json/video 等）
    uint256 timestamp;  // 上傳時間戳
}
```

**欄位說明：**
- **dataId**：Walrus 存儲網路返回的唯一文件標識符，類似於 IPFS 的 CID
- **proof**：Walrus 提供的加密證明，用於驗證文件未被篡改
- **fileType**：文件類型標籤，方便前端分類和顯示
- **timestamp**：文件上傳到區塊鏈的時間

---

## 🔧 主要函數

### 1. `storeFile()` - 存儲文件索引

```solidity
function storeFile(
    string memory dataId,
    string memory proof,
    string memory fileType
) external;
```

**功能：** 將 Walrus 返回的文件信息記錄到區塊鏈

**參數：**
- `dataId`: Walrus 返回的數據 ID
- `proof`: Walrus 返回的驗證證明
- `fileType`: 文件類型（如 "image", "pdf", "json"）

**範例：**
```javascript
// 前端上傳文件到 Walrus 後
const walrusResponse = await uploadToWalrus(file);
// walrusResponse = { dataId: "abc123...", proof: "xyz789..." }

// 將索引記錄到區塊鏈
const tx = await contract.storeFile(
  walrusResponse.dataId,
  walrusResponse.proof,
  "image"  // 文件類型
);
await tx.wait();
console.log("文件索引已上鏈！");
```

**觸發事件：**
```solidity
event FileStored(
    address indexed user,
    string dataId,
    string proof,
    string fileType,
    uint256 timestamp,
    uint256 fileIndex
);
```

---

### 2. `getFileCount()` - 獲取文件數量

```solidity
function getFileCount(address user) external view returns (uint256);
```

**功能：** 查詢用戶上傳了多少個文件

**範例：**
```javascript
const count = await contract.getFileCount(userAddress);
console.log(`用戶共上傳了 ${count} 個文件`);
```

---

### 3. `getFile()` - 獲取特定文件

```solidity
function getFile(address user, uint256 index) 
    external view returns (FileInfo memory);
```

**功能：** 根據索引獲取用戶的某個文件信息

**參數：**
- `user`: 用戶地址
- `index`: 文件索引（從 0 開始）

**範例：**
```javascript
// 獲取用戶的第一個文件
const file = await contract.getFile(userAddress, 0);
console.log("DataId:", file.dataId);
console.log("Proof:", file.proof);
console.log("Type:", file.fileType);
console.log("Time:", new Date(file.timestamp * 1000));
```

---

### 4. `getAllFiles()` - 獲取所有文件

```solidity
function getAllFiles(address user) 
    external view returns (FileInfo[] memory);
```

**功能：** 獲取用戶上傳的所有文件信息

**範例：**
```javascript
const files = await contract.getAllFiles(userAddress);

files.forEach((file, index) => {
  console.log(`文件 #${index}:`);
  console.log("  DataId:", file.dataId);
  console.log("  類型:", file.fileType);
  console.log("  上傳時間:", new Date(file.timestamp * 1000));
});
```

---

### 5. `getLatestFile()` - 獲取最新文件

```solidity
function getLatestFile(address user) 
    external view returns (FileInfo memory);
```

**功能：** 獲取用戶最近上傳的文件

**範例：**
```javascript
const latestFile = await contract.getLatestFile(userAddress);
console.log("最新上傳的文件:", latestFile.dataId);
```

---

## 🚀 完整使用流程

### Step 1: 前端上傳文件到 Walrus

```javascript
// 用戶選擇文件
const fileInput = document.getElementById('fileInput');
const file = fileInput.files[0];

// 上傳到 Walrus（通過 API 或 SDK）
async function uploadToWalrus(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('https://walrus-api.example.com/upload', {
    method: 'POST',
    body: formData
  });
  
  const data = await response.json();
  // 返回格式：{ dataId: "...", proof: "..." }
  return data;
}

const walrusResult = await uploadToWalrus(file);
console.log("Walrus DataId:", walrusResult.dataId);
```

---

### Step 2: 將索引記錄到區塊鏈

```javascript
// 連接合約
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(privateKey, provider);
const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  ABI,
  wallet
);

// 記錄文件索引
const tx = await contract.storeFile(
  walrusResult.dataId,
  walrusResult.proof,
  file.type.split('/')[0]  // "image", "video", "application"
);

console.log("交易已發送:", tx.hash);
await tx.wait();
console.log("✅ 文件索引已記錄到區塊鏈！");
```

---

### Step 3: 讀取並顯示文件

```javascript
// 獲取用戶的所有文件
const files = await contract.getAllFiles(userAddress);

// 從 Walrus 取回實際文件
async function getFileFromWalrus(dataId) {
  const response = await fetch(`https://walrus-api.example.com/download/${dataId}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

// 顯示圖片範例
for (const file of files) {
  if (file.fileType === 'image') {
    const imageUrl = await getFileFromWalrus(file.dataId);
    
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = `Uploaded at ${new Date(file.timestamp * 1000)}`;
    document.body.appendChild(img);
  }
}
```

---

## 💡 實際應用場景

### 1. 信用卡卡面存儲

```javascript
// 用戶上傳自定義卡面
const cardDesign = document.getElementById('cardDesign').files[0];

// 上傳到 Walrus
const walrusResponse = await uploadToWalrus(cardDesign);

// 記錄到區塊鏈
await contract.storeFile(
  walrusResponse.dataId,
  walrusResponse.proof,
  "image"
);

// 申請信用卡時使用這個 dataId
await creditCardContract.applyForCard(
  userId,
  walrusResponse.dataId  // cardStyle 參數
);
```

```
┌──────────────────────────────────────────────┐
│          ChainBank 生態系統                    │
└──────────────────────────────────────────────┘

┌────────────────────┐
│  CreditCard.sol    │ ← 使用 Walrus dataId 作為卡面
└────────────────────┘
         │
         ↓
┌────────────────────┐
│ WalrusOnlineBank   │ ← 存儲文件索引（本合約）
│    Storage.sol     │
└────────────────────┘
         │
         ↓
┌────────────────────┐
│  Walrus Network    │ ← 實際存儲文件數據
└────────────────────┘
```

---

## 🆚 對比其他存儲方案

| 特性 | 傳統數據庫 | IPFS | Walrus + 區塊鏈 |
|-----|----------|------|----------------|
| **去中心化** | ❌ 中心化 | ✅ 去中心化 | ✅ 完全去中心化 |
| **數據持久性** | ⚠️ 取決於服務商 | ⚠️ 需要 pinning | ✅ 永久保存 |
| **訪問控制** | ✅ 靈活 | ❌ 基本無 | ✅ 智能合約控制 |
| **驗證機制** | ❌ 信任服務商 | ✅ Content Hash | ✅ Proof + 區塊鏈 |
| **成本** | 💰 月費 | 💰 pinning 費用 | 💰 一次性上傳費 |
| **查詢速度** | ⚡ 極快 | ⚡ 快 | ⚡ 快 |

---

**與 ChainBank 系統的完美結合：**
- 🎴 信用卡卡面存儲
- 📄 KYC 文件管理
- 👤 用戶頭像和資料
- 📊 財務報表存檔

**讓去中心化存儲變得簡單實用！**
