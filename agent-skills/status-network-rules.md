# Status Network — AI Agent Skills & Builder Toolkit

You are a Status Network developer assistant. Status Network is a gasless Ethereum L2 (Linea zkEVM), Chain ID 49986.

## Critical Rules — MUST FOLLOW

1. **ALWAYS** use `linea_estimateGas` (not `eth_estimateGas`) for all fee estimation
2. **ALWAYS** include `from` address in gas estimation calls
3. **NEVER** hardcode fees — use returned values from RPC
4. Handle both gasless (`baseFeePerGas=0`) and premium fee states
5. Re-estimate near send time — Karma state can change

## Network Config

```json
{
  "networkName": "Status Network Testnet",
  "chainId": 49986,
  "chainIdHex": "0xC342",
  "rpcUrl": "https://rpc.testnet.status.network",
  "blockExplorerUrl": "https://sepoliascan.status.network",
  "faucet": "https://faucet.status.network",
  "bridge": "https://bridge.status.network"
}
```

### ethers.js Setup

```javascript
import { JsonRpcProvider } from 'ethers';
const provider = new JsonRpcProvider('https://rpc.testnet.status.network');
```

### viem Setup

```javascript
import { createPublicClient, http } from 'viem';
const client = createPublicClient({
  transport: http('https://rpc.testnet.status.network')
});
```

### Add to MetaMask

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

## Gasless Transactions

Status Network extends Linea's `linea_estimateGas` to be Karma-aware:
- Users with Karma quota → `baseFeePerGas = 0x0`, `priorityFeePerGas = 0x0` → FREE
- Deny-listed users → premium fee applied

### Gas Estimation (ethers.js)

```javascript
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

### Gas Estimation (viem)

```javascript
async function lineaEstimateGas({ from, to, data = '0x' }) {
  return await publicClient.request({
    method: 'linea_estimateGas',
    params: [{ from, to, data, value: '0x0' }]
  });
}
```

### UI Fee States

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

### Pitfalls

| ❌ Pitfall | ✅ Fix |
|-----------|--------|
| Using `eth_gasPrice` | Use `linea_estimateGas` |
| Omitting `from` | Always pass sender address |
| Hardcoding `baseFeePerGas = 0` | Build UI from returned values |
| Assuming all users are gasless | Handle both states |
| Caching estimates | Re-estimate near send time |

## Karma Reputation

Karma is a soulbound ERC-20 (non-transferable, non-buyable) earned by staking SNT, bridging, providing liquidity, using apps, paying premium gas, or donating.

### Contract Interfaces

```solidity
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

Contract addresses: https://docs.status.network/overview/general-info/contract-addresses/testnet-contracts

### Feature Gating

```solidity
modifier onlyTier(uint8 minTier) {
    uint8 tierId = karmaTiers.getTierIdByKarmaBalance(karma.balanceOf(msg.sender));
    require(tierId >= minTier, "Karma tier too low");
    _;
}
```

### Dynamic Pricing

```solidity
function calculateFee(address user, uint256 baseAmount) public view returns (uint256) {
    uint8 tierId = karmaTiers.getTierIdByKarmaBalance(karma.balanceOf(user));
    uint256 discount = uint256(tierId) * 5;
    return baseAmount * (100 - discount) / 100;
}
```

### Reputation Display (ethers.js)

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

### Karma-Weighted Governance

```solidity
function vote(uint256 proposalId, bool support) external {
    require(!hasVoted[proposalId][msg.sender], "Already voted");
    uint256 weight = karma.balanceOf(msg.sender);
    require(weight > 0, "No Karma");
    proposalVotes[proposalId] += support ? int256(weight) : -int256(weight);
    hasVoted[proposalId][msg.sender] = true;
}
```

## Contract Deployment

### Hardhat

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

### Foundry

```toml
# foundry.toml
[rpc_endpoints]
status_testnet = "https://rpc.testnet.status.network"
```

```bash
forge script script/Deploy.s.sol --rpc-url status_testnet --broadcast --private-key $PRIVATE_KEY
```

### Remix

1. Open remix.ethereum.org
2. Compile contract (Solidity 0.8.0+)
3. Deploy → Injected Provider - MetaMask → Select Status Network Testnet
4. Verify at sepoliascan.status.network
