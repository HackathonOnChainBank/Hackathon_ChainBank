# Hackathon_OnChainBank

黑客松-銀行上鏈
---------------

## 必要套件安裝

```bash
npm install react react-dom
npm install vite
npm install react-router-dom
npm install @rainbow-me/rainbowkit wagmi viem@2.x @tanstack/react-query
npm install --save-dev @vitejs/plugin-react
```

## 其他開發工具（選用）

```bash
npm install --save-dev typescript @types/react @types/react-dom
npm install --save-dev eslint prettier
npm install @openzeppelin/contracts
```

## 套件用途簡述

| 套件名稱               | 用途                        |
| ---------------------- | --------------------------- |
| react, react-dom       | React 基礎                  |
| vite                   | 前端開發工具                |
| react-router-dom       | 頁面路由                    |
| @rainbow-me/rainbowkit | 錢包連接 UI                 |
| wagmi                  | Web3 錢包/合約互動          |
| viem@2.x               | wagmi 依賴                  |
| @tanstack/react-query  | wagmi 依賴 (資料快取)       |
| @vitejs/plugin-react   | Vite React 支援             |
| typescript, @types/*   | TypeScript 支援（如有需要） |
| eslint, prettier       | 程式碼檢查/格式化（選用）   |
|                        |

## 開發方式

```bash
Clone - https://github.com/HackathonOnChainBank/Hackathon_ChainBank.git
Branch
1. main - 主要分支
2. develop - 測試分支
```

```bash
分支規範
開發前請先基於develop 分支新建feature 分支，異動完後在到本地commit 確認無誤後在push 到develop
```
