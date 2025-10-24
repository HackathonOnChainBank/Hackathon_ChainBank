// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {NTD_TOKEN} from "./NTD_TOKEN.sol";

contract CreditCardProduct {
    NTD_TOKEN public ntd;
    address public bankAdmin;

    struct CreditInfo {
        uint256 limit;
        uint256 balance;
        uint256 lastBillTime;
        uint256 interest;
    }
    mapping(address => CreditInfo) public credits;

    constructor(address _ntd, address _bankAdmin) {
        ntd = NTD_TOKEN(_ntd);
        bankAdmin = _bankAdmin;
    }

    function setCreditLimit(address user, uint256 amount) external {
        require(msg.sender == bankAdmin, "Only bank");
        credits[user].limit = amount;
    }

    function spend(address user, uint256 amount) external {
        require(msg.sender == bankAdmin, "Only bank");
        require(credits[user].balance + amount <= credits[user].limit, "Over limit");
        credits[user].balance += amount;
        // 銀行主控付款流程（如消費交易）
    }

    function repay(address user, uint256 amount) external {
        require(msg.sender == bankAdmin, "Only bank");
        require(credits[user].balance >= amount, "Repay over balance");
        credits[user].balance -= amount;
        ntd.transferFrom(user, bankAdmin, amount); // 實際資金流
    }

    // 可根據銀行業務擴充分期、罰息、活動通路等
}
