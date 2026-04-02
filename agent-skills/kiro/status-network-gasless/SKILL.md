---
name: status-network-gasless
description: Implement gasless transactions on Status Network using linea_estimateGas. Use when building gas estimation, sending transactions, handling fee display, or working with Karma-aware gas pricing on Status Network.
---

# Status Network — Gasless Transaction Integration

Status Network extends Linea's `linea_estimateGas` RPC to be Karma-aware:

- Users with Karma quota → `baseFeePerGas = 0x0`, `priorityFeePerGas = 0x0` → **FREE**
- Deny-listed users (exceeded quota or spam) → **premium fee applied**

## Core Rule

> ⚠️ **ALWAYS** use `linea_estimateGas` as the single source of truth. Never hardcode fees. Always pass `from` address.

## Gas Estimation — ethers.js

```javascript
import { JsonRpcProvider } from 'ethers';
const provider = new JsonRpcProvider('https://rpc.testnet.status.network');

async function estimateGasKarmaAware(from, to, data = '0x') {
  return await provider.send('linea_estimateGas', [{ from, to, data, value: '0x0' }]);
}

async function sendGaslessTransaction(signer, to, data = '0x') {
  const from = await signer.getAddress();
  const estimate = await estimateGasKarmaAware(from, to, data);
  const tx = await signer.sendTransaction({
    to, data,
    gasLimit: estimate.gasLimit,
    maxFeePerGas: estimate.baseFeePerGas,
    maxPriorityFeePerGas: estimate.priorityFeePerGas,
  });
  return { tx, isGasless: estimate.baseFeePerGas === '0x0' };
}
```

## Gas Estimation — viem

```javascript
import { createPublicClient, http } from 'viem';
const publicClient = createPublicClient({
  transport: http('https://rpc.testnet.status.network')
});

async function lineaEstimateGas({ from, to, data = '0x' }) {
  return await publicClient.request({
    method: 'linea_estimateGas',
    params: [{ from, to, data, value: '0x0' }]
  });
}
```

## Handle UI Fee States

```javascript
async function buildTransactionUI(from, to, data) {
  const estimate = await estimateGasKarmaAware(from, to, data);
  const isGasless = BigInt(estimate.baseFeePerGas) === 0n
    && BigInt(estimate.priorityFeePerGas) === 0n;

  if (isGasless) {
    return { feeDisplay: '✅ FREE — Gasless Transaction', canSend: true };
  } else {
    const totalFee = BigInt(estimate.gasLimit) * BigInt(estimate.baseFeePerGas);
    return {
      feeDisplay: `⚠️ Premium fee: ${totalFee} wei`,
      note: 'Quota exceeded — pay fee or wait for window refresh.',
      canSend: true // Never hard-block
    };
  }
}
```

## Common Pitfalls

| ❌ Pitfall | ✅ Fix |
|-----------|--------|
| Using `eth_gasPrice`, `eth_maxPriorityFeePerGas` | Use `linea_estimateGas` |
| Omitting `from` in the call | Always pass sender address |
| Hardcoding `baseFeePerGas = 0` | Build UI from returned values |
| Assuming all users are gasless | Handle both: gasless and premium states |
| Caching estimates across retries | Re-estimate near send time |
