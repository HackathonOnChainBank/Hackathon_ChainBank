# CreditCard 智能合約說明

## 概述

`CreditCard.sol` 是 ChainBank 的信用卡系統智能合約，提供完整的信用卡申請、消費、還款功能。

---

## 主要功能

### 1. 信用卡申請
- **自動審核**：根據用戶的 NTD_TOKEN 餘額自動計算信用額度
- **即時核卡**：申請後立即核准，無需等待
- **個性化卡面**：支援選擇卡片樣式（Walrus Blob ID）

### 2. 額度計算規則

| NTD 餘額範圍 | 信用額度 |
|-------------|---------|
| < 1,000 NTD | 不符合申請資格 |
| 1,000 - 5,000 NTD | 餘額 × 0.5 |
| 5,000 - 10,000 NTD | 餘額 × 0.8 |
| 10,000 - 50,000 NTD | 餘額 × 1.0 |
| > 50,000 NTD | 餘額 × 1.2（最高 100,000 NTD） |

### 3. 刷卡消費
- **先墊款後還款**：合約代為支付給商家，用戶累積欠款
- **額度控管**：自動檢查是否超過信用額度
- **消費記錄**：完整追蹤每筆消費的商家、金額、時間

### 4. 還款機制
- **彈性還款**：用戶可隨時還款
- **餘額更新**：還款後立即減少欠款餘額
- **資金回流**：還款金額歸回合約

---

## 資料結構

### CardApplication（申請記錄）
```solidity
struct CardApplication {
    string userId;              // 用戶 ID
    uint256 creditLimit;        // 核准額度
    string cardStyle;           // 卡片樣式 (Walrus Blob ID)
    uint256 applicationTime;    // 申請時間
    bool approved;              // 是否已核准
    uint256 approvedTime;       // 核准時間
}
```

### CreditInfo（信用卡資訊）
```solidity
struct CreditInfo {
    uint256 limit;              // 信用卡總額度
    uint256 balance;            // 未還款累積金額（欠款）
    uint256 lastBillTime;       // 上次結帳時間
    bool hasCard;               // 是否已核卡
}
```

### SpendRecord（消費記錄）
```solidity
struct SpendRecord {
    address merchant;           // 消費商家
    uint256 amount;             // 單筆消費金額
    uint256 timestamp;          // 消費時間
}
```

---

## 主要函數

### 用戶端函數

#### `applyForCard(string userId, string cardStyle)`
申請信用卡，自動審核並核准
- **參數**：
  - `userId`: 用戶 ID
  - `cardStyle`: 選擇的卡片樣式 (Walrus Blob ID)
- **要求**：NTD 餘額 ≥ 1,000

#### `getCreditInfo(address user)`
查詢用戶的信用卡資訊
- **返回**：額度、欠款、可用額度、是否有卡

#### `getUserApplications(address user)`
查詢用戶的所有申請記錄

#### `getSpendRecords(address user)`
查詢用戶的所有消費記錄

### 管理員函數

#### `spend(address user, address merchant, uint256 amount)`
處理刷卡消費（僅管理員）
- **流程**：
  1. 檢查用戶是否有信用卡
  2. 檢查是否超過信用額度
  3. 合約轉帳給商家
  4. 增加用戶欠款

#### `repay(address user, uint256 amount)`
處理用戶還款（僅管理員）
- **流程**：
  1. 從用戶轉帳到合約
  2. 減少用戶欠款餘額

#### `setCreditLimit(address user, uint256 amount)`
手動設定/調整用戶信用額度

#### `approveCard(address user, uint256 applicationIndex)`
手動核准信用卡申請（如需人工審核）

---

## 使用流程

