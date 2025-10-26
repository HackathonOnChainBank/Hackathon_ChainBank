// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { DisasterReliefFund } from "../src/DisasterReliefFund.sol";
import { BaseScript } from "./Base.s.sol";
import { CountryCodes } from "@selfxyz/contracts/contracts/libraries/CountryCode.sol";
import { console } from "forge-std/console.sol";
import { SelfUtils } from "@selfxyz/contracts/contracts/libraries/SelfUtils.sol";

/// @title DeployDisasterReliefFund
/// @notice Deployment script for ProofOfHuman contract using standard deployment
contract DeployDisasterReliefFund is BaseScript {
    // Custom errors for deployment verification
    error DeploymentFailed();

    /// @notice Main deployment function using standard deployment
    /// @return fund The deployed DisasterReliefFund contract instance
    /// @dev Requires the following environment variables:
    ///      - IDENTITY_VERIFICATION_HUB_ADDRESS: Address of the Self Protocol verification hub
    ///      - SCOPE_SEED: Scope seed value (defaults to "self-workshop")

    function run() public broadcast returns (DisasterReliefFund fund) {
        address hubAddress = vm.envAddress("IDENTITY_VERIFICATION_HUB_ADDRESS");
        string memory scopeSeed = vm.envString("SCOPE_SEED");
        address token = vm.envAddress("NTD_TOKEN");
        uint256 bounty = vm.envUint("BOUNTY_AMOUNT");

        string[] memory forbiddenCountries = new string[](1);
        forbiddenCountries[0] = CountryCodes.UNITED_STATES;

        SelfUtils.UnformattedVerificationConfigV2 memory verificationConfig = SelfUtils.UnformattedVerificationConfigV2({
            olderThan: 18,
            forbiddenCountries: forbiddenCountries,
            ofacEnabled: false
        });

        // Deploy the contract using SCOPE_SEED from environment
        fund = new DisasterReliefFund(hubAddress, scopeSeed, token, bounty, verificationConfig);

        // Log deployment information
        console.log("DisasterReliefFund deployed to:", address(fund));
        console.log("Identity Verification Hub:", hubAddress);

        // Verify deployment was successful
        if (address(fund) == address(0)) revert DeploymentFailed();

        console.log("Deployment verification completed successfully!");
        console.log("Scope seed used:", scopeSeed);
    }
}
