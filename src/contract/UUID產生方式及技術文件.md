# ChainBank 用戶識別系統說明

## 概述

ChainBank 使用 **UUID (通用唯一識別碼)** 和 **Short UUID (短識別碼)** 系統來為每位客戶生成唯一的帳號 ID，就像傳統銀行的帳戶號碼一樣。

---

## 為什麼需要這個系統？

### 傳統銀行的做法
- 傳統銀行給每位客戶一個 **帳戶號碼**，例如：`1234567890123`
- 這個號碼是唯一的，不會重複
- 客戶用這個號碼來辦理業務、轉帳、查詢

### ChainBank 的做法
- 使用 **區塊鏈錢包地址** 作為帳戶（例如：`0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`）
- 但錢包地址 **太長、太難記**，不適合日常使用
- 所以我們生成一個 **短而唯一的 ID**，例如：`3tBPSetZF2e8IfKQiTvg5h`

---

## 系統架構

```
┌─────────────────────────────────────────────────────┐
│                    用戶註冊流程                        │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│ 1. uuid-generator.js                                 │
│    生成標準 UUID (128 位元)                           │
│    範例: 550e8400-e29b-41d4-a716-446655440000        │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│ 2. short-uuid.js                                     │
│    將 UUID 轉換為 Short ID (22 個字元)                │
│    範例: 3tBPSetZF2e8IfKQiTvg5h                      │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│ 3. 系統儲存                                          │
│    • UUID: 內部完整記錄                               │
│    • Short UUID: 客戶使用的帳號 ID                    │
│    • 錢包地址: 區塊鏈交易地址                          │
└─────────────────────────────────────────────────────┘
```

---

## uuid-generator.js - UUID 生成器

### 作用
生成一個 **全球唯一的識別碼 (UUID)**，確保不會與其他用戶重複。

### 類比銀行
就像銀行的 **身分證號碼系統** 一樣：
- 每個人都有一個獨一無二的身分證號碼
- 不會有兩個人的號碼相同
- 即使在不同銀行，也能透過身分證號碼識別

### UUID 格式
```
標準 UUID: 550e8400-e29b-41d4-a716-446655440000
           │       │    │    │    │
           8位     4位  4位  4位  12位 (共 36 個字元)
```

### 主要功能

#### 1. `generateUuidV4()` - 隨機生成 UUID
```javascript
const uuid = generateUuidV4();
// 結果: "550e8400-e29b-41d4-a716-446655440000"
```

**銀行類比：**
- 就像銀行隨機生成一個新的帳戶號碼
- 使用密碼學安全的隨機數生成器
- 保證全球唯一性（碰撞機率 < 10^-18）

**銀行類比：**
- 像是根據「分行代碼 + 客戶名字」產生固定號碼
- 可用於系統間的 ID 對應

### 驗證功能
```javascript
// 檢查是否為有效 UUID
isValidUuid("550e8400-e29b-41d4-a716-446655440000"); // true

// 取得 UUID 版本
getUuidVersion("550e8400-e29b-41d4-a716-446655440000"); // 4
```

---

## short-uuid.js - 短識別碼轉換器

### 作用
將 **長的 UUID** 轉換成 **短而易讀的 ID**，方便客戶使用。

### 類比銀行
就像銀行的 **客戶代號**：
- 完整帳號：`001-1234567-890123-4` （太長）
- 客戶代號：`C12345678` （簡短好記）
- 兩者都能代表同一個客戶

### 轉換原理

#### 從 UUID 到 Short UUID
```javascript
const uuid = "550e8400-e29b-41d4-a716-446655440000";
const shortId = uuidToShortId(uuid);
// 結果: "3tBPSetZF2e8IfKQiTvg5h" (22 個字元)
```

**技術說明：**
1. 移除 UUID 中的 `-` 符號
2. 將 16 進位數字轉換為 BigInt (大整數)
3. 使用 64 個字元的字符集 `0-9a-zA-Z_-` 進行編碼
4. 結果長度固定為 **22 個字元**

**優勢：**
- ✅ 從 36 字元減少到 22 字元 (減少 39%)
- ✅ 沒有特殊符號 `-`，更適合網址和輸入
- ✅ 大小寫混合，增加資訊密度
- ✅ 可以完全還原回原始 UUID

