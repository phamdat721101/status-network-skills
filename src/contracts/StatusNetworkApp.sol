// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

interface IKarma {
    function balanceOf(address account) external view returns (uint256);
    function slashedAmountOf(address account) external view returns (uint256);
}

interface IKarmaTiers {
    struct Tier {
        uint256 minKarma;
        uint256 maxKarma;
        string name;
        uint32 txPerEpoch;
    }
    function getTierIdByKarmaBalance(uint256 karmaBalance) external view returns (uint8);
    function getTierById(uint8 tierId) external view returns (Tier memory);
    function getTierCount() external view returns (uint256);
}

/// @title StatusNetworkApp — Karma-gated contract template
/// @notice Demonstrates feature gating, dynamic pricing, and governance patterns
contract StatusNetworkApp {
    IKarma public immutable karma;
    IKarmaTiers public immutable karmaTiers;

    event ActionExecuted(address indexed user, uint8 tier);

    constructor(address _karma, address _karmaTiers) {
        karma = IKarma(_karma);
        karmaTiers = IKarmaTiers(_karmaTiers);
    }

    // Pattern A — Feature Gating
    modifier onlyMinTier(uint8 minTier) {
        require(getUserTierId(msg.sender) >= minTier, "Insufficient Karma tier");
        _;
    }

    function getUserTierId(address user) public view returns (uint8) {
        return karmaTiers.getTierIdByKarmaBalance(karma.balanceOf(user));
    }

    function getUserTierName(address user) external view returns (string memory) {
        return karmaTiers.getTierById(getUserTierId(user)).name;
    }

    // Pattern B — Dynamic Pricing
    function calculateFee(address user, uint256 baseAmount) public view returns (uint256) {
        uint8 tierId = getUserTierId(user);
        uint256 discount = uint256(tierId) * 5; // 5% per tier
        return baseAmount * (100 - discount) / 100;
    }

    function premiumAction() external onlyMinTier(3) {
        emit ActionExecuted(msg.sender, getUserTierId(msg.sender));
    }
}
