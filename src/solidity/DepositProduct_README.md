# DepositProduct 智能合約說明

## 概述

`DepositProduct.sol` 是 ChainBank 的存款產品智能合約，提供**定期存款**和**活期存款**兩種儲蓄服務。

---

## 主要功能

### 1. 定期存款 (Fixed Deposit)
- **固定期限**：設定存款期限（以秒為單位）
- **固定利率**：利率以萬分比表示（如 100 = 1%/年）
- **到期領取**：只能在到期後才能提領本金+利息
- **利息計算**：按實際持有時間計算利息

### 2. 活期存款 (Savings Account)
- **隨時領取**：不限制提領時間
- **定期派息**：銀行定期空投利息給用戶
- **批量處理**：支援批量派息，提高效率

---

## 資料結構

### DepositInfo（定存資訊）
```solidity
struct DepositInfo {
    uint256 amount;        // 定存本金
    uint256 startTime;     // 定存起始時間（timestamp）
    uint256 period;        // 到期時間（秒）
    uint256 interestRate;  // 利率（萬分比，如 100 = 1%/年）
    bool withdrawn;        // 是否已提領
}
```

---

## 主要函數

### 定期存款函數

#### `createDeposit(address user, uint256 amount, uint256 period, uint256 interestRate)`
創建定期存款（僅銀行管理員）
- **參數**：
  - `user`: 用戶地址
  - `amount`: 存款金額（需預先 approve）
  - `period`: 存款期限（秒）
  - `interestRate`: 年利率（萬分比，100 = 1%）
- **流程**：
  1. 從用戶轉帳 NTD_TOKEN 到合約
  2. 記錄定存資訊
  3. 首次存款自動註冊為定存用戶

#### `withdrawDeposit(address user, uint256 depositId)`
提領單筆定期存款（僅銀行管理員）
- **要求**：必須到期才能提領
- **計算**：利息 = 本金 × 利率 × 持有時間 / 年秒數
- **發放**：本金 + 利息一起轉給用戶

#### `batchWithdrawDeposit(address[] addresses, uint256[] depositIds)`
批量提領定期存款（僅銀行管理員）
- **流程**：遍歷所有到期的定存並自動提領

### 活期存款函數

#### `sendInterest(address user, uint256 amount)`
單筆派發活期利息（僅銀行管理員）
- **參數**：
  - `user`: 用戶地址
  - `amount`: 利息金額
- **流程**：合約轉帳利息給用戶，更新最後領息時間

#### `sendInterestBatch(address[] addresses, uint256[] amounts)`
批量派發活期利息（僅銀行管理員）
- **優勢**：一次交易處理多個用戶的利息派發

### 查詢函數

#### `getUserDeposits(address user)`
查詢用戶的所有定存記錄（僅銀行管理員）
- **返回**：DepositInfo 陣列

#### `getAllUsers()`
查詢所有定存用戶列表（僅銀行管理員）
- **返回**：用戶地址陣列

#### `getAllActiveDeposits()`
查詢所有未提領的定存（僅銀行管理員）
- **返回**：用戶地址陣列 + 定存 ID 陣列

#### `getAllExpiredDeposits()`
查詢所有已到期但未提領的定存（僅銀行管理員）
- **用途**：方便銀行主動通知用戶或執行批量提領

---

## 利息計算公式

### 定期存款利息
```
利息 = (本金 × 利率 × 持有時間) / 31,536,000

其中：
- 利率：萬分比（如 100 = 1%）
- 持有時間：秒
- 31,536,000：一年的秒數 (365 天)
```

**範例：**
```
本金：10,000 NTD
年利率：2% (interestRate = 200)
持有時間：180 天 (15,552,000 秒)

利息 = (10,000 × 200 × 15,552,000) / 31,536,000
     = 985.48 NTD
```

---

## 使用流程

### 創建定期存款

```javascript
// 1. 用戶 approve 合約使用 NTD_TOKEN
await ntdToken.approve(
  depositContractAddress,
  ethers.parseUnits("10000", 18)  // 10,000 NTD
);

// 2. 銀行創建定存
const period = 365 * 24 * 60 * 60;  // 1 年（秒）
const interestRate = 200;            // 2% 年利率

const tx = await depositContract.createDeposit(
  userAddress,
  ethers.parseUnits("10000", 18),  // 本金
  period,
  interestRate
);
await tx.wait();
console.log("定期存款創建成功！");
```

### 查詢定存狀態

