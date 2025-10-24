// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { SelfVerificationRoot } from "@selfxyz/contracts/contracts/abstract/SelfVerificationRoot.sol";
import { ISelfVerificationRoot } from "@selfxyz/contracts/contracts/interfaces/ISelfVerificationRoot.sol";
import "./IERC20.sol";


/**
 * @title DiasterReliefFund
 * @notice Payouts a bounty to users who pass a Self.identity verification that is configured
 *         to require a specific country, specific region (address area) and minimum age.
 *
 * @dev IMPORTANT: this contract assumes the Identity Verification Hub (passed in constructor)
 *      has a verification config (VerificationConfigV2) that enforces country/region/olderThan.
 *      The hub should therefore only call back with proofs that already satisfy those constraints.
 *      The contract itself trusts the hub's validation and uses the returned `nullifier` to
 *      prevent double-claims and `userIdentifier` as the payout recipient.
 */
contract DiasterReliefFund is SelfVerificationRoot, Ownable {

    // ERC20 token used for bounty (e.g., USDC)
    IERC20 public NTD_TOKEN;

    // bounty per eligible recipient
    uint256 public bountyAmount;

    // record of used nullifiers (prevents double claims)
    mapping(uint256 => bool) public hasClaimed;

    // verification config id stored locally and returned by getConfigId
    bytes32 public verificationConfigId;

    event BountyPaid(address indexed to, uint256 amount, uint256 nullifier);
    event BountyAmountUpdated(uint256 oldAmount, uint256 newAmount);
    event VerificationConfigIdUpdated(bytes32 oldId, bytes32 newId);

    error AlreadyClaimed();

    /**
     * @param identityVerificationHubAddress address of the Identity Verification Hub V2
     * @param scopeValue scope seed string (passed to parent)
     * @param token address of ERC20 token used for payouts
     * @param _bountyAmount amount to pay per eligible claimant
     */
    constructor(
        address identityVerificationHubAddress,
        string memory scopeValue,
        address token,
        uint256 _bountyAmount
    ) SelfVerificationRoot(identityVerificationHubAddress, scopeValue) Ownable(msg.sender) {
        // leave verificationConfigId empty for owner to set after registering config on the hub
        verificationConfigId = bytes32(0);
        payoutToken = IERC20(token);
        bountyAmount = _bountyAmount;
    }

    // --------------------------------------------------
    // Owner functions
    // --------------------------------------------------
    function setBountyAmount(uint256 newAmount) external onlyOwner {
        uint256 old = bountyAmount;
        bountyAmount = newAmount;
        emit BountyAmountUpdated(old, newAmount);
    }

    function setVerificationConfigId(bytes32 configId) external onlyOwner {
        bytes32 old = verificationConfigId;
        verificationConfigId = configId;
        emit VerificationConfigIdUpdated(old, configId);
    }

    function withdrawToken(address to, uint256 amount) external onlyOwner {
        payoutToken.safeTransfer(to, amount);
    }

    function getVerificationConfigId() external view returns (bytes32) {
        return verificationConfigId;
    }

    // --------------------------------------------------
    // SelfVerificationRoot overrides
    // --------------------------------------------------
    /**
     * @notice Return the verification config id that the hub should use for this verification
     * @dev We return the locally stored `verificationConfigId`. The deployer / owner should
     *      have previously created and stored the VerificationConfigV2 on the hub and set the ID here.
     */
    function getConfigId(
        bytes32, /* destinationChainId */
        bytes32, /* userIdentifier */
        bytes memory /* userDefinedData */
    ) public view override returns (bytes32) {
        return verificationConfigId;
    }

    /**
     * @notice Called by the parent after a successful verification from the hub
     * @dev This hook assumes the hub has enforced the country/region/age requirements in the
     *      verification config. The contract only checks nullifier for double-claims, then
     *      sends the configured bounty to `userIdentifier`.
     */
    function customVerificationHook(
        ISelfVerificationRoot.GenericDiscloseOutputV2 memory output,
        bytes memory /* userData */
    ) internal override {
        if (hasClaimed[output.nullifier]) revert AlreadyClaimed();

        // mark claimed to prevent double claim using nullifier from the hub
        hasClaimed[output.nullifier] = true;

        // recipient derived from userIdentifier's low 160 bits
        address recipient = address(uint160(output.userIdentifier));

        // transfer bounty
        payoutToken.safeTransfer(recipient, bountyAmount);

        emit BountyPaid(recipient, bountyAmount, output.nullifier);
    }
}
