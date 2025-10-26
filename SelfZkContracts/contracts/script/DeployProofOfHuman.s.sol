// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { DisasterReliefFund } from "../src/DisasterReliefFund.sol";
import { BaseScript } from "./Base.s.sol";
import { CountryCodes } from "@selfxyz/contracts/contracts/libraries/CountryCode.sol";
import { console } from "forge-std/console.sol";
import { SelfUtils } from "@selfxyz/contracts/contracts/libraries/SelfUtils.sol";

/// @title DeployProofOfHuman
/// @notice Deployment script for ProofOfHuman contract using standard deployment
contract DeployProofOfHuman is BaseScript {
    // Custom errors for deployment verification
    error DeploymentFailed();

    /// @notice Main deployment function using standard deployment
    /// @return DisasterReliefFund The deployed DisasterReliefFund contract instance
    /// @dev Requires the following environment variables:
    ///      - IDENTITY_VERIFICATION_HUB_ADDRESS: Address of the Self Protocol verification hub
    ///      - SCOPE_SEED: Scope seed value (defaults to "self-workshop")

    function run() public broadcast returns (ProofOfHuman proofOfHuman) {
        address hubAddress = vm.envAddress("IDENTITY_VERIFICATION_HUB_ADDRESS");
        string memory scopeSeed = vm.envString("SCOPE_SEED");
        string[] memory forbiddenCountries = new string[](1);
        
        forbiddenCountries[0] = CountryCodes.TAIWAN;
        SelfUtils.UnformattedVerificationConfigV2 memory verificationConfig = SelfUtils.UnformattedVerificationConfigV2({
            olderThan: 18,
            forbiddenCountries: forbiddenCountries
        });

        // Deploy the contract using SCOPE_SEED from environment
        DisasterReliefFund = new DisasterReliefFund(hubAddress, scopeSeed, verificationConfig);

        // Log deployment information
        console.log("ProofOfHuman deployed to:", address(DisasterReliefFund));
        console.log("Identity Verification Hub:", hubAddress);
        console.log("Scope Value:", DisasterReliefFund.scope());

        // Verify deployment was successful
        if (address(DisasterReliefFund) == address(0)) revert DeploymentFailed();

        console.log("Deployment verification completed successfully!");
        console.log("Scope automatically generated from SCOPE_SEED:", scopeSeed);
    }
}
