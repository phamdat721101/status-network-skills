---
name: status-network-deploy
description: Deploy smart contracts to Status Network testnet. Use when setting up Hardhat or Foundry for Status Network, deploying contracts, running deployment scripts, or configuring deployment tooling for chain ID 49986.
---

# Status Network — Contract Deployment Workflows

## Option A — Hardhat

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init
```

```javascript
// hardhat.config.js
module.exports = {
  solidity: '0.8.26',
  networks: {
    statusTestnet: {
      url: 'https://rpc.testnet.status.network',
      chainId: 49986,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
```

```bash
npx hardhat run scripts/deploy.js --network statusTestnet
```

## Option B — Foundry

```bash
curl -L https://foundry.paradigm.xyz | bash && foundryup
forge init my-status-project && cd my-status-project
```

```toml
# foundry.toml
[rpc_endpoints]
status_testnet = "https://rpc.testnet.status.network"
```

```bash
forge script script/Deploy.s.sol --rpc-url status_testnet --broadcast --private-key $PRIVATE_KEY
```

## Option C — Remix (No-Setup)

1. Open [remix.ethereum.org](http://remix.ethereum.org)
2. Create and compile `SimpleStorage.sol` (v0.8.0+)
3. Deploy tab → Environment: **Injected Provider - MetaMask**
4. Select **Status Network Testnet** in MetaMask
5. Click **Deploy** → Confirm transaction
6. Verify at [sepoliascan.status.network](http://sepoliascan.status.network)

## Critical Rules

1. ALWAYS use `linea_estimateGas` (not `eth_estimateGas`) for fee estimation
2. ALWAYS include `from` address in gas estimation calls
3. NEVER hardcode fees — use returned values from RPC
4. Handle both gasless (baseFeePerGas=0) and premium fee states
5. Re-estimate near send time — Karma state can change
