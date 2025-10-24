// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {NTD_TOKEN} from "./NTD_TOKEN.sol";  // 或 IERC20

contract DepositProduct {
    NTD_TOKEN public ntd; // NTD_TOKEN主合約地址

    struct DepositInfo {
        uint256 amount;
        uint256 startTime;
        uint256 period; // 定存期
        uint256 interest; // 到期可得利息
        bool withdrawn;
    }
    mapping(address => DepositInfo[]) public deposits;

    address public bankAdmin;

    constructor(address _ntd, address _bankAdmin) {
        ntd = NTD_TOKEN(_ntd); // 代幣合約實例
        bankAdmin = _bankAdmin;
    }

    // 由銀行主控調用，代表用戶發起定存
    function createDeposit(address user, uint256 amount, uint256 period, uint256 interest) external {
        require(msg.sender == bankAdmin, "Only bank");
        // 銀行先在 NTD_TOKEN approve 本合約，這裡可以直接由銀行代為 transferFrom
        ntd.transferFrom(user, address(this), amount);
        deposits[user].push(DepositInfo(amount, block.timestamp, period, interest, false));
    }

    function withdrawDeposit(address user, uint256 depositId) external {
        require(msg.sender == bankAdmin, "Only bank");
        DepositInfo storage di = deposits[user][depositId];
        require(!di.withdrawn, "Already withdrawn");
        require(block.timestamp >= di.startTime + di.period, "Not yet due");
        di.withdrawn = true;
        ntd.transfer(user, di.amount + di.interest);
    }

    // 更多管理與查詢方法可隨需求擴充
}