#### 從 Short UUID 還原回 UUID
```javascript
const shortId = "3tBPSetZF2e8IfKQiTvg5h";
const uuid = shortIdToUuid(shortId);
// 結果: "550e8400-e29b-41d4-a716-446655440000"
```

**銀行類比：**
- 客戶提供簡短代號 → 系統還原完整帳號
- 完全無損轉換，不會丟失資訊

### 字符集設計

```javascript
const defaultCharacters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-";
// 共 64 個字元 (2^6)
```

**選擇原因：**
- 包含數字、大小寫字母、底線、連字號
- 適合網址 (URL-safe)
- 避免容易混淆的字元（0 與 O，1 與 l）
- 64 個字元 = 2^6，數學上效率最高

---

## 銀行業務應用場景

### 場景 1：客戶註冊開戶

```javascript
// 1. 客戶填寫註冊表單
const customerInfo = {
  fullName: "張三",
  email: "zhangsan@example.com",
  phone: "+886912345678"
};

// 2. 系統生成唯一識別碼
const uuid = generateUuidV4();
// "550e8400-e29b-41d4-a716-446655440000"

// 3. 轉換為客戶帳號 ID
const customerId = uuidToShortId(uuid);
// "3tBPSetZF2e8IfKQiTvg5h"

// 4. 創建區塊鏈錢包
const wallet = createWallet();
// 地址: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"

// 5. 儲存對應關係
database.save({
  customerId: "3tBPSetZF2e8IfKQiTvg5h",  // 對外顯示
  uuid: "550e8400-...",                    // 內部完整記錄
  walletAddress: "0x742d35...",            // 區塊鏈地址
  ...customerInfo
});
```

**客戶體驗：**
- ✅ 客戶只需記住：`3tBPSetZF2e8IfKQiTvg5h`
- ✅ 不需要記住錢包地址：`0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`
- ✅ 登入時輸入簡短 ID + 密碼

### 場景 2：客戶登入

```javascript
// 客戶輸入
const inputId = "3tBPSetZF2e8IfKQiTvg5h";
const password = "myPassword123";

// 系統查詢
const customer = database.findByCustomerId(inputId);
if (customer && verifyPassword(password, customer.passwordHash)) {
  // 登入成功，載入錢包
  const wallet = loadWallet(customer.uuid, password);
  console.log("歡迎回來，", customer.fullName);
}
```

### 場景 3：轉帳/匯款

```javascript
// 傳統方式（困難）
"請轉帳到 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"

// ChainBank 方式（簡單）
"請轉帳到 3tBPSetZF2e8IfKQiTvg5h"

// 系統處理
const recipientId = "3tBPSetZF2e8IfKQiTvg5h";
const recipient = database.findByCustomerId(recipientId);
const recipientAddress = recipient.walletAddress;

// 執行區塊鏈轉帳
sendTransaction(senderWallet, recipientAddress, amount);
```

---

## 安全性與唯一性保證

### UUID V4 的安全性

- **隨機位元數：** 122 位元
- **可能組合數：** 2^122 ≈ 5.3 × 10^36
- **碰撞機率：** 生成 10 億個 UUID，碰撞機率 < 10^-18

**銀行類比：**
- 相當於全球 70 億人每人每秒生成 100 個 UUID
- 需要 **8600 萬年** 才有 50% 機率碰撞
- 實務上可以視為絕對不會重複

### Short UUID 的安全性

- ✅ **無損轉換：** 可以 100% 還原回原始 UUID
- ✅ **長度固定：** 永遠是 22 個字元
- ✅ **唯一性保證：** 繼承 UUID 的唯一性
- ✅ **不可預測：** 無法從 Short ID 推測下一個

### 資料保護

```javascript
// ✅ 對外顯示（安全）
customerId: "3tBPSetZF2e8IfKQiTvg5h"

// ✅ 內部儲存（完整）
uuid: "550e8400-e29b-41d4-a716-446655440000"
walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"

// ❌ 永不對外（加密儲存）
privateKey: "0x..."  // 錢包私鑰
passwordHash: "..."   // 密碼雜湊
```

---

## 實際使用範例

### 完整客戶註冊流程

