// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Restricted} from "./ERC20Restricted.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {ERC20Pausable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";

contract NTD_TOKEN is ERC20Restricted, ERC20Burnable, ERC20Pausable, AccessControl {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor(address defaultAdmin, address pauser, address minter)
        ERC20("NTD_TOKEN", "NTD")
    {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(PAUSER_ROLE, pauser);
        _grantRole(MINTER_ROLE, minter);
    }

    // 銀行管理員可批次編輯帳戶管控
    function blockAccount(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _blockUser(account);
    }
    function allowAccount(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _allowUser(account);
    }
    function resetAccountRestriction(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _resetUser(account);
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    // Solidity要求覆寫多個父合約
    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Restricted, ERC20Pausable)
    {
        super._update(from, to, value);
    }

}
