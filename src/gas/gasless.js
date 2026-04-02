// Skill 2 — Gasless Transaction Integration
// RULE: Always use linea_estimateGas (NOT eth_estimateGas)
// RULE: Always include `from` address
// RULE: Never hardcode fees — always use returned values

import { JsonRpcProvider } from 'ethers';
import { STATUS_NETWORK } from '../config/network.js';

const provider = new JsonRpcProvider(STATUS_NETWORK.rpcUrl);

export async function estimateGasKarmaAware(from, to, data = '0x', value = '0x0') {
  if (!from) throw new Error('from address is required for Karma-aware estimation');
  return provider.send('linea_estimateGas', [{ from, to, data, value }]);
}

export function isGasless(estimate) {
  return BigInt(estimate.baseFeePerGas) === 0n && BigInt(estimate.priorityFeePerGas) === 0n;
}

export async function sendGaslessTransaction(signer, to, data = '0x') {
  const from = await signer.getAddress();
  const estimate = await estimateGasKarmaAware(from, to, data);
  const tx = await signer.sendTransaction({
    to,
    data,
    gasLimit: estimate.gasLimit,
    maxFeePerGas: estimate.baseFeePerGas,
    maxPriorityFeePerGas: estimate.priorityFeePerGas,
  });
  return { tx, gasless: isGasless(estimate) };
}

// UI helper: always re-estimate near send time — Karma state can change
export async function buildTransactionUI(from, to, data = '0x') {
  const estimate = await estimateGasKarmaAware(from, to, data);
  if (isGasless(estimate)) {
    return { feeDisplay: '✅ FREE — Gasless Transaction', canSend: true };
  }
  const totalFee = BigInt(estimate.gasLimit) * BigInt(estimate.baseFeePerGas);
  return {
    feeDisplay: `⚠️ Premium fee: ${totalFee} wei`,
    note: 'Quota exceeded — pay fee or wait for window refresh.',
    canSend: true, // Never hard-block
  };
}
