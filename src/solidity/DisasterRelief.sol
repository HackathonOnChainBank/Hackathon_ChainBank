// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title DisasterRelief
 * @notice 災難救助金發放合約 (使用 NTD_TOKEN)
 * @dev 管理救助金發放，追蹤領取記錄，防止重複領取
 */
contract DisasterRelief is Ownable, ReentrancyGuard {
    
    IERC20 public immutable NTD_TOKEN;
    
    // 救助金計劃結構
    struct ReliefProgram {
        string name;                    // 計劃名稱
        uint256 totalBudget;           // 總預算
        uint256 amountPerPerson;       // 每人可領取金額
        uint256 totalDistributed;      // 已發放總額
        uint256 recipientCount;        // 已領取人數
        bool isActive;                 // 是否啟用
        mapping(address => bool) hasClaimed; // 已領取記錄
    }
    
    // 計劃 ID => 計劃資料
    mapping(uint256 => ReliefProgram) public reliefPrograms;
    uint256 public programCounter;
    
    // Events
    event ProgramCreated(
        uint256 indexed programId,
        string name,
        uint256 totalBudget,
        uint256 amountPerPerson
    );
    
    event ReliefClaimed(
        uint256 indexed programId,
        address indexed recipient,
        uint256 amount,
        uint256 timestamp
    );
    
    event ProgramClosed(
        uint256 indexed programId,
        uint256 totalDistributed,
        uint256 recipientCount
    );
    
    event ProgramBudgetIncreased(
        uint256 indexed programId,
        uint256 additionalAmount,
        uint256 newTotalBudget
    );
    
    // Errors
    error ProgramNotActive();
    error BudgetExceeded();
    error AlreadyClaimed();
    error InsufficientContractBalance();
    error InvalidAmount();
    error ProgramNotFound();
    error TransferFailed();
    
    constructor(address ntdTokenAddress) Ownable(msg.sender) {
        require(ntdTokenAddress != address(0), "Invalid NTD token address");
        NTD_TOKEN = IERC20(ntdTokenAddress);
    }
    
    /**
     * @notice 創建新的救助金計劃
     * @param name 計劃名稱
     * @param totalBudget 總預算（以 wei 為單位）
     * @param amountPerPerson 每人可領取金額
     */
    function createProgram(
        string memory name,
        uint256 totalBudget,
        uint256 amountPerPerson
    ) external onlyOwner returns (uint256) {
        if (totalBudget == 0 || amountPerPerson == 0) revert InvalidAmount();
        if (amountPerPerson > totalBudget) revert InvalidAmount();
        
        uint256 programId = programCounter++;
        ReliefProgram storage program = reliefPrograms[programId];
        
        program.name = name;
        program.totalBudget = totalBudget;
        program.amountPerPerson = amountPerPerson;
        program.isActive = true;
        
        emit ProgramCreated(programId, name, totalBudget, amountPerPerson);
        
        return programId;
    }
    
    /**
     * @notice 領取救助金
     * @param programId 計劃 ID
     */
    function claimRelief(uint256 programId) external nonReentrant {
        ReliefProgram storage program = reliefPrograms[programId];
        
        // 檢查計劃是否存在且啟用
        if (!program.isActive) revert ProgramNotActive();
        
        // 檢查是否已領取
        if (program.hasClaimed[msg.sender]) revert AlreadyClaimed();
        
        // 檢查預算是否足夠
        uint256 newTotal = program.totalDistributed + program.amountPerPerson;
        if (newTotal > program.totalBudget) revert BudgetExceeded();
        
        // 檢查合約 NTD_TOKEN 餘額是否足夠
        if (NTD_TOKEN.balanceOf(address(this)) < program.amountPerPerson) {
            revert InsufficientContractBalance();
        }
        
        // 更新狀態
        program.hasClaimed[msg.sender] = true;
        program.totalDistributed = newTotal;
        program.recipientCount++;
        
        // 轉帳 NTD_TOKEN
        bool success = NTD_TOKEN.transfer(msg.sender, program.amountPerPerson);
        if (!success) revert TransferFailed();
        
        emit ReliefClaimed(programId, msg.sender, program.amountPerPerson, block.timestamp);
        
        // 如果預算用完，自動關閉計劃
        if (program.totalDistributed == program.totalBudget) {
            program.isActive = false;
            emit ProgramClosed(programId, program.totalDistributed, program.recipientCount);
        }
    }
    
    /**
     * @notice 檢查地址是否已領取
     * @param programId 計劃 ID
     * @param user 用戶地址
     */
    function hasClaimed(uint256 programId, address user) external view returns (bool) {
        return reliefPrograms[programId].hasClaimed[user];
    }
    
    /**
     * @notice 獲取計劃資訊
     * @param programId 計劃 ID
     */
    function getProgramInfo(uint256 programId) external view returns (
        string memory name,
        uint256 totalBudget,
        uint256 amountPerPerson,
        uint256 totalDistributed,
        uint256 recipientCount,
        uint256 remainingBudget,
        bool isActive
    ) {
        ReliefProgram storage program = reliefPrograms[programId];
        return (
            program.name,
            program.totalBudget,
            program.amountPerPerson,
            program.totalDistributed,
            program.recipientCount,
            program.totalBudget - program.totalDistributed,
            program.isActive
        );
    }
    
    /**
     * @notice 增加計劃預算
     * @param programId 計劃 ID
     * @param additionalBudget 額外預算
     */
    function increaseBudget(uint256 programId, uint256 additionalBudget) 
        external 
        onlyOwner 
    {
        if (additionalBudget == 0) revert InvalidAmount();
        
        ReliefProgram storage program = reliefPrograms[programId];
        program.totalBudget += additionalBudget;
        
        // 如果計劃之前因預算用完而關閉，重新啟用
        if (!program.isActive && program.totalDistributed < program.totalBudget) {
            program.isActive = true;
        }
        
        emit ProgramBudgetIncreased(programId, additionalBudget, program.totalBudget);
    }
    
    /**
     * @notice 關閉計劃
     * @param programId 計劃 ID
     */
    function closeProgram(uint256 programId) external onlyOwner {
        ReliefProgram storage program = reliefPrograms[programId];
        
        if (!program.isActive) revert ProgramNotActive();
        
        program.isActive = false;
        
        emit ProgramClosed(programId, program.totalDistributed, program.recipientCount);
    }
    
    /**
     * @notice 重新啟用計劃
     * @param programId 計劃 ID
     */
    function reopenProgram(uint256 programId) external onlyOwner {
        ReliefProgram storage program = reliefPrograms[programId];
        
        if (program.totalBudget == 0) revert ProgramNotFound();
        if (program.totalDistributed >= program.totalBudget) revert BudgetExceeded();
        
        program.isActive = true;
    }
    
    /**
     * @notice 充值合約 NTD_TOKEN（用於發放救助金）
     * @param amount 充值金額
     */
    function deposit(uint256 amount) external onlyOwner {
        require(amount > 0, "Deposit amount must be greater than 0");
        bool success = NTD_TOKEN.transferFrom(msg.sender, address(this), amount);
        if (!success) revert TransferFailed();
    }
    
    /**
     * @notice 提取合約剩餘 NTD_TOKEN
     * @param amount 提取金額
     */
    function withdraw(uint256 amount) external onlyOwner {
        require(amount <= NTD_TOKEN.balanceOf(address(this)), "Insufficient balance");
        
        bool success = NTD_TOKEN.transfer(msg.sender, amount);
        if (!success) revert TransferFailed();
    }
    
    /**
     * @notice 獲取合約 NTD_TOKEN 餘額
     */
    function getContractBalance() external view returns (uint256) {
        return NTD_TOKEN.balanceOf(address(this));
    }
    
    /**
     * @notice 獲取 NTD_TOKEN 地址
     */
    function getNTDTokenAddress() external view returns (address) {
        return address(NTD_TOKEN);
    }
    
    /**
     * @notice 批量檢查地址是否已領取
     * @param programId 計劃 ID
     * @param users 用戶地址列表
     */
    function batchCheckClaimed(uint256 programId, address[] calldata users) 
        external 
        view 
        returns (bool[] memory) 
    {
        bool[] memory results = new bool[](users.length);
        ReliefProgram storage program = reliefPrograms[programId];
        
        for (uint256 i = 0; i < users.length; i++) {
            results[i] = program.hasClaimed[users[i]];
        }
        
        return results;
    }
}
