// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;


import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { SelfVerificationRoot } from "@selfxyz/contracts/contracts/abstract/SelfVerificationRoot.sol";
import { ISelfVerificationRoot } from "@selfxyz/contracts/contracts/interfaces/ISelfVerificationRoot.sol";
import { SelfStructs } from "@selfxyz/contracts/contracts/libraries/SelfStructs.sol";
import { SelfUtils } from "@selfxyz/contracts/contracts/libraries/SelfUtils.sol";
import { IIdentityVerificationHubV2 } from "@selfxyz/contracts/contracts/interfaces/IIdentityVerificationHubV2.sol";
import "./interface/IERC20.sol";

/**
 * @title TestSelfVerificationRoot
 * @notice Test implementation of SelfVerificationRoot for testing purposes
 * @dev This contract provides a concrete implementation of the abstract SelfVerificationRoot
 */
contract DisasterReliefFund is SelfVerificationRoot, Ownable {

    //用於bounty 的 ERC20 代幣
    IERC20 public immutable NTD_TOKEN;

    // bounty per eligible recipient
    uint256 public bountyAmount;

    // record of used nullifiers (prevents double claims)
    mapping(uint256 => bool) public hasClaimed;

    // Storage for testing purposes
    bool public verificationSuccessful;
    ISelfVerificationRoot.GenericDiscloseOutputV2 public lastOutput;
    bytes public lastUserData;
    SelfStructs.VerificationConfigV2 public verificationConfig;
    bytes32 public verificationConfigId;
    address public lastUserAddress;

    // Events for testing
    event VerificationCompleted(ISelfVerificationRoot.GenericDiscloseOutputV2 output, bytes userData);
    event BountyPaid(address indexed to, uint256 amount, uint256 nullifier);
    event BountyAmountUpdated(uint256 oldAmount, uint256 newAmount);
    event VerificationConfigIdUpdated(bytes32 oldId, bytes32 newId);

    error AlreadyClaimed();

    /**
     * @notice Constructor for the test contract
     * @param identityVerificationHubV2Address The address of the Identity Verification Hub V2
     */
    constructor(
        address identityVerificationHubV2Address,
        string memory scope,
        address token,
        uint256 _bountyAmount,
        SelfUtils.UnformattedVerificationConfigV2 memory _verificationConfig
    )
        SelfVerificationRoot(identityVerificationHubV2Address, scope)
        Ownable(msg.sender)
    {
        verificationConfig = SelfUtils.formatVerificationConfigV2(_verificationConfig);
        verificationConfigId = IIdentityVerificationHubV2(identityVerificationHubV2Address).setVerificationConfigV2(verificationConfig);
        NTD_TOKEN = IERC20(token);
        bountyAmount = _bountyAmount;
    }

    // Owner can update bounty amount
    function setBountyAmount(uint256 newAmount) external onlyOwner {
        uint256 old = bountyAmount;
        bountyAmount = newAmount;
        emit BountyAmountUpdated(old, newAmount);
    }
    // Owner 可以指定bounty 匯入哪個錢包地址
    function withdrawToken(address to, uint256 amount) external onlyOwner {
        NTD_TOKEN.transfer(to, amount);
    }
    /**
     * @notice Implementation of customVerificationHook for testing
     * @dev This function is called by onVerificationSuccess after hub address validation
     * @param output The verification output from the hub
     * @param userData The user data passed through verification
     */

    function customVerificationHook(
        ISelfVerificationRoot.GenericDiscloseOutputV2 memory output,
        bytes memory userData
    )
        internal
        override
    {
        // record for tests/observability
        verificationSuccessful = true;
        lastOutput = output;
        lastUserData = userData;
        lastUserAddress = address(uint160(output.userIdentifier));

        if (hasClaimed[output.nullifier]) revert AlreadyClaimed();

        // mark claimed to prevent double claim
        hasClaimed[output.nullifier] = true;

        // recipient derived from userIdentifier's low 160 bits
        address recipient = address(uint160(output.userIdentifier));

        // transfer bounty (assumes token follows ERC20 semantics)
        NTD_TOKEN.transfer(recipient, bountyAmount);

        emit BountyPaid(recipient, bountyAmount, output.nullifier);
        emit VerificationCompleted(output, userData);
    }


    function setConfigId(bytes32 configId) external {
        verificationConfigId = configId;
    }

    function getConfigId(
        bytes32, /* destinationChainId */
        bytes32, /* userIdentifier */
        bytes memory /* userDefinedData */
    )
        public
        view
        override
        returns (bytes32)
    {
        return verificationConfigId;
    }
}
