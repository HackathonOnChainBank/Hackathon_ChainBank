// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {NTD_TOKEN} from "./NTD_TOKEN.sol";

contract DepositProduct {
    NTD_TOKEN public ntd;                                  // NTD_TOKEN主合約
    address public bankAdmin;                              // 銀行管理員帳號
    mapping(address => uint256) public lastWithdrawTime;   // 活存最後領息時間

    address[] public users; // 記錄所有有定存的user

    // ----------- 定存結構（利率萬分比）-----------
    struct DepositInfo {
        uint256 amount;        // 定存本金
        uint256 startTime;     // 定存起始時間（timestamp）
        uint256 period;        // 到期時間（秒）
        uint256 interestRate;  // 利率（萬分比，如 100 = 1%/年）
        bool withdrawn;        // 是否已提領
    }

    mapping(address => DepositInfo[]) public deposits;

    constructor(address _ntd, address _bankAdmin) {
        ntd = NTD_TOKEN(_ntd);
        bankAdmin = _bankAdmin;
    }

    // --- 定存：單筆建立（首度存款自動註冊user） ---
    function createDeposit(address user, uint256 amount, uint256 period, uint256 interestRate) external {
        require(msg.sender == bankAdmin, "Only bank");
        ntd.transferFrom(user, address(this), amount);
        deposits[user].push(DepositInfo(amount, block.timestamp, period, interestRate, false));
        if (deposits[user].length == 1) {
            users.push(user);
        }
    }

    // --- 查詢全部定存用戶列表（限銀行）---
    function getAllUsers() public view returns (address[] memory) {
        require(msg.sender == bankAdmin, "Only bank");
        return users;
    }

    // --- 查詢單用戶所有定存資料（限銀行）---
    function getUserDeposits(address user) public view returns (DepositInfo[] memory) {
        require(msg.sender == bankAdmin, "Only bank");
        return deposits[user];
    }

    // --- 查詢所有未提領定存 (非 withdrawn，限銀行) ---
    function getAllActiveDeposits() public view returns (address[] memory, uint256[] memory) {
        require(msg.sender == bankAdmin, "Only bank");
        uint256 totalNum = 0;
        for (uint i = 0; i < users.length; i++) {
            for (uint j = 0; j < deposits[users[i]].length; j++) {
                if (!deposits[users[i]][j].withdrawn) {
                    totalNum += 1;
                }
            }
        }
        address[] memory depositAddresses = new address[](totalNum);
        uint256[] memory depositIds = new uint256[](totalNum);
        uint256 idx = 0;
        for (uint i = 0; i < users.length; i++) {
            for (uint j = 0; j < deposits[users[i]].length; j++) {
                if (!deposits[users[i]][j].withdrawn) {
                    depositAddresses[idx] = users[i];
                    depositIds[idx] = j;
                    idx++;
                }
            }
        }
        return (depositAddresses, depositIds);
    }

    // --- 查詢所有到期未領定存（逾期，限銀行）---
    function getAllExpiredDeposits() public view returns (address[] memory, uint256[] memory) {
        require(msg.sender == bankAdmin, "Only bank");
        uint256 totalNum = 0;
        for (uint i = 0; i < users.length; i++) {
            for (uint j = 0; j < deposits[users[i]].length; j++) {
                DepositInfo memory di = deposits[users[i]][j];
                if (!di.withdrawn && block.timestamp >= di.startTime + di.period) {
                    totalNum += 1;
                }
            }
        }
        address[] memory depositAddresses = new address[](totalNum);
        uint256[] memory depositIds = new uint256[](totalNum);
        uint256 idx = 0;
        for (uint i = 0; i < users.length; i++) {
            for (uint j = 0; j < deposits[users[i]].length; j++) {
                DepositInfo memory di = deposits[users[i]][j];
                if (!di.withdrawn && block.timestamp >= di.startTime + di.period) {
                    depositAddresses[idx] = users[i];
                    depositIds[idx] = j;
                    idx++;
                }
            }
        }
        return (depositAddresses, depositIds);
    }

    // --- 定存：單筆領取（到期才可領，利息算持有到領取的時間） ---
    function withdrawDeposit(address user, uint256 depositId) external {
        require(msg.sender == bankAdmin, "Only bank");
        DepositInfo storage di = deposits[user][depositId];
        require(!di.withdrawn, "Already withdrawn");
        require(block.timestamp >= di.startTime + di.period, "Not yet due");
        uint256 heldTime = block.timestamp - di.startTime;
        uint256 interest = (di.amount * di.interestRate * heldTime) / 3153600000;
        require(ntd.balanceOf(address(this)) >= di.amount + interest, "Insufficient contract NTD balance");
        di.withdrawn = true;
        ntd.transfer(user, di.amount + interest);
    }

    // --- 定存：批量領取（到期才可領，利息按持有時間自動算） ---
    function batchWithdrawDeposit(address[] calldata addresses, uint256[] calldata depositIds) external {
        require(msg.sender == bankAdmin, "Only bank");
        require(addresses.length == depositIds.length, "Length mismatch");
        for (uint256 i = 0; i < addresses.length; i++) {
            address user = addresses[i];
            uint256 depositId = depositIds[i];
            DepositInfo storage di = deposits[user][depositId];
            if (!di.withdrawn && block.timestamp >= di.startTime + di.period) {
                uint256 heldTime = block.timestamp - di.startTime;
                uint256 interest = (di.amount * di.interestRate * heldTime) / 3153600000;
                if (ntd.balanceOf(address(this)) >= di.amount + interest) {
                    di.withdrawn = true;
                    ntd.transfer(user, di.amount + interest);
                }
            }
        }
    }

    // --- 活存：單筆空投活存息金 ---
    function sendInterest(address user, uint256 amount) external {
        require(msg.sender == bankAdmin, "Only bank/admin");
        require(amount > 0, "No interest to send");
        require(ntd.balanceOf(address(this)) >= amount, "Insufficient contract NTD balance");
        lastWithdrawTime[user] = block.timestamp;
        ntd.transfer(user, amount);
    }

    // --- 活存：批量空投活存息金 ---
    function sendInterestBatch(address[] calldata addresses, uint256[] calldata amounts) external {
        require(msg.sender == bankAdmin, "Only bank/admin");
        require(addresses.length == amounts.length, "Length mismatch");
        for (uint256 i = 0; i < addresses.length; i++) {
            address user = addresses[i];
            uint256 amount = amounts[i];
            if (amount > 0 && ntd.balanceOf(address(this)) >= amount) {
                lastWithdrawTime[user] = block.timestamp;
                ntd.transfer(user, amount);
            }
        }
    }
}
