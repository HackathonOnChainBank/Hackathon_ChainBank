// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {NTD_TOKEN} from "./NTD_TOKEN.sol";

/**
 * @title CreditCard
 * @dev 整合信用卡申請、消費、還款的完整合約
 */
contract CreditCard {
    NTD_TOKEN public ntdToken;
    address public bankAdmin;

    // 信用卡申請記錄
    struct CardApplication {
        string userId;              // 用戶 ID
        uint256 creditLimit;        // 核准額度
        string cardStyle;           // 卡片樣式 (Walrus Blob ID)
        uint256 applicationTime;    // 申請時間
        bool approved;              // 是否已核准
        uint256 approvedTime;       // 核准時間
    }

    // 信用卡使用資訊
    struct CreditInfo {
        uint256 limit;              // 信用卡總額度
        uint256 balance;            // 未還款累積金額（欠款）
        uint256 lastBillTime;       // 上次結帳時間
        bool hasCard;               // 是否已核卡
    }

    // 消費記錄
    struct SpendRecord {
        address merchant;           // 消費商家
        uint256 amount;             // 單筆消費金額
        uint256 timestamp;          // 消費時間
    }

    // 用戶地址 => 申請記錄列表
    mapping(address => CardApplication[]) public userApplications;
    
    // 用戶地址 => 信用卡資訊
    mapping(address => CreditInfo) public credits;
    
    // 用戶地址 => 消費記錄
    mapping(address => SpendRecord[]) public spendRecords;
    
    // 用戶地址 => 是否有已核准的卡片
    mapping(address => bool) public hasApprovedCard;

    // 事件
    event CardApplied(
        address indexed user,
        string userId,
        uint256 creditLimit,
        string cardStyle,
        uint256 timestamp
    );

    event CardApproved(
        address indexed user,
        uint256 applicationIndex,
        uint256 creditLimit,
        uint256 timestamp
    );

    event CreditLimitSet(
        address indexed user,
        uint256 newLimit,
        uint256 timestamp
    );

    event Spent(
        address indexed user,
        address indexed merchant,
        uint256 amount,
        uint256 timestamp
    );

    event Repaid(
        address indexed user,
        uint256 amount,
        uint256 remainingBalance,
        uint256 timestamp
    );

    constructor(address _ntdToken, address _bankAdmin) {
        ntdToken = NTD_TOKEN(_ntdToken);
        bankAdmin = _bankAdmin;
    }

    modifier onlyAdmin() {
        require(msg.sender == bankAdmin, "Only admin can call this");
        _;
    }

    /**
     * @dev 計算用戶的信用額度（基於 NTD_TOKEN 餘額）
     * 規則：
     * - 餘額 < 1000 NTD: 不符合申請資格
     * - 1000-5000 NTD: 額度 = 餘額 * 0.5
     * - 5000-10000 NTD: 額度 = 餘額 * 0.8
     * - 10000-50000 NTD: 額度 = 餘額 * 1.0
     * - > 50000 NTD: 額度 = 餘額 * 1.2 (最高 100000)
     */
    function calculateCreditLimit(address user) public view returns (uint256) {
        uint256 balance = ntdToken.balanceOf(user);
        uint256 decimals = ntdToken.decimals();
        uint256 balanceInNTD = balance / (10 ** decimals);

        if (balanceInNTD < 1000) {
            return 0; // 不符合申請資格
        } else if (balanceInNTD < 5000) {
            return balance * 50 / 100; // 0.5倍
        } else if (balanceInNTD < 10000) {
            return balance * 80 / 100; // 0.8倍
        } else if (balanceInNTD < 50000) {
            return balance; // 1.0倍
        } else {
            uint256 limit = balance * 120 / 100; // 1.2倍
            uint256 maxLimit = 100000 * (10 ** decimals); // 最高10萬
            return limit > maxLimit ? maxLimit : limit;
        }
    }

    /**
     * @dev 申請信用卡（自動審核通過並設定額度）
     * @param userId 用戶 ID
     * @param cardStyle 選擇的卡片樣式 (Walrus Blob ID)
     */
    function applyForCard(string memory userId, string memory cardStyle) external {
        uint256 creditLimit = calculateCreditLimit(msg.sender);
        require(creditLimit > 0, "Insufficient NTD balance to apply");

        // 創建申請記錄
        CardApplication memory newApplication = CardApplication({
            userId: userId,
            creditLimit: creditLimit,
            cardStyle: cardStyle,
            applicationTime: block.timestamp,
            approved: true,  // 自動審核通過
            approvedTime: block.timestamp
        });

        userApplications[msg.sender].push(newApplication);
        hasApprovedCard[msg.sender] = true;

        // 設定信用額度
        credits[msg.sender].limit = creditLimit;
        credits[msg.sender].hasCard = true;

        emit CardApplied(
            msg.sender,
            userId,
            creditLimit,
            cardStyle,
            block.timestamp
        );
        
        emit CardApproved(
            msg.sender, 
            userApplications[msg.sender].length - 1, 
            creditLimit,
            block.timestamp
        );

        emit CreditLimitSet(msg.sender, creditLimit, block.timestamp);
    }

    /**
     * @dev 管理員手動核准信用卡申請（如果需要人工審核）
     * @param user 用戶地址
     * @param applicationIndex 申請記錄索引
     */
    function approveCard(address user, uint256 applicationIndex) external onlyAdmin {
        require(applicationIndex < userApplications[user].length, "Invalid application index");
        require(!userApplications[user][applicationIndex].approved, "Already approved");

        CardApplication storage application = userApplications[user][applicationIndex];
        application.approved = true;
        application.approvedTime = block.timestamp;
        
        hasApprovedCard[user] = true;

        // 設定信用額度
        credits[user].limit = application.creditLimit;
        credits[user].hasCard = true;

        emit CardApproved(user, applicationIndex, application.creditLimit, block.timestamp);
        emit CreditLimitSet(user, application.creditLimit, block.timestamp);
    }

    /**
     * @dev 管理員設定/調整用戶信用額度
     * @param user 用戶地址
     * @param amount 新的信用額度
     */
    function setCreditLimit(address user, uint256 amount) external onlyAdmin {
        credits[user].limit = amount;
        if (amount > 0 && !credits[user].hasCard) {
            credits[user].hasCard = true;
        }
        emit CreditLimitSet(user, amount, block.timestamp);
    }

    /**
     * @dev 刷卡消費：合約直接先付款給商家，用戶累積欠款
     * @param user 消費用戶地址
     * @param merchant 商家地址
     * @param amount 消費金額
     */
    function spend(address user, address merchant, uint256 amount) external onlyAdmin {
        require(credits[user].hasCard, "User has no credit card");
        require(credits[user].balance + amount <= credits[user].limit, "Over credit limit");
        require(ntdToken.balanceOf(address(this)) >= amount, "Insufficient contract liquidity");

        // 增加用戶欠款
        credits[user].balance += amount;
        
        // 合約代墊款項給商家
        ntdToken.transfer(merchant, amount);
        
        // 記錄消費
        spendRecords[user].push(SpendRecord({
            merchant: merchant,
            amount: amount,
            timestamp: block.timestamp
        }));

        emit Spent(user, merchant, amount, block.timestamp);
    }

    /**
     * @dev 用戶還款，還款金額歸合約
     * @param user 用戶地址
     * @param amount 還款金額
     */
    function repay(address user, uint256 amount) external onlyAdmin {
        require(credits[user].balance >= amount, "Repay amount exceeds balance");
        
        // 減少用戶欠款
        credits[user].balance -= amount;
        
        // 用戶還款給合約（需要事先 approve）
        ntdToken.transferFrom(user, address(this), amount);

        emit Repaid(user, amount, credits[user].balance, block.timestamp);
    }

    /**
     * @dev 查詢用戶的所有申請記錄
     * @param user 用戶地址
     */
    function getUserApplications(address user) external view returns (CardApplication[] memory) {
        return userApplications[user];
    }

    /**
     * @dev 查詢用戶的最新申請記錄
     * @param user 用戶地址
     */
    function getLatestApplication(address user) external view returns (CardApplication memory) {
        require(userApplications[user].length > 0, "No applications found");
        return userApplications[user][userApplications[user].length - 1];
    }

    /**
     * @dev 查詢用戶申請記錄數量
     * @param user 用戶地址
     */
    function getApplicationCount(address user) external view returns (uint256) {
        return userApplications[user].length;
    }

    /**
     * @dev 查詢用戶所有消費記錄
     * @param user 用戶地址
     */
    function getSpendRecords(address user) external view returns (SpendRecord[] memory) {
        return spendRecords[user];
    }

    /**
     * @dev 查詢用戶信用卡資訊
     * @param user 用戶地址
     */
    function getCreditInfo(address user) external view returns (
        uint256 limit,
        uint256 balance,
        uint256 available,
        bool hasCard
    ) {
        CreditInfo memory info = credits[user];
        return (
            info.limit,
            info.balance,
            info.limit > info.balance ? info.limit - info.balance : 0,
            info.hasCard
        );
    }

    /**
     * @dev 更新管理員地址
     * @param newAdmin 新管理員地址
     */
    function updateAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Invalid address");
        bankAdmin = newAdmin;
    }

    /**
     * @dev 緊急提款功能（僅管理員）
     * @param amount 提款金額
     */
    function emergencyWithdraw(uint256 amount) external onlyAdmin {
        require(ntdToken.balanceOf(address(this)) >= amount, "Insufficient balance");
        ntdToken.transfer(bankAdmin, amount);
    }
}
