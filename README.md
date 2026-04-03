# Status Network — AI Agent Skills & Builder Toolkit

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Chain ID](https://img.shields.io/badge/Chain_ID-49986-purple)](https://docs.status.network)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.26-363636)](https://soliditylang.org)

Gasless Ethereum L2 apps with composable privacy, Karma reputation, and native yield — powered by Linea zkEVM.

> **What is this?** A reference toolkit + AI agent skills that teach your coding assistant how to build on Status Network. One install command gives your AI agent deep knowledge of gasless transactions, Karma reputation, and contract deployment.

---

## Table of Contents

- [Install Agent Skills](#install-agent-skills)
- [Sample Prompts](#sample-prompts)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Skills Overview](#skills-overview)
- [Deploy](#deploy)
- [Key Rules](#key-rules)
- [Network Info](#network-info)
- [API Reference](#api-reference)
- [Contributing](#contributing)

---

## Install Agent Skills

One command installs Status Network knowledge into all your AI coding agents — no clone required:

```bash
npx github:phamdat721101/status-network-skills
```

To uninstall:

```bash
npx github:phamdat721101/status-network-skills --uninstall
```

The installer auto-detects which agents are present and configures only those:

| Agent | Global Location | Format |
|-------|----------------|--------|
| Kiro | `~/.kiro/skills/status-network-*/` | 4 separate SKILL.md files |
| Claude Code | `~/.claude/CLAUDE.md` | Appended block |
| Cursor | `~/.cursor/rules/status-network.mdc` | Standalone file |
| GitHub Copilot | `~/.config/github-copilot/intellij/` | Appended block |
| Windsurf | `~/.codeium/windsurf/global_rules.md` | Appended block |
| Cline | `~/Documents/Cline/Rules/` | Standalone file |
| Antigravity | `~/.gemini/GEMINI.md` | Appended block |

The installer is **idempotent** — run it again to update, and existing blocks are replaced in-place.

<details>
<summary>Alternative: install from cloned repo</summary>

```bash
git clone https://github.com/phamdat721101/status-network-skills.git
cd status-network-skills
bash install.sh
```

</details>

---

## Sample Prompts

After installing the skills, try these prompts with your AI coding agent.

### Quick Prompts

**Network Setup**
- *"Set up a new project connected to Status Network testnet using ethers.js"*
- *"Add Status Network to MetaMask programmatically in my React app"*

**Gasless Transactions**
- *"Implement a send button that auto-detects gasless vs premium fees on Status Network"*
- *"Show the user their transaction fee using linea_estimateGas with Karma awareness"*

**Karma Reputation**
- *"Display the current user's Karma tier and balance in a dashboard component"*
- *"Add a feature gate that only allows Gold tier (tier 3+) users to access premium features"*

**Contract Deployment**
- *"Create and deploy a Karma-gated NFT contract to Status Network testnet using Hardhat"*
- *"Set up Foundry for Status Network and deploy a simple storage contract"*

### Detailed Walkthrough — Building a Karma-Gated dApp

Use this multi-step prompt to build a complete feature:

```
I want to build a Karma-gated dApp on Status Network. Here's what I need:

1. Connect to Status Network testnet with ethers.js
2. Read the user's Karma balance and tier from the on-chain contracts
3. Show a dashboard with:
   - Karma balance and tier name (e.g., "Gold — 15,000 Karma")
   - Number of free transactions remaining this epoch
   - A "Premium Action" button that is only enabled for tier 3+
4. When the user clicks "Premium Action":
   - Estimate gas using linea_estimateGas (Karma-aware)
   - Show whether the transaction is FREE or has a premium fee
   - Send the transaction and display the result
5. Handle edge cases: wallet not connected, insufficient tier, fee changes

Use the Status Network toolkit patterns for all gas estimation and Karma lookups.
```

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env — add your PRIVATE_KEY and optionally KARMA_ADDRESS / KARMA_TIERS_ADDRESS

# 3. Compile contracts
npm run compile

# 4. Deploy to Status Network Testnet
npm run deploy:testnet
```

Need testnet ETH? Grab some from the [faucet](https://faucet.status.network) or [bridge](https://bridge.status.network) from Sepolia.

---

## Project Structure

```
├── bin/install.cjs                     # CLI installer (npx-compatible)
├── install.sh                          # Bash installer (legacy / cloned repo)
├── agent-skills/
│   ├── status-network-rules.md         # Combined rules (Claude, Cursor, Copilot, etc.)
│   └── kiro/
│       ├── status-network-setup/       # Skill 1 — Network & RPC config
│       ├── status-network-gasless/     # Skill 2 — Gasless transactions
│       ├── status-network-karma/       # Skill 3 — Karma reputation
│       └── status-network-deploy/      # Skill 4 — Contract deployment
├── src/
│   ├── index.js                        # Re-exports all modules
│   ├── config/network.js               # Network constants + MetaMask helper
│   ├── gas/gasless.js                  # Karma-aware gas estimation & sending
│   ├── karma/reputation.js             # Karma tier lookup & dynamic pricing
│   └── contracts/
│       ├── StatusNetworkApp.sol        # Feature gating + dynamic pricing template
│       └── KarmaGovernance.sol         # Karma-weighted voting
├── scripts/deploy.js                   # Hardhat deployment script
├── hardhat.config.cjs                  # Hardhat config (Status Network Testnet)
└── foundry.toml                        # Foundry config (Status Network Testnet)
```

---

## Skills Overview

The toolkit teaches AI agents four core skills:

### Skill 1 — Network Setup & RPC Config

Connect to Status Network, add the chain to MetaMask, and configure ethers.js or viem providers.

```javascript
import { STATUS_NETWORK, addToMetaMask } from 'status-network-toolkit';

console.log(STATUS_NETWORK.rpcUrl);  // https://rpc.testnet.status.network
await addToMetaMask();               // Prompts MetaMask to add the chain
```

### Skill 2 — Gasless Transaction Integration

Karma-aware gas estimation using `linea_estimateGas`. Users with Karma quota get free transactions (`baseFeePerGas = 0`); others pay a premium fee.

```javascript
import { estimateGasKarmaAware, sendGaslessTransaction, buildTransactionUI } from 'status-network-toolkit';

// Estimate fees (Karma-aware)
const estimate = await estimateGasKarmaAware(fromAddress, toAddress);

// Send a transaction (auto-detects gasless vs premium)
const { tx, gasless } = await sendGaslessTransaction(signer, toAddress);

// Build UI state for fee display
const ui = await buildTransactionUI(fromAddress, toAddress);
// → { feeDisplay: '✅ FREE — Gasless Transaction', canSend: true }
```

### Skill 3 — Karma Reputation Integration

Read Karma balances, resolve tier names, calculate dynamic discounts, and display reputation.

```javascript
import { getUserKarmaTier, calculateDiscount } from 'status-network-toolkit';

const tier = await getUserKarmaTier(provider, karmaAddr, tiersAddr, userAddress);
// → { balance: '15000', tierId: 3, tierName: 'Gold', txPerEpoch: 50 }

const fee = await calculateDiscount(provider, karmaAddr, tiersAddr, userAddress, 1000n);
// → 850n (15% discount for tier 3)
```

### Skill 4 — Contract Deployment

Deploy Karma-gated contracts using Hardhat, Foundry, or Remix.

```bash
# Hardhat
npx hardhat run scripts/deploy.js --network statusTestnet

# Foundry
forge script script/Deploy.s.sol --rpc-url status_testnet --broadcast --private-key $PRIVATE_KEY
```

---

## Deploy

### Hardhat

```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network statusTestnet
```

The Hardhat config (`hardhat.config.cjs`) is pre-configured for Status Network Testnet with contract sources in `src/contracts/`.

### Foundry

```bash
forge build
forge script script/Deploy.s.sol --rpc-url status_testnet --broadcast --private-key $PRIVATE_KEY
```

### Remix

1. Open [remix.ethereum.org](https://remix.ethereum.org)
2. Compile with Solidity 0.8.26
3. Deploy → Injected Provider (MetaMask) → Select Status Network Testnet
4. Verify at [sepoliascan.status.network](https://sepoliascan.status.network)

---

## Key Rules

These rules are critical for correct behavior on Status Network:

| # | Rule |
|---|------|
| 1 | **ALWAYS** use `linea_estimateGas` — never `eth_estimateGas` or `eth_gasPrice` |
| 2 | **ALWAYS** include `from` address in gas estimation calls |
| 3 | **NEVER** hardcode fees — use returned values from RPC |
| 4 | Handle both gasless (`baseFeePerGas=0`) and premium fee states |
| 5 | Re-estimate near send time — Karma state can change between estimation and submission |

### Common Pitfalls

| ❌ Pitfall | ✅ Fix |
|-----------|--------|
| Using `eth_gasPrice` | Use `linea_estimateGas` |
| Omitting `from` in estimation | Always pass sender address |
| Hardcoding `baseFeePerGas = 0` | Build UI from returned values |
| Assuming all users are gasless | Handle both free and premium states |
| Caching gas estimates | Re-estimate near send time |

---

## Network Info

| Item | Detail |
|------|--------|
| Chain ID | `49986` (`0xC342`) |
| RPC | https://rpc.testnet.status.network |
| Block Explorer | https://sepoliascan.status.network |
| Faucet | https://faucet.status.network |
| Bridge | https://bridge.status.network |
| Docs | https://docs.status.network |
| Contract Addresses | [Testnet Contracts](https://docs.status.network/overview/general-info/contract-addresses/testnet-contracts) |

---

## API Reference

### `src/config/network.js`

| Export | Description |
|--------|-------------|
| `STATUS_NETWORK` | Network constants (chainId, rpcUrl, explorer, faucet, bridge) |
| `addToMetaMask()` | Prompts MetaMask to add Status Network |

### `src/gas/gasless.js`

| Export | Description |
|--------|-------------|
| `estimateGasKarmaAware(from, to, data?, value?)` | Karma-aware gas estimation via `linea_estimateGas` |
| `isGasless(estimate)` | Returns `true` if both base and priority fees are zero |
| `sendGaslessTransaction(signer, to, data?)` | Send transaction with auto-detected fee mode |
| `buildTransactionUI(from, to, data?)` | Returns `{ feeDisplay, canSend, note? }` for UI rendering |

### `src/karma/reputation.js`

| Export | Description |
|--------|-------------|
| `createKarmaContracts(provider, karmaAddr, tiersAddr)` | Returns `{ karma, karmaTiers }` contract instances |
| `getUserKarmaTier(provider, karmaAddr, tiersAddr, user)` | Returns `{ balance, tierId, tierName, txPerEpoch }` |
| `calculateDiscount(provider, karmaAddr, tiersAddr, user, baseAmount)` | Returns discounted amount (5% per tier) |

### `src/contracts/StatusNetworkApp.sol`

| Function | Description |
|----------|-------------|
| `getUserTierId(address)` | Get user's Karma tier ID |
| `getUserTierName(address)` | Get user's tier name |
| `calculateFee(address, uint256)` | Dynamic pricing with tier-based discount |
| `premiumAction()` | Example gated function (requires tier ≥ 3) |

### `src/contracts/KarmaGovernance.sol`

| Function | Description |
|----------|-------------|
| `vote(uint256 proposalId, bool support)` | Karma-weighted vote on a proposal |
| `proposalVotes(uint256)` | Net vote tally for a proposal |

---

## Contributing

1. Fork the repo
2. Add or improve agent skills in `agent-skills/`
3. Test the installer: `node bin/install.cjs` or `bash install.sh`
4. Submit a PR

---

## License

MIT
