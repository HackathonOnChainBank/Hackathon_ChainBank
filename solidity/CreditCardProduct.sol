// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {NTD_TOKEN} from "./NTD_TOKEN.sol";

contract CreditCardProduct {
    NTD_TOKEN public ntd;                           // NTD_TOKEN主合約
    address public bankAdmin;                       // 銀行管理員

    struct CreditInfo {
        uint256 limit;          // 信用卡總額度
        uint256 balance;        // 未還款累積金額（欠款）
        uint256 lastBillTime;   // 上次結帳時間
    }
    mapping(address => CreditInfo) public credits;

    struct SpendRecord {
        address merchant;       // 消費商家
        uint256 amount;         // 單筆消費金額
        uint256 timestamp;      // 消費時間
    }
    mapping(address => SpendRecord[]) public spendRecords;

    constructor(address _ntd, address _bankAdmin) {
        ntd = NTD_TOKEN(_ntd);
        bankAdmin = _bankAdmin;
    }

    // 設定用戶信用額度
    function setCreditLimit(address user, uint256 amount) external {
        require(msg.sender == bankAdmin, "Only bank");
        credits[user].limit = amount;
    }

    // 刷卡消費：合約直接先付款給商家，用戶累積欠款
    function spend(address user, address merchant, uint256 amount) external {
        require(msg.sender == bankAdmin, "Only bank");
        require(credits[user].balance + amount <= credits[user].limit, "Over limit");
        credits[user].balance += amount;
        require(ntd.balanceOf(address(this)) >= amount, "Insufficient contract liquidity");
        ntd.transfer(merchant, amount); // 合約直付給商家，模擬信用卡先墊付
        spendRecords[user].push(SpendRecord(merchant, amount, block.timestamp));
    }

    // 用戶還款，還款金額歸合約（可拓展手續費邏輯）
    function repay(address user, uint256 amount) external {
        require(msg.sender == bankAdmin, "Only bank");
        require(credits[user].balance >= amount, "Repay over balance");
        credits[user].balance -= amount;
        ntd.transferFrom(user, address(this), amount); // 用戶還款給合約
    }

    // 查詢用戶所有刷卡消費紀錄流水
    function getSpendRecords(address user) external view returns (SpendRecord[] memory) {
        return spendRecords[user];
    }
}
