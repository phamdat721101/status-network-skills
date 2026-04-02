---
name: status-network-setup
description: Configure Status Network (Ethereum L2, Linea zkEVM). Use when setting up RPC connections, adding chain to MetaMask, configuring ethers.js or viem for chain ID 49986, or connecting to Status Network testnet.
---

# Status Network — Network Setup & RPC Config

Status Network is a gasless Ethereum L2 built on Linea zkEVM rollup technology (Chain ID 49986).

## Network Parameters

```json
{
  "networkName": "Status Network Testnet",
  "chainId": "0xC342",
  "rpcUrl": "https://rpc.testnet.status.network",
  "nativeCurrency": { "name": "ETH", "symbol": "ETH", "decimals": 18 },
  "blockExplorerUrl": "https://sepoliascan.status.network"
}
```

## Add to MetaMask (Programmatic)

```javascript
await window.ethereum.request({
  method: 'wallet_addEthereumChain',
  params: [{
    chainId: '0xC342',
    chainName: 'Status Network Testnet',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://rpc.testnet.status.network'],
    blockExplorerUrls: ['https://sepoliascan.status.network']
  }]
});
```

## Configure ethers.js

```javascript
import { JsonRpcProvider } from 'ethers';
const provider = new JsonRpcProvider('https://rpc.testnet.status.network');
```

## Configure viem

```javascript
import { createPublicClient, http } from 'viem';
const client = createPublicClient({
  transport: http('https://rpc.testnet.status.network')
});
```

## Critical Rule

> ⚠️ ALWAYS use `linea_estimateGas` (not `eth_estimateGas`) for all fee estimation. Standard eth_ methods do NOT account for Karma or L2-specific pricing. ALWAYS include the `from` address.

## Key Links

| Resource | URL |
|----------|-----|
| RPC | `https://rpc.testnet.status.network` |
| Explorer | https://sepoliascan.status.network |
| Faucet | https://faucet.status.network |
| Bridge | https://bridge.status.network |
| Docs | https://docs.status.network |
| Contracts | https://docs.status.network/overview/general-info/contract-addresses/testnet-contracts |
