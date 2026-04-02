// Skill 3 — Karma Reputation Integration
// Karma = soulbound ERC-20 (non-transferable, non-buyable)
// Earned by: staking SNT, bridging, providing liquidity, using apps, paying premium gas, donating

import { Contract } from 'ethers';

const KARMA_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function slashedAmountOf(address account) view returns (uint256)',
];

const KARMA_TIERS_ABI = [
  'function getTierIdByKarmaBalance(uint256 karmaBalance) view returns (uint8)',
  'function getTierById(uint8 tierId) view returns (tuple(uint256 minKarma, uint256 maxKarma, string name, uint32 txPerEpoch))',
  'function getTierCount() view returns (uint256)',
];

export function createKarmaContracts(provider, karmaAddr, karmaTiersAddr) {
  return {
    karma: new Contract(karmaAddr, KARMA_ABI, provider),
    karmaTiers: new Contract(karmaTiersAddr, KARMA_TIERS_ABI, provider),
  };
}

// Pattern C — Reputation Display
export async function getUserKarmaTier(provider, karmaAddr, karmaTiersAddr, userAddress) {
  const { karma, karmaTiers } = createKarmaContracts(provider, karmaAddr, karmaTiersAddr);
  const balance = await karma.balanceOf(userAddress);
  const tierId = await karmaTiers.getTierIdByKarmaBalance(balance);
  const tier = await karmaTiers.getTierById(tierId);
  return {
    balance: balance.toString(),
    tierId,
    tierName: tier.name,
    txPerEpoch: tier.txPerEpoch,
  };
}

// Pattern B — Dynamic Pricing helper (off-chain)
export async function calculateDiscount(provider, karmaAddr, karmaTiersAddr, userAddress, baseAmount) {
  const { karma, karmaTiers } = createKarmaContracts(provider, karmaAddr, karmaTiersAddr);
  const balance = await karma.balanceOf(userAddress);
  const tierId = await karmaTiers.getTierIdByKarmaBalance(balance);
  const discount = BigInt(tierId) * 5n; // 5% per tier
  return (BigInt(baseAmount) * (100n - discount)) / 100n;
}
