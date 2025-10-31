# NTD_TOKEN 智能合約說明

## 概述

`NTD_TOKEN.sol` 是 ChainBank 系統的核心代幣合約，代表「新台幣」(NTD) 的鏈上版本。這是一個具備訪問控制、可暫停、可銷毀的 ERC20 代幣。

---

## 主要功能

### 1. 基礎 ERC20 功能
- **轉帳**：用戶之間可以自由轉移 NTD_TOKEN
- **授權**：支援 approve/transferFrom 機制
- **餘額查詢**：查詢任意地址的代幣餘額

### 2. 訪問控制（Access Control）
- **角色管理**：採用基於角色的權限控制
  - `DEFAULT_ADMIN_ROLE`：超級管理員，可以授予/撤銷其他角色
  - `PAUSER_ROLE`：暫停者角色，可以暫停/恢復所有轉帳
  - `MINTER_ROLE`：鑄幣者角色，可以鑄造新代幣

### 3. 帳戶限制（Account Restriction）
- **封鎖帳戶**：管理員可以封鎖特定地址，禁止其轉入/轉出代幣
- **解除封鎖**：管理員可以解除帳戶封鎖
- **重置限制**：批量解除所有帳戶限制

### 4. 緊急暫停（Pausable）
- **全局暫停**：緊急情況下可以暫停所有代幣轉帳
- **恢復運行**：問題解決後恢復正常轉帳

### 5. 代幣銷毀（Burnable）
- **自主銷毀**：用戶可以銷毀自己的代幣
- **授權銷毀**：可以銷毀授權給自己的代幣

---

## 角色說明

### DEFAULT_ADMIN_ROLE（超級管理員）
- **權限**：
  - 授予/撤銷任何角色
  - 封鎖/解封帳戶
  - 重置帳戶限制
- **初始持有者**：合約部署者
- **用途**：最高權限，控制整個系統

### PAUSER_ROLE（暫停者）
- **權限**：
  - 暫停所有代幣轉帳 (`pause()`)
  - 恢復代幣轉帳 (`unpause()`)
- **用途**：應對緊急情況（如黑客攻擊、系統漏洞）

### MINTER_ROLE（鑄幣者）
- **權限**：
  - 鑄造新的 NTD_TOKEN (`mint()`)
- **用途**：增發代幣（如用戶充值、獎勵發放）

---

## 主要函數

### 管理員函數

#### `mint(address to, uint256 amount)`
鑄造新代幣（僅 MINTER_ROLE）
- **參數**：
  - `to`: 接收地址
  - `amount`: 鑄造數量（wei 單位）
- **要求**：調用者必須有 MINTER_ROLE

#### `pause()`
暫停所有代幣轉帳（僅 PAUSER_ROLE）
- **效果**：所有 transfer、transferFrom、mint、burn 都會失敗
- **用途**：緊急凍結

#### `unpause()`
恢復代幣轉帳（僅 PAUSER_ROLE）
- **效果**：解除暫停狀態，恢復正常運作

#### `blockAccount(address user)`
封鎖帳戶（僅 DEFAULT_ADMIN_ROLE）
- **效果**：該地址無法接收或轉出代幣
- **用途**：封鎖可疑或違規帳戶

#### `allowAccount(address user)`
解除帳戶封鎖（僅 DEFAULT_ADMIN_ROLE）
- **效果**：恢復該地址的正常轉帳功能

#### `resetAccountRestriction()`
重置所有帳戶限制（僅 DEFAULT_ADMIN_ROLE）
- **效果**：清除所有帳戶的封鎖狀態
- **用途**：系統升級或緊急解封

### 用戶函數

#### `transfer(address to, uint256 amount)`
轉帳代幣
- **檢查**：
  - 合約未暫停
  - 發送者/接收者未被封鎖
  - 發送者餘額充足

#### `burn(uint256 amount)`
銷毀自己的代幣
- **效果**：永久減少代幣總供應量

#### `burnFrom(address account, uint256 amount)`
銷毀授權給自己的代幣
- **要求**：對方已經 approve 給自己足夠額度

### 查詢函數

#### `balanceOf(address account)`
查詢餘額

#### `totalSupply()`
查詢代幣總供應量

#### `paused()`
查詢是否處於暫停狀態

#### `hasRole(bytes32 role, address account)`
查詢地址是否擁有特定角色
```javascript
// 範例
const hasMinterRole = await ntdToken.hasRole(
  await ntdToken.MINTER_ROLE(),
  userAddress
);
```

---


## 安全特性

### 1. 基於角色的訪問控制（RBAC）
- ✅ 使用 OpenZeppelin 的 AccessControl
- ✅ 最小權限原則：每個角色只有必要的權限
- ✅ 角色可以動態授予/撤銷

### 2. 暫停機制
- ✅ 緊急情況下可以凍結所有轉帳
- ✅ 防止黑客在漏洞修復前持續攻擊
- ✅ 僅影響轉帳，不影響查詢功能

### 3. 帳戶限制
- ✅ 可以封鎖違規或可疑帳戶
- ✅ 防止被盜帳戶的資金流出
- ✅ 支援批量解封（系統升級時）

### 4. 防重入（ReentrancyGuard）
- ✅ 雖然本合約未直接使用，但繼承自 ERC20Restricted
- ✅ 確保轉帳過程不會被重入攻擊

## 與其他合約的關係

```
┌──────────────┐
│  NTD_TOKEN   │ ← 核心代幣合約（本合約）
└──────┬───────┘
       │
       ├─────────→ CreditCard（信用卡消費與還款）
       │
       ├─────────→ DepositProduct（存款本金與利息）
       │
       ├─────────→ DisasterRelief（救助金發放）
       │
       └─────────→ 其他 ChainBank 合約
```

所有 ChainBank 系統的合約都依賴 NTD_TOKEN 作為基礎貨幣。

---