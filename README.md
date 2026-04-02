# Status Network — AI Agent Skills & Builder Toolkit

Gasless Ethereum L2 apps with composable privacy, Karma reputation, and native yield.

## Install Agent Skills

One command installs Status Network knowledge into all your AI coding agents:

```bash
bash install.sh
```

The script auto-detects which agents are installed and configures only those:

| Agent | Global Location | Format |
|-------|----------------|--------|
| Kiro | `~/.kiro/skills/status-network-*/` | 4 separate SKILL.md files |
| Claude Code | `~/.claude/CLAUDE.md` | Appended block |
| Cursor | `~/.cursor/rules/status-network.mdc` | Standalone file |
| GitHub Copilot | `~/.config/github-copilot/intellij/` | Appended block |
| Windsurf | `~/.codeium/windsurf/global_rules.md` | Appended block |
| Cline | `~/Documents/Cline/Rules/` | Standalone file |
| Antigravity | `~/.gemini/GEMINI.md` | Appended block |

To uninstall: `bash install.sh --uninstall`

## Quick Start

```bash
npm install
cp .env.example .env  # Add your PRIVATE_KEY
```

## Project Structure

```
src/
├── config/network.js       # Skill 1 — Network Setup & RPC Config
├── gas/gasless.js          # Skill 2 — Gasless Transaction Integration
├── karma/reputation.js     # Skill 3 — Karma Reputation Integration
├── contracts/
│   ├── StatusNetworkApp.sol # Karma-gated contract (feature gating + dynamic pricing)
│   └── KarmaGovernance.sol  # Karma-weighted governance
scripts/
└── deploy.js               # Skill 4 — Contract Deployment
```

## Deploy (Hardhat)

```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network statusTestnet
```

## Deploy (Foundry)

```bash
forge build
forge script script/Deploy.s.sol --rpc-url status_testnet --broadcast --private-key $PRIVATE_KEY
```

## Key Rules

- **ALWAYS** use `linea_estimateGas` (not `eth_estimateGas`) for fee estimation
- **ALWAYS** include `from` address in gas estimation calls
- **NEVER** hardcode fees — use returned values from RPC
- Handle both gasless (baseFeePerGas=0) and premium fee states
- Re-estimate near send time — Karma state can change

## Network Info

| Item | Detail |
|------|--------|
| Chain ID | 49986 (0xC342) |
| RPC | https://rpc.testnet.status.network |
| Explorer | https://sepoliascan.status.network |
| Faucet | https://faucet.status.network |
| Bridge | https://bridge.status.network |
| Docs | https://docs.status.network |
