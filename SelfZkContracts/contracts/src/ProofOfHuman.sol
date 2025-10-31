// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

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
contract ProofOfHuman is SelfVerificationRoot {
    // Storage for testing purposes
    bool public verificationSuccessful;
    ISelfVerificationRoot.GenericDiscloseOutputV2 public lastOutput;
    bytes public lastUserData;
    SelfStructs.VerificationConfigV2 public verificationConfig;
    bytes32 public verificationConfigId;
    address public lastUserAddress;
    IERC20 public immutable NTD_TOKEN;
    // Events for testing
    event VerificationCompleted(ISelfVerificationRoot.GenericDiscloseOutputV2 output, bytes userData);
    event RewardSent(address indexed user, uint256 amount);

    /**
     * @notice Constructor for the test contract
     * @param identityVerificationHubV2Address The address of the Identity Verification Hub V2
     * @param scope The verification scope
     * @param ntdTokenAddress The address of the NTD Token contract
     */
    constructor(
        address identityVerificationHubV2Address,
        string memory scope,
        SelfUtils.UnformattedVerificationConfigV2 memory _verificationConfig,
        address ntdTokenAddress
    )
        SelfVerificationRoot(identityVerificationHubV2Address, scope)
    {
        require(ntdTokenAddress != address(0), "Invalid NTD Token address");
        NTD_TOKEN = IERC20(ntdTokenAddress);
        
        verificationConfig = SelfUtils.formatVerificationConfigV2(_verificationConfig);
        verificationConfigId =
            IIdentityVerificationHubV2(identityVerificationHubV2Address).setVerificationConfigV2(verificationConfig);
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
        verificationSuccessful = true;
        lastOutput = output;
        lastUserData = userData;
        lastUserAddress = address(uint160(output.userIdentifier));

        // 發放 100 NTD Token 獎勵給通過驗證的用戶
        uint8 decimals = NTD_TOKEN.decimals();
        uint256 rewardAmount = 100 * (10 ** decimals);
        NTD_TOKEN.mint(lastUserAddress, rewardAmount);

        emit VerificationCompleted(output, userData);
        emit RewardSent(lastUserAddress, rewardAmount);
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