### 申請信用卡
```javascript
// 1. 確保有足夠的 NTD_TOKEN 餘額
const balance = await ntdToken.balanceOf(userAddress);
console.log("NTD 餘額:", ethers.formatUnits(balance, 18));

// 2. 申請信用卡
const tx = await creditCardContract.applyForCard(
  "USER001",                              // 用戶 ID
  "walrus_blob_id_for_card_style"        // 卡片樣式
);
await tx.wait();
console.log("信用卡申請成功！");

// 3. 查詢信用額度
const creditInfo = await creditCardContract.getCreditInfo(userAddress);
console.log("信用額度:", ethers.formatUnits(creditInfo.limit, 18));
console.log("可用額度:", ethers.formatUnits(creditInfo.available, 18));
```

### 刷卡消費（管理員操作）
```javascript
// 用戶在商家消費
const tx = await creditCardContract.spend(
  userAddress,           // 消費用戶
  merchantAddress,       // 商家地址
  ethers.parseUnits("1000", 18)  // 消費金額：1000 NTD
);
await tx.wait();
console.log("消費成功！");
```

### 還款（管理員操作）
```javascript
// 1. 用戶需要先 approve
await ntdToken.approve(
  creditCardContractAddress,
  ethers.parseUnits("500", 18)
);

// 2. 管理員執行還款
const tx = await creditCardContract.repay(
  userAddress,
  ethers.parseUnits("500", 18)  // 還款金額：500 NTD
);
await tx.wait();
console.log("還款成功！");
```

---

## 事件

### CardApplied
```solidity
event CardApplied(
    address indexed user,
    string userId,
    uint256 creditLimit,
    string cardStyle,
    uint256 timestamp
);
```
當用戶申請信用卡時觸發。

### CardApproved
```solidity
event CardApproved(
    address indexed user,
    uint256 applicationIndex,
    uint256 creditLimit,
    uint256 timestamp
);
```
當信用卡申請被核准時觸發。

### Spent
```solidity
event Spent(
    address indexed user,
    address indexed merchant,
    uint256 amount,
    uint256 timestamp
);
```
當用戶刷卡消費時觸發。

### Repaid
```solidity
event Repaid(
    address indexed user,
    uint256 amount,
    uint256 remainingBalance,
    uint256 timestamp
);
```
當用戶還款時觸發。

---

## 安全特性

- ✅ **額度控管**：自動檢查消費是否超過信用額度
- ✅ **權限管理**：敏感操作僅限管理員執行
- ✅ **餘額驗證**：確保合約有足夠的 NTD_TOKEN 支付商家
- ✅ **狀態追蹤**：完整記錄申請、消費、還款歷史
- ✅ **緊急提款**：管理員可在緊急情況下提取資金

---

## 合約部署

```javascript
// 部署 CreditCard 合約
const CreditCard = await ethers.getContractFactory("CreditCard");
const creditCard = await CreditCard.deploy(
  ntdTokenAddress,      // NTD_TOKEN 合約地址
  bankAdminAddress      // 銀行管理員地址
);
await creditCard.waitForDeployment();
console.log("CreditCard deployed to:", await creditCard.getAddress());
```

---

## 與其他合約的關係

```
┌──────────────┐
│  NTD_TOKEN   │ ← 代幣合約（支付媒介）
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ CreditCard   │ ← 信用卡合約（本合約）
└──────────────┘
```

- **依賴 NTD_TOKEN**：所有支付和還款都使用 NTD_TOKEN
- **查詢餘額**：計算信用額度時讀取用戶的 NTD 餘額
- **轉帳功能**：消費時轉給商家、還款時收取用戶資金

---

## 注意事項

1. **合約需要 NTD_TOKEN 餘額**
   - 合約需要持有足夠的 NTD_TOKEN 才能代墊款項給商家
   - 建議定期監控合約餘額

2. **還款前需要 approve**
   - 用戶還款前必須先 approve 合約使用其 NTD_TOKEN

3. **信用額度基於餘額**
   - 信用額度是根據即時的 NTD 餘額計算
   - 餘額變動會影響可申請的額度

4. **管理員權限**
   - `spend` 和 `repay` 僅限管理員調用
   - 建議使用多重簽名錢包作為管理員地址

---

## License

MIT License