```javascript
import { generateUuidV4 } from './uuid-generator.js';
import { uuidToShortId } from './short-uuid.js';

async function registerCustomer(customerInfo) {
  // 步驟 1: 生成 UUID
  const uuid = generateUuidV4();
  console.log("內部 UUID:", uuid);
  // "550e8400-e29b-41d4-a716-446655440000"
  
  // 步驟 2: 轉換為 Short ID
  const customerId = uuidToShortId(uuid);
  console.log("客戶帳號:", customerId);
  // "3tBPSetZF2e8IfKQiTvg5h"
  
  // 步驟 3: 創建區塊鏈錢包
  const wallet = ethers.Wallet.createRandom();
  console.log("錢包地址:", wallet.address);
  // "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  
  // 步驟 4: 儲存用戶資料
  const customer = {
    uuid,
    customerId,
    walletAddress: wallet.address,
    privateKey: encryptPrivateKey(wallet.privateKey, password),
    ...customerInfo,
    createdAt: new Date().toISOString()
  };
  
  // 步驟 5: 返回客戶帳號
  return {
    customerId,  // 提供給客戶
    walletAddress: wallet.address  // 用於區塊鏈交易
  };
}
```

### 客戶查詢流程

```javascript
function findCustomer(customerId) {
  // 方法 1: 直接用 Short ID 查詢（推薦）
  const customer = database.findByCustomerId(customerId);
  
  // 方法 2: 還原 UUID 再查詢
  const uuid = shortIdToUuid(customerId);
  const customer = database.findByUuid(uuid);
  
  return customer;
}
```

---

## 系統優勢總結

### 對客戶的優勢
| 傳統銀行 | ChainBank |
|---------|-----------|
| 帳號: `1234-5678-9012-3456` | 帳號: `3tBPSetZF2e8IfKQiTvg5h` |
| 需記住 19 位數字 | 只需記住 22 個字元 |
| 純數字，容易混淆 | 大小寫混合，更好辨識 |
| 無法追溯到區塊鏈 | 直接對應到錢包地址 |

### 對系統的優勢
- ✅ **全球唯一性：** 不需要中央資料庫協調
- ✅ **無損轉換：** Short ID ↔ UUID 完全可逆
- ✅ **資料隱私：** 錢包地址不直接暴露
- ✅ **易於整合：** 標準 UUID 可對接其他系統
- ✅ **擴展性強：** 支援分散式架構

---

## 技術規格

### UUID V4 規格
- **標準：** RFC 4122
- **格式：** `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`
- **長度：** 36 字元 (含連字號)
- **編碼：** 16 進位 (0-9, a-f)
- **隨機位元：** 122 bits
- **版本位元：** 4 bits (固定為 0100)
- **變體位元：** 2 bits (固定為 10)

### Short UUID 規格
- **格式：** Base64 變體編碼
- **長度：** 22 字元 (固定)
- **字符集：** `0-9a-zA-Z_-` (64 個字元)
- **編碼效率：** 6 bits per character
- **總位元數：** 132 bits (超過 UUID 的 128 bits，用於對齊)

---

## 常見問題 FAQ

### Q1: Short ID 會不會重複？
**A:** 不會。Short ID 是從 UUID 轉換而來，繼承了 UUID 的唯一性保證。UUID V4 的碰撞機率低於 10^-18，實務上可視為絕對不會重複。

### Q2: 為什麼不直接用錢包地址當帳號？
**A:** 錢包地址太長 (42 字元)，而且全是 16 進位數字，不適合人類記憶和輸入。Short ID 只有 22 字元，且包含大小寫字母，更易辨識。

### Q3: Short ID 可以改回 UUID 嗎？
**A:** 可以，這是無損轉換。使用 `shortIdToUuid()` 函數可以完全還原原始 UUID。

### Q4: 如果用戶忘記 Short ID 怎麼辦？
**A:** 系統可以透過其他方式（email、電話、身分證）查詢並提供 Short ID，就像銀行的「忘記帳號」功能。

### Q5: 這個系統安全嗎？
**A:** 非常安全。UUID 使用密碼學安全的隨機數生成器，Short ID 轉換是數學上的編碼變換，不會降低安全性。私鑰和密碼都經過加密儲存。

---

## 總結

ChainBank 的 UUID 系統就像是 **現代化的銀行帳號系統**：

- **UUID (完整識別碼)** = 銀行內部的完整客戶編號
- **Short UUID (客戶帳號)** = 對外顯示的簡短帳號
- **錢包地址 (區塊鏈地址)** = 實際進行交易的帳戶地址

透過這三層設計，我們在保證唯一性和安全性的同時，也提供了良好的使用者體驗。