```javascript
// 查詢用戶的所有定存
const deposits = await depositContract.getUserDeposits(userAddress);

deposits.forEach((deposit, index) => {
  console.log(`定存 #${index}:`);
  console.log("  本金:", ethers.formatUnits(deposit.amount, 18), "NTD");
  console.log("  年利率:", deposit.interestRate / 100, "%");
  console.log("  開始時間:", new Date(Number(deposit.startTime) * 1000));
  console.log("  期限:", deposit.period / (24 * 60 * 60), "天");
  console.log("  是否已提領:", deposit.withdrawn);
});
```

### 提領到期定存

```javascript
// 銀行執行提領
const tx = await depositContract.withdrawDeposit(
  userAddress,
  0  // 定存 ID
);
await tx.wait();
console.log("定存已提領（本金+利息）");
```

### 派發活期利息

```javascript
// 單筆派息
const tx = await depositContract.sendInterest(
  userAddress,
  ethers.parseUnits("50", 18)  // 50 NTD 利息
);
await tx.wait();

// 批量派息
const users = [user1, user2, user3];
const amounts = [
  ethers.parseUnits("50", 18),
  ethers.parseUnits("30", 18),
  ethers.parseUnits("20", 18)
];

const tx = await depositContract.sendInterestBatch(users, amounts);
await tx.wait();
console.log("批量派息完成！");
```

---

## 查詢到期定存

```javascript
// 查詢所有到期定存
const [addresses, depositIds] = await depositContract.getAllExpiredDeposits();

console.log("到期定存：");
for (let i = 0; i < addresses.length; i++) {
  console.log(`用戶: ${addresses[i]}, 定存ID: ${depositIds[i]}`);
}

// 批量提領所有到期定存
if (addresses.length > 0) {
  const tx = await depositContract.batchWithdrawDeposit(addresses, depositIds);
  await tx.wait();
  console.log(`已批量提領 ${addresses.length} 筆定存`);
}
```

---

## 定存期限範例

```javascript
// 常見定存期限（秒）
const periods = {
  "1個月": 30 * 24 * 60 * 60,
  "3個月": 90 * 24 * 60 * 60,
  "6個月": 180 * 24 * 60 * 60,
  "1年": 365 * 24 * 60 * 60,
  "2年": 730 * 24 * 60 * 60,
  "3年": 1095 * 24 * 60 * 60
};

// 使用範例
await depositContract.createDeposit(
  userAddress,
  amount,
  periods["1年"],
  200  // 2% 年利率
);
```

---

## 利率設定範例

```javascript
// 利率換算（萬分比）
const interestRates = {
  "0.5%": 50,
  "1.0%": 100,
  "1.5%": 150,
  "2.0%": 200,
  "2.5%": 250,
  "3.0%": 300
};

// 使用範例
await depositContract.createDeposit(
  userAddress,
  amount,
  period,
  interestRates["2.0%"]
);
```

---

## 安全特性

- ✅ **權限控管**：所有操作僅限銀行管理員執行
- ✅ **到期檢查**：定存必須到期才能提領
- ✅ **餘額驗證**：確保合約有足夠的 NTD_TOKEN 支付利息
- ✅ **狀態追蹤**：記錄每筆定存的提領狀態，防止重複提領
- ✅ **批量處理**：支援批量操作，提高 gas 效率

---

## 合約部署

```javascript
// 部署 DepositProduct 合約
const DepositProduct = await ethers.getContractFactory("DepositProduct");
const depositProduct = await DepositProduct.deploy(
  ntdTokenAddress,      // NTD_TOKEN 合約地址
  bankAdminAddress      // 銀行管理員地址
);
await depositProduct.waitForDeployment();
console.log("DepositProduct deployed to:", await depositProduct.getAddress());
```

---

## 與其他合約的關係

```
┌──────────────┐
│  NTD_TOKEN   │ ← 代幣合約（存款媒介）
└──────┬───────┘
       │
       ↓
┌──────────────┐
│DepositProduct│ ← 存款產品合約（本合約）
└──────────────┘
```

- **依賴 NTD_TOKEN**：所有存款和利息派發都使用 NTD_TOKEN
- **存入資金**：用戶存款時將 NTD 轉入合約
- **支付利息**：到期或派息時從合約轉出 NTD

---

## 注意事項

1. **合約需要充足的 NTD_TOKEN**
   - 合約必須持有足夠的 NTD 才能支付本金和利息
   - 建議銀行定期充值合約

2. **存款前需要 approve**
   - 用戶創建定存前必須先 approve 合約使用其 NTD_TOKEN

3. **時間以秒為單位**
   - 前端應先將日期轉換為 timestamp（秒）再傳入合約

4. **利率為萬分比**
   - 1% = 100
   - 2.5% = 250
   - 0.5% = 50

5. **定存不可提前解約**
   - 目前版本不支援提前解約功能
   - 必須到期才能提領

---

## License

MIT License
