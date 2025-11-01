// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {NTD_TOKEN} from "./NTD_TOKEN.sol";

/**
 * @title CreditCardRegistry
 * @dev 信用卡申請註冊合約，記錄用戶申請的信用卡信息
 */
contract CreditCardRegistry {
    NTD_TOKEN public ntdToken;
    address public admin;

    struct CardApplication {
        string userId;              // 用戶 ID
        uint256 creditLimit;        // 核准額度
        string cardStyle;           // 卡片樣式 (Walrus Blob ID)
        uint256 applicationTime;    // 申請時間
        bool approved;              // 是否已核准
        uint256 approvedTime;       // 核准時間
    }

    // 用戶地址 => 申請記錄列表
    mapping(address => CardApplication[]) public userApplications;
    
    // 用戶地址 => 是否有已核准的卡片
    mapping(address => bool) public hasApprovedCard;

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
        uint256 timestamp
    );

    constructor(address _ntdToken, address _admin) {
        ntdToken = NTD_TOKEN(_ntdToken);
        admin = _admin;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this");
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
     * @dev 申請信用卡（自動審核通過）
     * @param userId 用戶 ID
     * @param cardStyle 選擇的卡片樣式 (Walrus Blob ID)
     */
    function applyForCard(string memory userId, string memory cardStyle) external {
        uint256 creditLimit = calculateCreditLimit(msg.sender);
        require(creditLimit > 0, "Insufficient NTD balance to apply");

        CardApplication memory newApplication = CardApplication({
            userId: userId,
            creditLimit: creditLimit,
            cardStyle: cardStyle,
            applicationTime: block.timestamp,
            approved: true,  // 自動審核通過
            approvedTime: block.timestamp  // 設定審核時間為申請時間
        });

        userApplications[msg.sender].push(newApplication);
        hasApprovedCard[msg.sender] = true;  // 標記用戶已有核准的卡片

        emit CardApplied(
            msg.sender,
            userId,
            creditLimit,
            cardStyle,
            block.timestamp
        );
        
        // 發出審核通過事件
        emit CardApproved(msg.sender, userApplications[msg.sender].length - 1, block.timestamp);
    }

    /**
     * @dev 管理員核准信用卡申請
     * @param user 用戶地址
     * @param applicationIndex 申請記錄索引
     */
    function approveCard(address user, uint256 applicationIndex) external onlyAdmin {
        require(applicationIndex < userApplications[user].length, "Invalid application index");
        require(!userApplications[user][applicationIndex].approved, "Already approved");

        userApplications[user][applicationIndex].approved = true;
        userApplications[user][applicationIndex].approvedTime = block.timestamp;
        hasApprovedCard[user] = true;

        emit CardApproved(user, applicationIndex, block.timestamp);
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
     * @dev 更新管理員地址
     * @param newAdmin 新管理員地址
     */
    function updateAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Invalid address");
        admin = newAdmin;
    }
}
