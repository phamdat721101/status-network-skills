---
name: status-network-karma
description: Integrate Karma reputation system on Status Network. Use when reading Karma balances, checking tier levels, implementing feature gating, dynamic pricing, reputation display, or weighted governance with IKarma and IKarmaTiers contracts.
---

# Status Network — Karma Reputation Integration

Karma is a soulbound ERC-20 (non-transferable, non-buyable) earned by:
- Staking SNT
- Bridging yield-bearing assets
- Providing liquidity
- Using apps on Status Network
- Paying premium gas fees
- Donating to the public funding pool

## Contract Interfaces

```solidity
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
```

> Contract addresses: [Testnet Contracts](https://docs.status.network/overview/general-info/contract-addresses/testnet-contracts)

## Pattern A — Feature Gating

```solidity
modifier onlyTier(uint8 minTier) {
    uint8 tierId = karmaTiers.getTierIdByKarmaBalance(karma.balanceOf(msg.sender));
    require(tierId >= minTier, "Karma tier too low");
    _;
}

function premiumAction() external onlyTier(3) {
    // Only tier 3+ users
}
```

## Pattern B — Dynamic Pricing

```solidity
function calculateFee(address user, uint256 baseAmount) public view returns (uint256) {
    uint8 tierId = karmaTiers.getTierIdByKarmaBalance(karma.balanceOf(user));
    uint256 discount = uint256(tierId) * 5; // 5% per tier
    return baseAmount * (100 - discount) / 100;
}
```

## Pattern C — Reputation Display (ethers.js)

```javascript
async function getUserKarmaTier(provider, karmaAddr, karmaTiersAddr, userAddress) {
  const karma = new Contract(karmaAddr, KARMA_ABI, provider);
  const karmaTiers = new Contract(karmaTiersAddr, KARMA_TIERS_ABI, provider);
  const balance = await karma.balanceOf(userAddress);
  const tierId = await karmaTiers.getTierIdByKarmaBalance(balance);
  const tier = await karmaTiers.getTierById(tierId);
  return { balance: balance.toString(), tierId, tierName: tier.name, txPerEpoch: tier.txPerEpoch };
}
```

## Pattern D — Karma-Weighted Governance

```solidity
function vote(uint256 proposalId, bool support) external {
    require(!hasVoted[proposalId][msg.sender], "Already voted");
    uint256 weight = karma.balanceOf(msg.sender);
    require(weight > 0, "No Karma — cannot vote");
    proposalVotes[proposalId] += support ? int256(weight) : -int256(weight);
    hasVoted[proposalId][msg.sender] = true;
}
```
